import type { Page } from '@playwright/test';
import { test } from '../../src/fixtures/roleFixture';
import { SitesPage } from '../../src/pages/sites/sitesPage';
import { RuntimeDataManager } from '../../src/runtime/runtimeDataManager';
import type { RoleKey } from '../../src/types/roles';
import type { RuntimeSiteRecord } from '../../src/types/site';
import type { TestContext } from '../../src/context/testContext';
import { logger } from '../../src/utils/logger';

type AuthenticatedPageForRole = (roleKey: RoleKey) => Promise<Page>;
type CreatorRole = 'pkAdmin' | 'pkTech' | 'pkRep';
type SiteSearchFilter = 'name' | 'description' | 'address';

const creatorRoles: CreatorRole[] = ['pkAdmin', 'pkTech', 'pkRep'];
const searchFilters: SiteSearchFilter[] = ['name', 'description', 'address'];

function requireCreatedSites(
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Record<CreatorRole, RuntimeSiteRecord> {
  const sites = runtimeData.requireCreatedSites().sites;
  const requiredSites = {} as Record<CreatorRole, RuntimeSiteRecord>;

  logger.system('Loading sites for search validation', {
    module: 'SiteSearch',
    contextSiteName: testContext.getCurrentSiteName(),
    contextSiteId: testContext.getCurrentSiteId()
  });

  for (const role of creatorRoles) {
    const site = sites[role];
    if (!site?.id || !site.name || !site.description || !site.address) {
      throw new Error(`Runtime site data is missing for ${role}. Execute site-creation test first.`);
    }
    requiredSites[role] = site;
  }

  return requiredSites;
}

function restrictedRoleAllowedSites(
  role: RoleKey,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): RuntimeSiteRecord[] {
  const sites = requireCreatedSites(runtimeData, testContext);

  if (role === 'siteManager') {
    runtimeData.requireInvitedUser('pkAdmin', 'siteManager');
  }

  if (role === 'siteSupervisor') {
    runtimeData.requireInvitedUser('pkTech', 'siteSupervisor');
  }

  if (role === 'siteUser') {
    runtimeData.requireInvitedUser('pkRep', 'siteUser');
  }

  const allowedSites = creatorRoles
    .map((creatorRole) => sites[creatorRole])
    .filter((site) => site.createdBy === role || site.assignedUsers?.includes(role));

  if (role === 'pkRep' && !allowedSites.some((site) => site.createdBy === 'pkRep')) {
    allowedSites.push(sites.pkRep);
  }

  if (allowedSites.length === 0) {
    throw new Error(`Runtime assignment data is missing for ${role}. Execute site-invitation test first.`);
  }

  return allowedSites;
}

function restrictedRoleHiddenSites(
  role: RoleKey,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): RuntimeSiteRecord[] {
  const sites = requireCreatedSites(runtimeData, testContext);
  const allowedSiteIds = new Set(restrictedRoleAllowedSites(role, runtimeData, testContext).map((site) => site.id));

  return creatorRoles
    .map((creatorRole) => sites[creatorRole])
    .filter((site) => !allowedSiteIds.has(site.id));
}

async function verifyAllowedRoleCanSearchAllSites(
  role: 'pkAdmin' | 'pkTech',
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const sites = requireCreatedSites(runtimeData, testContext);
  const page = await authenticatedPageForRole(role);
  const sitesPage = new SitesPage(page);

  await sitesPage.verifySearchFilterVisible('name');

  for (const creatorRole of creatorRoles) {
    const site = sites[creatorRole];
    await sitesPage.searchSiteByName(site.name);
    await sitesPage.verifySiteVisibleInList(site.name);
  }
}

async function verifyRestrictedRoleSiteVisibility(
  role: RoleKey,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const visibleSites = restrictedRoleAllowedSites(role, runtimeData, testContext);
  const hiddenSites = restrictedRoleHiddenSites(role, runtimeData, testContext);
  const page = await authenticatedPageForRole(role);
  const sitesPage = new SitesPage(page);

  for (const site of visibleSites) {
    await sitesPage.searchBySiteName(site.name);
    await sitesPage.verifySiteVisibleInList(site.name);
  }

  for (const site of hiddenSites) {
    await sitesPage.searchBySiteName(site.name);
    await sitesPage.verifySiteNotVisibleInList(site.name);
  }

  await sitesPage.verifySearchFilterHiddenOrDisabled('name', visibleSites[0].name, visibleSites[0].name);
}

async function verifyPKRepCanSearchOnlyOwnCreatedSite(
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const sites = requireCreatedSites(runtimeData, testContext);
  const page = await authenticatedPageForRole('pkRep');
  const sitesPage = new SitesPage(page);

  await sitesPage.searchSiteByName(sites.pkRep.name);
  await sitesPage.verifySiteVisibleInList(sites.pkRep.name);

  for (const creatorRole of ['pkAdmin', 'pkTech'] as const) {
    await sitesPage.searchSiteByName(sites[creatorRole].name);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();
  }
}

async function verifySiteUserRoleCannotSearchCreatorSites(
  role: 'siteManager' | 'siteSupervisor' | 'siteUser',
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const hiddenSites = restrictedRoleHiddenSites(role, runtimeData, testContext);
  const page = await authenticatedPageForRole(role);
  const sitesPage = new SitesPage(page);

  for (const site of hiddenSites) {
    await sitesPage.searchSiteByName(site.name);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();
  }
}

function searchValue(site: RuntimeSiteRecord, filter: SiteSearchFilter): string {
  return site[filter];
}

async function searchSiteByFilter(
  sitesPage: SitesPage,
  filter: SiteSearchFilter,
  site: RuntimeSiteRecord
): Promise<void> {
  if (filter === 'name') {
    await sitesPage.searchSiteByName(searchValue(site, filter));
    return;
  }

  if (filter === 'description') {
    await sitesPage.searchSiteByDescription(searchValue(site, filter));
    return;
  }

  await sitesPage.searchSiteByAddress(searchValue(site, filter));
}

async function verifyAllowedRoleCanSearchByNameDescriptionAndAddress(
  role: 'pkAdmin' | 'pkTech',
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const sites = requireCreatedSites(runtimeData, testContext);
  const page = await authenticatedPageForRole(role);
  const sitesPage = new SitesPage(page);

  for (const filter of searchFilters) {
    await sitesPage.verifySearchFilterVisible(filter);
    for (const creatorRole of creatorRoles) {
      const site = sites[creatorRole];
      await searchSiteByFilter(sitesPage, filter, site);
      await sitesPage.verifySiteVisibleInList(site.name);
    }
  }
}

async function verifyRestrictedRoleCannotUseNameDescriptionOrAddressFilters(
  role: RoleKey,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const sites = requireCreatedSites(runtimeData, testContext);
  const pkAdminSite = sites.pkAdmin;
  const page = await authenticatedPageForRole(role);
  const sitesPage = new SitesPage(page);

  for (const filter of searchFilters) {
    await sitesPage.verifySearchFilterHiddenOrDisabled(filter);
  }
}

async function verifyPKRepCannotSearchOtherUserSitesByNameDescriptionOrAddress(
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const sites = requireCreatedSites(runtimeData, testContext);
  const page = await authenticatedPageForRole('pkRep');
  const sitesPage = new SitesPage(page);

  for (const creatorRole of ['pkAdmin', 'pkTech'] as const) {
    const site = sites[creatorRole];

    await sitesPage.searchSiteByName(site.name);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();

    await sitesPage.searchSiteByDescription(site.description);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();

    await sitesPage.searchSiteByAddress(site.address);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();
  }
}

async function verifySiteUserRoleCannotSearchCreatorSitesByNameDescriptionOrAddress(
  role: 'siteManager' | 'siteSupervisor' | 'siteUser',
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const hiddenSites = restrictedRoleHiddenSites(role, runtimeData, testContext);
  const page = await authenticatedPageForRole(role);
  const sitesPage = new SitesPage(page);

  for (const site of hiddenSites) {
    await sitesPage.searchSiteByName(site.name);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();

    await sitesPage.searchSiteByDescription(site.description);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();

    await sitesPage.searchSiteByAddress(site.address);
    await sitesPage.verifyNoRecordsMessageOrEmptyResults();
  }
}

test.describe('Site Management - Site Search', () => {
  test('Verify When PKAdmin searches Sites then Sites created by all users are visible', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyAllowedRoleCanSearchAllSites('pkAdmin', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When PKTech searches Sites then Sites created by all users are visible', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyAllowedRoleCanSearchAllSites('pkTech', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When PKRep searches Sites he can not search sites created by other users ', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyPKRepCanSearchOnlyOwnCreatedSite(authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When SiteManager searches Sites he can not search sites created by other users', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifySiteUserRoleCannotSearchCreatorSites('siteManager', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When Site Supervisor searches Sites he can not search sites created by other users', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifySiteUserRoleCannotSearchCreatorSites('siteSupervisor', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When Site User searches Sites he can not search sites created by other users', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifySiteUserRoleCannotSearchCreatorSites('siteUser', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When PKAdmin searches Sites using Name Description and Address then matching Sites are displayed', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyAllowedRoleCanSearchByNameDescriptionAndAddress('pkAdmin', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When PKTech searches Sites using Name Description and Address then matching Sites are displayed', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyAllowedRoleCanSearchByNameDescriptionAndAddress('pkTech', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When PKRep opens Site Search then Name Description and Address filters are unavailable', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyRestrictedRoleCannotUseNameDescriptionOrAddressFilters('pkRep', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When Site Manager opens Site Search then Name Description and Address filters are unavailable', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyRestrictedRoleCannotUseNameDescriptionOrAddressFilters('siteManager', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When Site Supervisor opens Site Search then Name Description and Address filters are unavailable', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyRestrictedRoleCannotUseNameDescriptionOrAddressFilters('siteSupervisor', authenticatedPageForRole, runtimeData, testContext);
  });

  test('Verify When Site User opens Site Search then Name Description and Address filters are unavailable', async ({
    authenticatedPageForRole,
    runtimeData,
    testContext
  }) => {
    await verifyRestrictedRoleCannotUseNameDescriptionOrAddressFilters('siteUser', authenticatedPageForRole, runtimeData, testContext);
  });
});
