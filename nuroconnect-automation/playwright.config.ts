import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import { testEnvironment } from './src/config/environment';

const orderedFlow = process.env.ORDERED_FLOW === 'true';
const mergeReports = process.env.MERGE_REPORTS === 'true';
const flowIndex = process.env.FLOW_INDEX ?? '00';
const flowProject = process.env.FLOW_PROJECT ?? 'project';
const artifactId = `${flowIndex}-${flowProject}`;

const mergedReporters: ReporterDescription[] = [
  ['html', { outputFolder: 'reports/html', open: 'never' }],
  ['junit', { outputFile: 'reports/junit/results.xml' }]
];

export default defineConfig({
  testDir: './tests',
  globalSetup: './src/config/globalSetup.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 100_000,
  expect: {
    timeout: 20_000
  },
  reporter: mergeReports ? mergedReporters : orderedFlow ? [
    ['list'],
    ['blob', { outputFile: `reports/blob/${artifactId}.zip` }],
    ['json', { outputFile: `reports/json/${artifactId}.json` }],
    ['allure-playwright', { resultsDir: 'reports/allure-results', detail: false, suiteTitle: false }]
  ] : [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    [
      'allure-playwright',
      {
        resultsDir: 'reports/allure-results',
        detail: false,
        suiteTitle: false,
        environmentInfo: {
          environment: testEnvironment.name,
          browser: 'chromium'
        }
      }
    ]
  ],
  use: {
    headless: false,
    baseURL: testEnvironment.baseUrl,
    screenshot: 'only-on-failure',
    trace: 'off',
    video: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 30_000
  },
  outputDir: orderedFlow ? `test-results/${artifactId}` : 'test-results',
  projects: [
    {
      name: 'chromium',
      testDir: './tests',
      testIgnore: ['**/site-management/**/*.spec.ts', '**/boiler-management/**/*.spec.ts'],
      fullyParallel: true,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'site-creation',
      testDir: './tests/site-management',
      testMatch: 'site-creation.spec.ts',
      fullyParallel: true,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'site-invitation',
      testDir: './tests/site-management',
      testMatch: 'site-invitation.spec.ts',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'site-search',
      testDir: './tests/site-management',
      testMatch: 'site-search.spec.ts',
      fullyParallel: true,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'boiler-creation',
      testDir: './tests/boiler-management',
      testMatch: 'boiler-creation.spec.ts',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'site-update',
      testDir: './tests/site-management',
      testMatch: 'site-update.spec.ts',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'boiler-info',
      testDir: './tests/boiler-management',
      testMatch: 'boiler-info.spec.ts',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'site-unassignment',
      testDir: './tests/site-management',
      testMatch: 'site-unassignment.spec.ts',
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
