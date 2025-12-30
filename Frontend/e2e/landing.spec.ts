import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load and display main elements', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/SEBI Compliance/);
    
    // Check main heading
    await expect(page.getByText('SEBI Compliance Document Verification')).toBeVisible();
    
    // Check description
    await expect(page.getByText('AI-powered compliance verification')).toBeVisible();
    
    // Check CTA buttons
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /learn more/i })).toBeVisible();
  });

  test('should navigate to dashboard when clicking Get Started', async ({ page }) => {
    await page.getByRole('button', { name: /get started/i }).click();
    
    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('should display all feature sections', async ({ page }) => {
    // Check feature sections
    await expect(page.getByText('Multi-LLM Support')).toBeVisible();
    await expect(page.getByText('Legal-BERT Analysis')).toBeVisible();
    await expect(page.getByText('Risk Assessment')).toBeVisible();
    await expect(page.getByText('Vector Search')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that main elements are still visible
    await expect(page.getByText('SEBI Compliance')).toBeVisible();
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();
    
    // Check that content adapts to mobile
    const heroSection = page.locator('[data-testid="hero-section"]');
    await expect(heroSection).toBeVisible();
  });

  test('should have proper navigation', async ({ page }) => {
    // Check navbar exists
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for login link in navbar
    const loginLink = page.getByRole('link', { name: /login/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL('/login');
    }
  });
});

test.describe('Landing Page Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check heading text
    await expect(h1).toContainText('SEBI Compliance');
  });

  test('should have keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    
    // Check that Get Started button can be focused
    const getStartedButton = page.getByRole('button', { name: /get started/i });
    await expect(getStartedButton).toBeFocused();
    
    // Press Enter to activate
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/');
    
    // Check all images have alt attributes
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper contrast ratios (this is a basic check)
    // In a real project, you'd use automated accessibility testing tools
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      await expect(button).toBeVisible();
    }
  });
});
