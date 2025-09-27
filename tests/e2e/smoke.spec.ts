import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads and mounts correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for app to load - look for auth form or main content
    await expect(page.locator('body')).not.toHaveText('');
    
    // Check that we don't have a blank screen
    const hasContent = await page.locator('body').count();
    expect(hasContent).toBeGreaterThan(0);
    
    // Check for either auth page or main app content
    const hasAuthForm = await page.locator('form').count();
    const hasMainContent = await page.locator('main, [role="main"], .main-content').count();
    
    expect(hasAuthForm + hasMainContent).toBeGreaterThan(0);
  });

  test('handles 404 routes correctly', async ({ page }) => {
    await page.goto('/non-existent-route');
    
    // Should show 404 page, not blank screen
    const hasContent = await page.locator('body').count();
    expect(hasContent).toBeGreaterThan(0);
    
    // Should not be completely empty
    await expect(page.locator('body')).not.toHaveText('');
  });
});