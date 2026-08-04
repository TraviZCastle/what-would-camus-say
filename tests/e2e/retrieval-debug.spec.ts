import { expect, test } from '@playwright/test';

test('development debug view explains local retrieval', async ({ page }) => {
  await page.goto('/#retrieval-debug');

  await expect(page.getByRole('heading', { name: 'BM25 检索调试' })).toBeVisible();
  await page.getByLabel('测试问题').fill('每天重复上班，我不知道为什么还要继续');
  await page.getByRole('button', { name: '运行本地检索' }).click();

  const ranking = page.getByRole('list', { name: 'BM25 排名' });
  await expect(ranking.getByText('清醒地面对重复劳动')).toBeVisible();
  await expect(page.getByText(/分词：/)).toBeVisible();
});
