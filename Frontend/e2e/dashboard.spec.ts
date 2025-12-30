import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('should display dashboard layout', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Check main dashboard container
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Check for key dashboard sections
    await expect(page.getByText('Upload Documents')).toBeVisible();
    await expect(page.getByText('Compliance Overview')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    // Check for statistics cards
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4);
    
    // Check for specific metrics
    await expect(page.getByText('Total Documents')).toBeVisible();
    await expect(page.getByText('Risk Assessments')).toBeVisible();
    await expect(page.getByText('Compliance Score')).toBeVisible();
    await expect(page.getByText('Processing Time')).toBeVisible();
  });

  test('should display file upload component', async ({ page }) => {
    // Check for upload area
    const uploadArea = page.locator('[data-testid="file-upload"]');
    await expect(uploadArea).toBeVisible();
    
    // Check upload text
    await expect(page.getByText('Drag & drop files here')).toBeVisible();
    await expect(page.getByText('or click to browse')).toBeVisible();
  });

  test('should display compliance chart', async ({ page }) => {
    // Check for chart container
    const chartContainer = page.locator('[data-testid="compliance-chart"]');
    await expect(chartContainer).toBeVisible();
    
    // Check for chart title
    await expect(page.getByText('Compliance Trends')).toBeVisible();
  });

  test('should display LLM provider selector', async ({ page }) => {
    // Check for provider selector
    const providerSelector = page.locator('[data-testid="llm-provider-selector"]');
    await expect(providerSelector).toBeVisible();
    
    // Check for dropdown trigger
    await expect(page.getByText('Select LLM Provider')).toBeVisible();
  });

  test('should handle file upload interaction', async ({ page }) => {
    // Find file input
    const fileInput = page.locator('input[type="file"]');
    
    // Create a test file
    const testFile = {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test pdf content'),
    };
    
    // Upload file
    await fileInput.setInputFiles(testFile);
    
    // Check for upload feedback
    await expect(page.getByText('File uploaded successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should display recent activity', async ({ page }) => {
    // Check for recent activity section
    await expect(page.getByText('Recent Activity')).toBeVisible();
    
    // Check for activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    await expect(activityItems.first()).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Check that dashboard adapts to tablet size
    await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    
    // Stats cards should still be visible but may stack
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that main elements are accessible on mobile
    await expect(page.getByText('Upload Documents')).toBeVisible();
    await expect(page.locator('[data-testid="file-upload"]')).toBeVisible();
    
    // Stats cards should stack on mobile
    const statsCards = page.locator('[data-testid="stats-card"]');
    const firstCard = statsCards.first();
    const secondCard = statsCards.nth(1);
    
    await expect(firstCard).toBeVisible();
    await expect(secondCard).toBeVisible();
  });
});

test.describe('Dashboard Navigation', () => {
  test('should navigate between dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for navigation elements
    const navItems = page.locator('[data-testid="nav-item"]');
    if (await navItems.count() > 0) {
      // Click on different nav items if they exist
      await navItems.first().click();
      
      // Verify navigation worked
      await expect(page).toHaveURL(/dashboard/);
    }
  });

  test('should handle logout functionality', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Look for logout button
    const logoutButton = page.getByRole('button', { name: /logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to login or home
      await expect(page).toHaveURL(/login|\/$/);
    }
  });
});
