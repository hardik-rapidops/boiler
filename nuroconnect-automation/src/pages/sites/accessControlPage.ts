import { expect, type Locator } from '@playwright/test';
import { BasePage } from '../base/basePage';
import type { RoleKey } from '../../types/roles';
import { logger } from '../../utils/logger';

type InviteRole = 'Manager' | 'Supervisor' | 'User';

export class AccessControlPage extends BasePage {
  readonly inviteButton: Locator = this.byTestId('site-invite')
    .or(this.page.locator('a[ui-sref^="common.add-user"], a[href^="#!/add-user/"]'))
    .or(this.page.locator('md-button.btn-fix-bottom[ui-sref^="common.add-user"]'));
  readonly inviteEmailInput: Locator = this.byTestId('invite-email').or(this.inputByModel('vm.email'));
  readonly inviteRoleSelect: Locator = this.byTestId('invite-role').or(this.page.locator('md-select[ng-model="vm.role"]'));
  readonly inviteSubmitButton: Locator = this.byTestId('invite-submit').or(this.button(/^invite$/i));
  readonly invitationSuccessMessage: Locator = this.page.getByText(/user invitation sent/i);
  readonly removalSuccessMessage: Locator = this.page
    .locator('md-toast, .md-toast-text, [role="status"]')
    .filter({ hasText: /removed|deleted|unassigned|success/i });

  async openForSite(siteId: string): Promise<void> {
    logger.step('Opening Access Control for Site', { module: 'AccessControlPage', siteId });
    await this.goto(`/#!/users/${siteId}`);
  }

  async openInviteUser(): Promise<void> {
    logger.step('Opening Invite User form', { module: 'AccessControlPage' });
    await this.inviteButton.first().click();
    await this.page.waitForURL(/add-user\/[^/?#]+|users\/[^/?#]+\/add/i, { timeout: 10_000 }).catch(() => undefined);
    await this.inviteEmailInput.waitFor({ state: 'visible' });
  }

  async expectInviteButtonVisibleAndEnabled(): Promise<void> {
    logger.step('Verifying Access Control invite button is visible and enabled', { module: 'AccessControlPage' });
    await this.expectLoaded(this.inviteButton);
    await expect(this.inviteButton.first()).toBeEnabled();
  }

  async verifyAccessControlPlusButtonHidden(): Promise<void> {
    logger.step('Verifying Access Control invite button is hidden', { module: 'AccessControlPage' });
    await this.inviteButton.first().waitFor({ state: 'hidden', timeout: 10_000 });
  }

  async inviteUser(email: string, role: RoleKey): Promise<void> {
    logger.step('Inviting user from Access Control', { module: 'AccessControlPage', email, role });
    await this.openInviteUser();
    await this.inviteEmailInput.fill(email);
    await this.inviteEmailInput.blur();
    await this.selectInviteRole(this.toInviteRole(role));
    await expect(
      this.inviteSubmitButton,
      `Invite should be enabled after validating ${email} for role ${role}`
    ).toBeEnabled({ timeout: 30_000 });
    await this.inviteSubmitButton.click();
  }

  async expectInvitationSuccess(): Promise<void> {
    logger.step('Verifying invitation success message', { module: 'AccessControlPage' });
    await this.expectLoaded(this.invitationSuccessMessage);
  }

  invitedUser(email: string): Locator {
    return this.page.locator('.users-list .each-user').filter({ hasText: email.toLowerCase() });
  }

  async verifyUserVisibleInAccessControl(email: string): Promise<void> {
    logger.step('Verifying user is visible in Access Control', { module: 'AccessControlPage', email });
    await this.expectLoaded(this.invitedUser(email).first());
  }

  async verifyDeleteOrRemoveButtonHiddenOrDisabled(): Promise<void> {
    logger.step('Verifying remove controls are hidden or disabled', { module: 'AccessControlPage' });
    const controls = this.allRemovalControls();
    const count = await controls.count();

    for (let index = 0; index < count; index += 1) {
      const control = controls.nth(index);
      if (await control.isVisible().catch(() => false)) {
        await expect(control).toBeDisabled();
      }
    }
  }

  async removeUser(email: string): Promise<void> {
    logger.step('Removing user from Access Control', { module: 'AccessControlPage', email });
    const user = this.invitedUser(email).first();
    await expect(user).toBeVisible();

    const removeControl = this.removeControlForUser(user);
    await expect(removeControl).toBeVisible();
    this.page.once('dialog', async (dialog) => dialog.accept());
    await removeControl.click();
  }

  async confirmRemovalIfPresent(): Promise<void> {
    logger.step('Confirming removal if confirmation dialog appears', { module: 'AccessControlPage' });
    const dialog = this.page.getByRole('dialog').or(this.page.locator('md-dialog')).first();
    const appeared = await dialog.waitFor({ state: 'visible', timeout: 2_000 }).then(() => true).catch(() => false);
    if (!appeared) {
      return;
    }

    const confirmButton = dialog.getByRole('button', { name: /^(yes|confirm|remove|delete|ok)$/i }).first();
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
  }

  async expectRemovalSuccess(): Promise<void> {
    logger.step('Verifying removal success message', { module: 'AccessControlPage' });
    await this.expectLoaded(this.removalSuccessMessage.first());
  }

  async verifyUserNotDisplayed(email: string): Promise<void> {
    logger.step('Verifying user is not displayed in Access Control', { module: 'AccessControlPage', email });
    await expect(this.invitedUser(email).first()).toBeHidden();
  }

  private async selectInviteRole(role: InviteRole): Promise<void> {
    await this.inviteRoleSelect.click();
    await this.page.locator('md-option').filter({ hasText: new RegExp(`^${role}$`, 'i') }).click();
  }

  private toInviteRole(role: RoleKey): InviteRole {
    const roleMap: Partial<Record<RoleKey, InviteRole>> = {
      siteManager: 'Manager',
      siteSupervisor: 'Supervisor',
      siteUser: 'User'
    };
    const inviteRole = roleMap[role];
    if (!inviteRole) {
      throw new Error(`Role ${role} is not supported for site invitation.`);
    }
    return inviteRole;
  }

  private allRemovalControls(): Locator {
    return this.page.locator(
      '.users-list [data-testid*="remove"], .users-list [data-testid*="delete"], ' +
        '.users-list [ng-click*="remove"], .users-list [ng-click*="delete"], ' +
        '.users-list [aria-label*="remove" i], .users-list [aria-label*="delete" i]'
    );
  }

  private removeControlForUser(user: Locator): Locator {
    return user
      .locator(
        '[data-testid*="remove"], [data-testid*="delete"], [ng-click*="remove"], [ng-click*="delete"], ' +
          '[aria-label*="remove" i], [aria-label*="delete" i]'
      )
      .or(user.getByRole('button', { name: /remove|delete|unassign/i }))
      .or(user.getByRole('link', { name: /remove|delete|unassign/i }))
      .first();
  }
}
