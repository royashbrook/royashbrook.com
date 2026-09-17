import { test, expect } from '@playwright/test';

test('homepage is an introduction with named links and a working keyboard skip', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'roy ashbrook' })).toBeVisible();
  await expect(page.locator('#projects article')).toHaveCount(3);
  const repoLinks = page.locator('#projects article a').filter({ hasText: /^repo$/ });
  for (const link of await repoLinks.all()) await expect(link).toHaveAccessibleName(/.+: repo/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('link', { name: 'all projects →', exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'main' }).getByRole('link', { name: 'projects', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('homepage and complete directories fit a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/projects/', '/games/', '/skills/']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('navigation', { name: 'main' }).getByRole('link', { name: 'writing', exact: true })).toBeInViewport();
  }
});
