import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail CI if test.only is accidentally committed */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests on CI */
  retries: process.env.CI ? 2 : 0,

  /* Use one worker on Jenkins/CI */
  workers: process.env.CI ? 1 : undefined,

  /*
   * Reporters
   *
   * HTML   -> reports/
   * JUnit  -> reports/results.xml
   * Allure -> allure-results/
   */
  reporter: [
    [
      'html',
      {
        outputFolder: 'reports',
        open: 'never',
      },
    ],

    [
      'junit',
      {
        outputFile: 'reports/results.xml',
      },
    ],

    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
      },
    ],
  ],

  /* Shared settings for all tests */
  use: {
    /*
     * Collect trace when a test is retried.
     */
    trace: 'on-first-retry',
  },

  /* Browser projects */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },

    /*
     * Mobile browsers - currently disabled
     */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },

    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /*
     * Branded browsers - currently disabled
     */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     channel: 'msedge',
    //   },
    // },

    // {
    //   name: 'Google Chrome',
    //   use: {
    //     ...devices['Desktop Chrome'],
    //     channel: 'chrome',
    //   },
    // },
  ],

  /*
   * Local development server - currently disabled
   */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});