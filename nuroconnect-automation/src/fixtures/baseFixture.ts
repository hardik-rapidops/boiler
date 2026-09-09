import path from 'node:path';
import { test as base, type APIRequestContext, type Browser, type Page, type TestInfo } from '@playwright/test';
import { testEnvironment } from '../config/environment';
import { AccessControlPage } from '../pages/sites/accessControlPage';
import { SitesPage } from '../pages/sites/sitesPage';
import { AuthService } from '../services/auth/authService';
import type { RoleKey } from '../types/roles';
import { roleKeys } from '../types/roles';
import { RuntimeDataManager } from '../runtime/runtimeDataManager';
import { logger } from '../utils/logger';
import { AvailableDataService } from '../services/data/availableDataService';
import { type TestContext, getTestContext } from '../context/testContext';

type AuthenticatedPageFactory = (roleKey: RoleKey) => Promise<Page>;

type FrameworkFixtures = {
  loggerContext: void;
  sitesPage: SitesPage;
  accessControlPage: AccessControlPage;
  authenticatedPageForRole: AuthenticatedPageFactory;
  runtimeData: typeof RuntimeDataManager;
  availableData: AvailableDataService;
  testContext: TestContext;
};

async function createAuthenticatedPage(
  browser: Browser,
  request: APIRequestContext,
  roleKey: RoleKey,
  testInfo: TestInfo
): Promise<Page> {
  const authService = new AuthService(request);
  const storageState = await authService.createStorageState(
    roleKey,
    `${testInfo.workerIndex}-${testInfo.retry}-${testInfo.testId}`
  );
  const context = await browser.newContext({
    baseURL: testEnvironment.baseUrl,
    storageState,
    recordVideo: {
      dir: testInfo.outputPath('videos')
    }
  });
  return context.newPage();
}

export const test = base.extend<FrameworkFixtures>({
  loggerContext: [
    async ({}, use, testInfo) => {
      logger.startTest(testInfo.title, testInfo.testId, {
        project: testInfo.project.name,
        file: path.basename(testInfo.file),
        retry: testInfo.retry,
        worker: testInfo.workerIndex
      });
      try {
        await logger.withContext({ testName: testInfo.title, testId: testInfo.testId }, async () => {
          logger.system('Test started');
          await use();
        });
      } finally {
        logger.system('Test finished', {
          status: testInfo.status,
          expectedStatus: testInfo.expectedStatus
        });
        logger.finishTest(testInfo.status ?? 'unknown', testInfo.expectedStatus);
      }
    },
    { auto: true }
  ],

  sitesPage: async ({ page }, use) => {
    await use(new SitesPage(page));
  },

  accessControlPage: async ({ page }, use) => {
    await use(new AccessControlPage(page));
  },

  authenticatedPageForRole: async ({ browser, request }, use, testInfo) => {
    const openedPages: Page[] = [];
    await use(async (roleKey: RoleKey) => {
      if (!roleKeys.includes(roleKey)) {
        throw new Error(`Unsupported role key: ${roleKey}`);
      }
      logger.step('Creating authenticated page for role', { role: roleKey });
      const page = await createAuthenticatedPage(browser, request, roleKey, testInfo);
      openedPages.push(page);
      return page;
    });

    for (const openedPage of openedPages) {
      const video = openedPage.video();
      await openedPage.context().close();
      logger.debug('Closed authenticated page context');
      if (video) {
        const videoPath = await video.path();
        await testInfo.attach(`video-${path.basename(videoPath)}`, {
          path: videoPath,
          contentType: 'video/webm'
        });
      }
    }
  },

  runtimeData: async ({}, use) => {
    await use(RuntimeDataManager);
  },

  availableData: async ({ request }, use) => {
    await use(new AvailableDataService(request));
  },

  testContext: async ({}, use) => {
    const context = getTestContext();
    await use(context);
    // Note: We do NOT clear context here automatically because it needs to persist
    // across tests within the same e2e run. It will be cleared by global setup/teardown.
  }
});

export { expect } from '@playwright/test';
