import { expect, test } from '@playwright/test';

test('Phase 0 homepage is readable and transparent', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('What Would Camus Say');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Camus Say?');
  await expect(page.getByLabel('产品边界说明')).toContainText('不代表加缪本人');
  await expect(page.getByRole('status')).toContainText('Phase 0');
});
