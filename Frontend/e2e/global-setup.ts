import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const project = config.projects[0];
  
  if (!project) {
    throw new Error('No projects defined in playwright config');
  }
  
  const { baseURL } = project.use;
  
  if (!baseURL) {
    throw new Error('baseURL is not defined in playwright config');
  }

  // Create a browser instance for global setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for the application to be ready
    await page.goto(baseURL);
    await page.waitForSelector('body', { timeout: 30000 });
    console.log('✓ Application is ready for testing');
  } catch (error) {
    console.error('Application is not ready:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
