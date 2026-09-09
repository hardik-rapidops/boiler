import type { Page } from '@playwright/test';
import { test, expect } from '../../src/fixtures/roleFixture';
import { SitesPage } from '../../src/pages/sites/sitesPage';
import { buildSiteData } from '../../src/test-data/testDataFactory';
import type { RuntimeDataManager } from '../../src/runtime/runtimeDataManager';
import type { RoleKey } from '../../src/types/roles';
import type { TestContext } from '../../src/context/testContext';

type AuthenticatedPageForRole = (roleKey: RoleKey) => Promise<Page>;

async function createSiteForRole(
  roleKey: RoleKey,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const rolePage = await authenticatedPageForRole(roleKey);
  const sitesPage = new SitesPage(rolePage);
  const site = buildSiteData(roleKey);

  await sitesPage.open();
  await sitesPage.createSite(site);
  await sitesPage.expectSiteCreated();
  await sitesPage.searchBySiteName(site.name);
  await sitesPage.expectSiteVisible(site.name);

  const siteId = await sitesPage.getSiteIdFromResult(site.name);

  runtimeData.upsertSite(roleKey, {
    ...site,
    id: siteId,
    invitedUsers: [],
    assignedUsers: []
  });

  // Set the current site in test context for name-based tracking through e2e flow
  testContext.setCurrentSite(site.name, siteId);

  expect(siteId, `created Site ID should be captured for ${roleKey} dependent flows`).toBeTruthy();
}

test.describe('Site Management - Site Creation', () => {
  test('Verify When PKAdmin creates a new Site with valid data then Site is visible in search results', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await createSiteForRole('pkAdmin', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When PKTech creates a new Site with valid data then Site is visible in search results', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await createSiteForRole('pkTech', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When PKRep creates a new Site with valid data then Site is visible in search results', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await createSiteForRole('pkRep', authenticatedPageForRole, runtimeData, testContext);
  });
});
