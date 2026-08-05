import { expect, test, type Page } from '@playwright/test';

async function openQuestionPanel(page: Page) {
  await page.getByRole('button', { name: 'Describe your dilemma' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
}

test('homepage uses the approved black portrait and opens a private question panel', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveTitle('What Would Camus Say');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Camus say?');
  await expect(page.getByAltText(/black-and-white editorial portrait/i)).toBeVisible();
  await expect(page.locator('.ember')).toHaveCount(1);
  await expect(page.locator('.smoke')).toHaveCount(3);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('.question-drawer')).toHaveAttribute('inert', '');
  await openQuestionPanel(page);
  await expect(page.getByText('Auto-detected: English')).toBeVisible();
  await expect(page.getByLabel('Real-life dilemma')).toBeFocused();
  await expect(
    page.getByRole('button', { name: 'Begin the thought exercise →' }),
  ).toBeEnabled();
});

test('Chinese input automatically switches the interface and produces a traceable result', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPanel(page);

  await page
    .getByLabel('Real-life dilemma')
    .fill('每天重复上班，我不知道为什么还要继续。');
  await expect(page.getByText('自动识别：中文')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.getByRole('button', { name: '开始思想推演 →' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('从加缪思想看');
  await expect(page.getByRole('article', { name: '思想推演结果' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '看见困境' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '思想来源' })).toBeVisible();

  await page.getByText('为什么找到这些思想').click();
  await expect(page.getByText(/问题与“.+”主题相关/)).toBeVisible();
  await page.getByRole('button', { name: '有帮助', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('不包含你的问题文本');
});

test('English input uses the English index and English deterministic answer', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPanel(page);

  await page
    .getByLabel('Real-life dilemma')
    .fill('Both choices carry a cost. How do I decide which consequence I can accept?');
  await page.getByRole('button', { name: 'Begin the thought exercise →' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Through a Camusian lens',
  );
  await expect(
    page.getByRole('article', { name: 'Thought exercise result' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The dilemma' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'A Camusian perspective' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
  await expect(page.getByText(/[一-鿿]/)).toHaveCount(0);
});

test('short questions are rejected in the automatically detected language', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPanel(page);
  await page.getByLabel('Real-life dilemma').fill('Why?');
  await page.getByRole('button', { name: 'Begin the thought exercise →' }).click();

  await expect(page.getByRole('alert')).toContainText('at least 10 characters');
  await expect(page.getByLabel('Real-life dilemma')).toBeFocused();
});

test('English immediate danger is routed before philosophical retrieval', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPanel(page);
  await page
    .getByLabel('Real-life dilemma')
    .fill('I am going to kill myself and I am about to jump right now.');
  await page.getByRole('button', { name: 'Begin the thought exercise →' }).click();

  await expect(
    page.getByText('Safety first · Philosophical retrieval was not run'),
  ).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Put your immediate safety first',
  );
  await expect(
    page.getByRole('heading', { name: 'Please do these things now' }),
  ).toBeVisible();
  await expect(
    page.getByRole('article', { name: 'Thought exercise result' }),
  ).toHaveCount(0);
});

test('the raw question never enters requests or the URL', async ({ page }) => {
  const privateMarker = 'PrivateMarkerQZ91';
  await page.goto('/');
  await openQuestionPanel(page);

  const requestUrls: string[] = [];
  page.on('request', (request) => requestUrls.push(request.url()));
  await page
    .getByLabel('Real-life dilemma')
    .fill(`I am deciding whether to leave a repetitive but stable job. ${privateMarker}`);
  await page.getByRole('button', { name: 'Begin the thought exercise →' }).click();

  await expect(
    page.getByRole('article', { name: 'Thought exercise result' }),
  ).toBeVisible();
  expect(page.url()).not.toContain(privateMarker);
  expect(page.url()).not.toContain(encodeURIComponent(privateMarker));
  expect(requestUrls.every((url) => !url.includes(privateMarker))).toBe(true);
  expect(
    requestUrls.every((url) => !url.includes(encodeURIComponent(privateMarker))),
  ).toBe(true);
});

test('the core flow is operable by keyboard with managed focus', async ({ page }) => {
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Describe your dilemma' });
  await opener.focus();
  await page.keyboard.press('Enter');

  const question = page.getByLabel('Real-life dilemma');
  await expect(question).toBeFocused();
  await page.keyboard.type(
    'Both choices carry a cost. How should I take responsibility?',
  );
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Begin the thought exercise →' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  const explanation = page.getByText('Why these ideas were found');
  await explanation.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/The question relates to/)).toBeVisible();

  const reset = page.getByRole('button', { name: '← Ask another question' });
  await reset.focus();
  await page.keyboard.press('Enter');
  await expect(question).toBeFocused();
});

test('method, source, privacy, and bilingual details are publicly reachable', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPanel(page);
  await page.getByText('How it works', { exact: true }).click();
  await page.getByRole('link', { name: /Read the full method/ }).click();

  await expect(page).toHaveURL(/#method$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'This is not an imitation of Camus',
  );
  await expect(
    page.getByRole('heading', { name: 'How one response is formed' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'How your question is handled' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Source catalog' })).toBeVisible();
  await expect(
    page.getByText(/automatically selects the Chinese or English index/),
  ).toBeVisible();
});
