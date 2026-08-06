import { expect, test, type Page } from '@playwright/test';

async function openQuestionPage(page: Page) {
  await page.getByRole('button', { name: 'Describe your dilemma' }).click();
  await expect(page.locator('.question-page')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'State the question.' })).toBeVisible();
}

test('homepage uses the approved black portrait and opens a restrained question page', async ({
  page,
}) => {
  await page.goto('/');

  await expect(page).toHaveTitle('What Would Camus Say');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Camus say?');
  await expect(page.getByText('What Would Camus Say?', { exact: true })).toBeVisible();
  await expect(
    page.getByText('“The absurd is the essential concept and the first truth.”'),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Bring a real question to Camus. His ideas will guide a grounded interpretation.',
    ),
  ).toBeVisible();
  await expect(page.getByAltText(/black-and-white editorial portrait/i)).toBeVisible();
  await expect(page.locator('.ember')).toHaveCount(1);
  await expect(page.locator('.ember')).toHaveCSS('box-shadow', /rgba\(185, 72, 35/);
  await expect(page.locator('.smoke')).toHaveCount(3);
  expect(
    await page
      .locator('.ember')
      .evaluate((element) =>
        getComputedStyle(element, '::before').getPropertyValue('display'),
      ),
  ).toBe('none');
  await expect(page.locator('.question-page')).toHaveCount(0);
  await openQuestionPage(page);
  await expect(page.getByText('A question for Camus')).toBeVisible();
  await expect(page.getByText('Private · Processed in this browser')).toBeVisible();
  await expect(page.getByText('Answer language follows your question')).toHaveCount(0);
  await expect(page.getByText('How it works', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Read the full method/ })).toHaveCount(0);
  await expect(page.getByLabel('Real-life dilemma')).toBeFocused();
  await expect(page.getByRole('button', { name: 'Bring it to Camus' })).toBeEnabled();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('mobile portrait fills the stage as a right-side background with balanced controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const stage = page.locator('.hero-stage');
  const portrait = page.locator('.hero-portrait');
  const stageBox = await stage.boundingBox();
  const portraitBox = await portrait.boundingBox();

  expect(stageBox).not.toBeNull();
  expect(portraitBox).not.toBeNull();
  expect(portraitBox?.width).toBeCloseTo(stageBox?.width ?? 0, 0);
  expect(portraitBox?.height).toBeCloseTo(stageBox?.height ?? 0, 0);
  await expect(portrait).toHaveCSS('position', 'absolute');
  await expect(portrait).toHaveCSS('object-fit', 'cover');
  await expect(portrait).toHaveCSS('object-position', '60% 50%');
  await expect(
    page.getByRole('button', { name: 'Describe your dilemma' }),
  ).toBeInViewport();
  await expect(page.locator('.hero-copy')).toBeInViewport();

  await openQuestionPage(page);
  const questionPortrait = page.locator('.question-page-portrait');
  await expect(questionPortrait).toHaveCSS('position', 'fixed');
  await expect(questionPortrait).toHaveCSS('object-fit', 'cover');
  await expect(questionPortrait).toHaveCSS('object-position', '60% 50%');
  await expect(page.getByRole('button', { name: 'Bring it to Camus' })).toBeInViewport();
});

test('Chinese input keeps the form in English and produces a Chinese traceable result', async ({
  page,
}) => {
  const question = '每天重复上班，我不知道为什么还要继续。';
  await page.goto('/');
  await openQuestionPage(page);

  await page.getByLabel('Real-life dilemma').fill(question);
  await expect(page.getByText('Answer language follows your question')).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'State the question.' })).toBeVisible();
  await page.getByRole('button', { name: 'Bring it to Camus' }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('从加缪思想看');
  const article = page.getByRole('article', { name: '思想推演结果' });
  await expect(article).toBeVisible();
  await expect(article.locator('.answer-prose > p')).toBeVisible();
  await expect(page.locator('.result-portrait img')).toBeVisible();
  await expect(article.locator('blockquote')).toBeVisible();
  await expect(article.locator('.quote-source-text')).toHaveAttribute('lang', /en|fr/);
  await expect(article.locator('.quote-translation')).toContainText(/[一-鿿]/);
  await expect(article.locator('blockquote footer cite')).toContainText('Albert Camus');
  await expect(article.locator('blockquote footer span')).toHaveCount(0);
  await expect(article.getByText('留给你的问题')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '看见困境' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '思想来源' })).toHaveCount(0);
  await expect(page.getByText('为什么找到这些思想')).toHaveCount(0);
  await expect(page.getByText('相关主题')).toHaveCount(0);
  await expect(page.getByText('这次推演有帮助吗？')).toHaveCount(0);
  await expect(page.locator('.submitted-question')).toHaveText(question);
  await expect(page.getByText(question, { exact: true })).toHaveCount(1);
  await expect(page.getByText(/你提出的是/)).toHaveCount(0);

  await page.getByRole('button', { name: '← 重新提问' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'State the question.' })).toBeVisible();
});

test('an abstract question about suicide receives a direct Camus-grounded answer', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPage(page);

  await page
    .getByLabel('Real-life dilemma')
    .fill('自杀是唯一严肃的哲学问题，这句话对加缪意味着什么？');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Bring it to Camus' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('从加缪思想看');
  await expect(page.getByRole('article', { name: '思想推演结果' })).toContainText(
    '加缪把自杀放在开端',
  );
  await expect(page.getByText('安全优先 · 此次未执行哲学检索')).toHaveCount(0);
});

test('English input uses the English index and English deterministic answer', async ({
  page,
}) => {
  const question =
    'Both choices carry a cost. How do I decide which consequence I can accept?';
  await page.goto('/');
  await openQuestionPage(page);

  await page.getByLabel('Real-life dilemma').fill(question);
  await page.getByRole('button', { name: 'Bring it to Camus' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Through a Camusian lens',
  );
  await expect(
    page.getByRole('article', { name: 'Thought exercise result' }),
  ).toBeVisible();
  const article = page.getByRole('article', { name: 'Thought exercise result' });
  await expect(article.locator('.answer-prose > p')).toBeVisible();
  const resultPortrait = page.locator('.result-portrait');
  const resultPortraitImage = resultPortrait.locator('img');
  await expect(resultPortraitImage).toBeVisible();
  await expect(resultPortrait).toHaveCSS('position', 'fixed');
  const viewport = page.viewportSize();
  await expect(resultPortraitImage).toHaveCSS(
    'object-fit',
    viewport && viewport.width <= 720 ? 'cover' : 'contain',
  );
  if (viewport && viewport.width <= 720) {
    await expect(resultPortraitImage).toHaveCSS('object-position', '60% 50%');
  }
  await expect(article.locator('blockquote')).toBeVisible();
  await expect(article.locator('.quote-source-text')).toHaveAttribute('lang', /en|fr/);
  await expect(article.locator('blockquote footer cite')).toContainText('Albert Camus');
  await expect(article.locator('blockquote footer span')).toHaveCount(0);
  await expect(article.getByText('A question to keep')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'The dilemma' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'A Camusian perspective' })).toHaveCount(
    0,
  );
  await expect(page.getByRole('heading', { name: 'Sources' })).toHaveCount(0);
  await expect(page.getByText(/[一-鿿]/)).toHaveCount(0);
  await expect(page.locator('.submitted-question')).toHaveText(question);
  await expect(page.getByText(question, { exact: true })).toHaveCount(1);
  await expect(page.getByText(/Your question is/)).toHaveCount(0);
  expect(
    await page
      .locator('html')
      .evaluate((element) => element.scrollWidth - element.clientWidth),
  ).toBeLessThanOrEqual(0);
});

test('short questions are rejected without changing the English input interface', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPage(page);
  await page.getByLabel('Real-life dilemma').fill('Why?');
  await page.getByRole('button', { name: 'Bring it to Camus' }).click();

  await expect(page.getByRole('alert')).toContainText('at least 10 characters');
  await expect(page.getByLabel('Real-life dilemma')).toBeFocused();
});

test('English immediate danger is routed before philosophical retrieval', async ({
  page,
}) => {
  await page.goto('/');
  await openQuestionPage(page);
  await page
    .getByLabel('Real-life dilemma')
    .fill('I am going to kill myself and I am about to jump right now.');
  await page.getByRole('button', { name: 'Bring it to Camus' }).click();

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
  await openQuestionPage(page);

  const requestUrls: string[] = [];
  page.on('request', (request) => requestUrls.push(request.url()));
  await page
    .getByLabel('Real-life dilemma')
    .fill(`I am deciding whether to leave a repetitive but stable job. ${privateMarker}`);
  await page.getByRole('button', { name: 'Bring it to Camus' }).click();

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
  await expect(page.getByRole('button', { name: 'Bring it to Camus' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  const reset = page.getByRole('button', { name: '← Ask another question' });
  await reset.focus();
  await page.keyboard.press('Enter');
  await expect(question).toBeFocused();
});

test('the standalone method route retains its source, privacy, and bilingual details', async ({
  page,
}) => {
  await page.goto('/#method');
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
  await expect(page.getByText(/input interface stays in English/)).toBeVisible();
});
