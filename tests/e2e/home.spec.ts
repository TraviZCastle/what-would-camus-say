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
