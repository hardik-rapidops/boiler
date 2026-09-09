import { expect, type Locator, type Page } from '@playwright/test';
import { logger } from '../../utils/logger';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    logger.step('Navigating to page', { module: this.constructor.name, path });
    await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  }

  protected byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  protected button(name: string | RegExp): Locator {
    return this.page.getByRole('button', { name });
  }

  protected inputByLabel(name: string | RegExp): Locator {
    return this.page.getByLabel(name);
  }

  protected inputByModel(model: string): Locator {
    return this.page.locator(`input[ng-model="${model}"]`);
  }

  async expectLoaded(locator: Locator): Promise<void> {
    logger.step('Verifying page element is visible', { module: this.constructor.name });
    await expect(locator).toBeVisible();
  }
}
