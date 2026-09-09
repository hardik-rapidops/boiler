import type { Page } from '@playwright/test';
import { test } from '../../src/fixtures/roleFixture';
import { AccessControlPage } from '../../src/pages/sites/accessControlPage';
import { SitesPage } from '../../src/pages/sites/sitesPage';
import { RuntimeDataManager } from '../../src/runtime/runtimeDataManager';
import type { RoleKey } from '../../src/types/roles';

type AuthenticatedPageForRole = (roleKey: RoleKey) => Promise<Page>;

type AssignmentScenario = {
  siteOwnerRole: RoleKey;
  actingRole: RoleKey;
  assignedRole: RoleKey;
};

function requireAssignment(
  siteOwnerRole: RoleKey,
  assignedRole: RoleKey,
  runtimeData: typeof RuntimeDataManager
) {
  const site = runtimeData.requireCreatedSites().sites[siteOwnerRole];
  if (!site?.id || !site.name) {
    throw new Error(`Runtime site data is missing for ${siteOwnerRole}. Execute site-creation test first.`);
  }

  const invitation = runtimeData.requireInvitedUser(siteOwnerRole, assignedRole);
  return { site, invitation };
}

async function openSiteAccessControlForRole(
  scenario: AssignmentScenario,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager
): Promise<AccessControlPage> {
  const { site } = requireAssignment(scenario.siteOwnerRole, scenario.assignedRole, runtimeData);
  if (scenario.actingRole !== scenario.siteOwnerRole) {
    runtimeData.requireInvitedUser(scenario.siteOwnerRole, scenario.actingRole);
  }

  const page = await authenticatedPageForRole(scenario.actingRole);
  const sitesPage = new SitesPage(page);
  await sitesPage.openSiteFromSearch(site.name);
  await sitesPage.openAccessControl();
  return new AccessControlPage(page);
}

async function verifyRemovalPermissionRestricted(
  scenario: AssignmentScenario,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager
): Promise<void> {
  const accessControlPage = await openSiteAccessControlForRole(
    scenario,
    authenticatedPageForRole,
    runtimeData
  );
  await accessControlPage.verifyDeleteOrRemoveButtonHiddenOrDisabled();
}

async function removeAssignmentAndVerifyAccessRevoked(
  scenario: AssignmentScenario,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager
): Promise<void> {
  const { site, invitation } = requireAssignment(
    scenario.siteOwnerRole,
    scenario.assignedRole,
    runtimeData
  );
  const accessControlPage = await openSiteAccessControlForRole(
    scenario,
    authenticatedPageForRole,
    runtimeData
  );

  await accessControlPage.removeUser(invitation.email);
  await accessControlPage.confirmRemovalIfPresent();
  await accessControlPage.expectRemovalSuccess();
  await accessControlPage.verifyUserNotDisplayed(invitation.email);

  runtimeData.removeInvitedUser(scenario.siteOwnerRole, invitation.email);

  const removedUserPage = await authenticatedPageForRole(scenario.assignedRole);
  const removedUserSitesPage = new SitesPage(removedUserPage);
  await removedUserSitesPage.verifySiteNotVisibleForAssignedUser(site.name);
}

test.describe('Site Management - Site Unassignment', () => {

  test('Verify When Site Supervisor opens assigned Site Access Control then remove controls are hidden or disabled', async ({
    authenticatedPageForRole,
    runtimeData
  }) => {
    await verifyRemovalPermissionRestricted(
      { siteOwnerRole: 'pkTech', actingRole: 'siteSupervisor', assignedRole: 'siteSupervisor' },
      authenticatedPageForRole,
      runtimeData
    );
  });

  test('Verify When Site User opens assigned Site Access Control then remove controls are hidden or disabled', async ({
    authenticatedPageForRole,
    runtimeData
  }) => {
    await verifyRemovalPermissionRestricted(
      { siteOwnerRole: 'pkRep', actingRole: 'siteUser', assignedRole: 'siteUser' },
      authenticatedPageForRole,
      runtimeData
    );
  });

  test('Verify When Site Manager removes Manager-invited Supervisor then Supervisor access is revoked', async ({
    authenticatedPageForRole,
    runtimeData
  }) => {
    await removeAssignmentAndVerifyAccessRevoked(
      { siteOwnerRole: 'pkAdmin', actingRole: 'siteManager', assignedRole: 'siteSupervisor' },
      authenticatedPageForRole,
      runtimeData
    );
  });

  test('Verify When PKAdmin removes assigned Site Manager then Manager access is revoked', async ({
    authenticatedPageForRole,
    runtimeData
  }) => {
    await removeAssignmentAndVerifyAccessRevoked(
      { siteOwnerRole: 'pkAdmin', actingRole: 'pkAdmin', assignedRole: 'siteManager' },
      authenticatedPageForRole,
      runtimeData
    );
  });

  test('Verify When PKTech removes assigned Site Supervisor then Supervisor access is revoked', async ({
    authenticatedPageForRole,
    runtimeData
  }) => {
    await removeAssignmentAndVerifyAccessRevoked(
      { siteOwnerRole: 'pkTech', actingRole: 'pkTech', assignedRole: 'siteSupervisor' },
      authenticatedPageForRole,
      runtimeData
    );
  });

  test('Verify When PKRep removes assigned Site User then User access is revoked', async ({
    authenticatedPageForRole,
    runtimeData
  }) => {
    await removeAssignmentAndVerifyAccessRevoked(
      { siteOwnerRole: 'pkRep', actingRole: 'pkRep', assignedRole: 'siteUser' },
      authenticatedPageForRole,
      runtimeData
    );
  });
});
