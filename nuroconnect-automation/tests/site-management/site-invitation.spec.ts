import type { Page } from '@playwright/test';
import { test } from '../../src/fixtures/roleFixture';
import { RuntimeDataManager } from '../../src/runtime/runtimeDataManager';
import { AccessControlPage } from '../../src/pages/sites/accessControlPage';
import { SitesPage } from '../../src/pages/sites/sitesPage';
import type { RoleKey } from '../../src/types/roles';
import { testEnvironment } from '../../src/config/environment';
import type { TestContext } from '../../src/context/testContext';
import { logger } from '../../src/utils/logger';

type AuthenticatedPageForRole = (roleKey: RoleKey) => Promise<Page>;

type InviteScenario = {
  inviterRole: RoleKey;
  invitedRole: RoleKey;
};

type AssignedSiteScenario = {
  siteOwnerRole: RoleKey;
  actingRole: RoleKey;
  preconditionInvitedRole: RoleKey;
};

async function verifyAssignedSiteWithFreshSession(
  siteName: string,
  assignedRole: RoleKey,
  authenticatedPageForRole: AuthenticatedPageForRole
): Promise<void> {
  const assignedUserPage = await authenticatedPageForRole(assignedRole);
  const assignedUserSitesPage = new SitesPage(assignedUserPage);
  await assignedUserSitesPage.verifySiteVisibleForAssignedUser(siteName);
}

async function inviteUserFromCreatedSite(
  scenario: InviteScenario,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<void> {
  const runtime = runtimeData.requireCreatedSites();
  const createdSite = runtime.sites[scenario.inviterRole];
  if (!createdSite?.id || !createdSite.name) {
    throw new Error(`Runtime site data is missing for ${scenario.inviterRole}. Execute site-creation test first.`);
  }

  logger.system('Inviting user to site', {
    module: 'SiteInvitation',
    inviterRole: scenario.inviterRole,
    invitedRole: scenario.invitedRole,
    siteName: createdSite.name,
    siteId: createdSite.id,
    contextSiteName: testContext.getCurrentSiteName()
  });

  const page = await authenticatedPageForRole(scenario.inviterRole);
  const sitesPage = new SitesPage(page);
  const accessControlPage = new AccessControlPage(page);
  const invitation = {
    role: scenario.invitedRole,
    email: testEnvironment.credentials[scenario.invitedRole].email
  };

  await sitesPage.openSiteFromSearch(createdSite.name);
  await sitesPage.openAccessControl();
  await accessControlPage.inviteUser(invitation.email, invitation.role);
  await accessControlPage.expectInvitationSuccess();
  await accessControlPage.verifyUserVisibleInAccessControl(invitation.email);

  runtimeData.addInvitedUser(scenario.inviterRole, invitation);
  await verifyAssignedSiteWithFreshSession(createdSite.name, scenario.invitedRole, authenticatedPageForRole);
}

async function openAssignedSiteAccessControl(
  scenario: AssignedSiteScenario,
  authenticatedPageForRole: AuthenticatedPageForRole,
  runtimeData: typeof RuntimeDataManager,
  testContext: TestContext
): Promise<{ accessControlPage: AccessControlPage }> {
  const runtime = runtimeData.requireCreatedSites();
  const site = runtime.sites[scenario.siteOwnerRole];
  if (!site?.name || !site.id) {
    throw new Error(`Runtime site data is missing for ${scenario.siteOwnerRole}. Execute site-creation test first.`);
  }

  logger.system('Opening assigned site access control', {
    module: 'SiteInvitation',
    siteOwnerRole: scenario.siteOwnerRole,
    actingRole: scenario.actingRole,
    siteName: site.name,
    siteId: site.id,
    contextSiteName: testContext.getCurrentSiteName()
  });

  runtimeData.requireInvitedUser(scenario.siteOwnerRole, scenario.preconditionInvitedRole);

  const page = await authenticatedPageForRole(scenario.actingRole);
  const sitesPage = new SitesPage(page);
  const accessControlPage = new AccessControlPage(page);

  await sitesPage.openSiteFromSearch(site.name);
  await sitesPage.openAccessControl();

  return { accessControlPage };
}

test.describe('Site Management - Site Invitation', () => {

  test.describe('Precondition invitations', () => {
    test('Verify When PKAdmin invites Site Manager then Manager email and assigned Site are visible', async ({
      authenticatedPageForRole,
      runtimeData,
      testContext
    }) => {
      await inviteUserFromCreatedSite(
        { inviterRole: 'pkAdmin', invitedRole: 'siteManager' },
        authenticatedPageForRole,
        runtimeData,
        testContext
      );
    });

    test('Verify When PKTech invites Site Supervisor then Supervisor email and assigned Site are visible', async ({
      authenticatedPageForRole,
      runtimeData,
      testContext
    }) => {
      await inviteUserFromCreatedSite(
        { inviterRole: 'pkTech', invitedRole: 'siteSupervisor' },
        authenticatedPageForRole,
        runtimeData,
        testContext
      );
    });

    test('Verify When PKRep invites Site User then User email and assigned Site are visible', async ({
      authenticatedPageForRole,
      runtimeData,
      testContext
    }) => {
      await inviteUserFromCreatedSite(
        { inviterRole: 'pkRep', invitedRole: 'siteUser' },
        authenticatedPageForRole,
        runtimeData,
        testContext
      );
    });
  });

  test.describe('Assigned role permissions', () => {
    test('Verify When Site Manager invites existing Supervisor then Supervisor email and assigned Site are visible', async ({
      authenticatedPageForRole,
      runtimeData,
      testContext
    }) => {
      const scenario: AssignedSiteScenario = {
        siteOwnerRole: 'pkAdmin',
        actingRole: 'siteManager',
        preconditionInvitedRole: 'siteManager'
      };
      const { accessControlPage } = await openAssignedSiteAccessControl(scenario, authenticatedPageForRole, runtimeData, testContext);
      const invitation = runtimeData.requireInvitedUser('pkTech', 'siteSupervisor');
      const managerSite = runtimeData.requireCreatedSites().sites.pkAdmin;
      if (!managerSite?.name) {
        throw new Error('Runtime site data is missing for pkAdmin. Execute site-creation test first.');
      }

      await accessControlPage.expectInviteButtonVisibleAndEnabled();
      await accessControlPage.inviteUser(invitation.email, invitation.role);
      await accessControlPage.expectInvitationSuccess();
      await accessControlPage.verifyUserVisibleInAccessControl(invitation.email);

      runtimeData.addInvitedUser(scenario.siteOwnerRole, invitation);
      await verifyAssignedSiteWithFreshSession(managerSite.name, 'siteSupervisor', authenticatedPageForRole);
    });

    test('Verify When Site Supervisor opens assigned Site Access Control then plus invite button is hidden', async ({
      authenticatedPageForRole,
      runtimeData,
      testContext
    }) => {
      const { accessControlPage } = await openAssignedSiteAccessControl(
        {
          siteOwnerRole: 'pkTech',
          actingRole: 'siteSupervisor',
          preconditionInvitedRole: 'siteSupervisor'
        },
        authenticatedPageForRole,
        runtimeData,
        testContext
      );

      await accessControlPage.verifyAccessControlPlusButtonHidden();
    });

    test('Verify When Site User opens assigned Site Access Control then plus invite button is hidden', async ({
      authenticatedPageForRole,
      runtimeData,
      testContext
    }) => {
      const { accessControlPage } = await openAssignedSiteAccessControl(
        {
          siteOwnerRole: 'pkRep',
          actingRole: 'siteUser',
          preconditionInvitedRole: 'siteUser'
        },
        authenticatedPageForRole,
        runtimeData,
        testContext
      );

      await accessControlPage.verifyAccessControlPlusButtonHidden();
    });
  });

});
