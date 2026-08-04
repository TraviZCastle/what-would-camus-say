import { expect, test } from '@playwright/test';

test('homepage is readable, transparent, and ready for a question', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('What Would Camus Say');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Camus Say?');
  await expect(page.getByText('不代表加缪本人，也不是加缪原话')).toBeVisible();
  await expect(page.getByLabel('现实问题')).toBeVisible();
  await expect(page.getByRole('button', { name: '开始思想推演' })).toBeEnabled();
});

test('question flow produces a traceable result and can reset', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('现实问题').fill('每天重复上班，我不知道为什么还要继续。');
  await page.getByRole('button', { name: '开始思想推演' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('从加缪思想看');
  await expect(page.getByRole('article', { name: '思想推演结果' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '看见困境' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '思想来源' })).toBeVisible();

  await page.getByText('为什么找到这些思想').click();
  await expect(page.getByText(/问题与“.+”主题相关/)).toBeVisible();

  await page.getByRole('button', { name: '有帮助', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('不包含你的问题文本');

  await page.getByRole('button', { name: '← 重新提问' }).click();
  await expect(page.getByLabel('现实问题')).toBeFocused();
});

test('short questions are rejected without leaving the page', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('现实问题').fill('怎么办');
  await page.getByRole('button', { name: '开始思想推演' }).click();

  await expect(page.getByRole('alert')).toContainText('请至少写 10 个字符');
  await expect(page.getByLabel('现实问题')).toBeFocused();
});

test('immediate danger is routed before philosophical retrieval', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('现实问题').fill('我准备跳楼，现在一个人在楼顶。');
  await page.getByRole('button', { name: '开始思想推演' }).click();

  await expect(page.getByText('安全优先 · 此次未执行哲学检索')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '先把你的现实安全放在第一位',
  );
  await expect(page.getByRole('heading', { name: '请立即做这些事' })).toBeVisible();
  await expect(page.getByRole('article', { name: '思想推演结果' })).toHaveCount(0);
});

test('the raw question never enters requests or the URL', async ({ page }) => {
  const privateMarker = '私密标记QZ91';
  await page.goto('/');
  await expect(page.getByRole('button', { name: '开始思想推演' })).toBeEnabled();

  const requestUrls: string[] = [];
  page.on('request', (request) => requestUrls.push(request.url()));
  await page
    .getByLabel('现实问题')
    .fill(`我正在衡量是否离开一份每天重复但稳定的工作。${privateMarker}`);
  await page.getByRole('button', { name: '开始思想推演' }).click();

  await expect(page.getByRole('article', { name: '思想推演结果' })).toBeVisible();
  expect(page.url()).not.toContain(privateMarker);
  expect(page.url()).not.toContain(encodeURIComponent(privateMarker));
  expect(requestUrls.every((url) => !url.includes(privateMarker))).toBe(true);
  expect(
    requestUrls.every((url) => !url.includes(encodeURIComponent(privateMarker))),
  ).toBe(true);
});

test('the core flow is operable by keyboard with managed focus', async ({ page }) => {
  await page.goto('/');
  const question = page.getByLabel('现实问题');
  await question.focus();
  await page.keyboard.type('两个选择都有代价，我怎样承担自己的决定？');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: '开始思想推演' })).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  const explanation = page.getByText('为什么找到这些思想');
  await explanation.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/问题与“.+”主题相关/)).toBeVisible();

  const reset = page.getByRole('button', { name: '← 重新提问' });
  await reset.focus();
  await page.keyboard.press('Enter');
  await expect(question).toBeFocused();
});

test('method, source, privacy, and boundary details are publicly reachable', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: '方法与边界' }).click();

  await expect(page).toHaveURL(/#method$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('这不是在模仿加缪');
  await expect(page.getByRole('heading', { name: '一次回答如何形成' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '你的问题如何处理' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '来源目录' })).toBeVisible();

  await page.getByRole('link', { name: '← 返回提问' }).click();
  await expect(page.getByLabel('现实问题')).toBeVisible();
});
