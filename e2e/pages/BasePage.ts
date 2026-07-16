import type { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  /** Route this page lives at, relative to baseURL. */
  abstract readonly path: string;

  readonly userName: Locator;
  readonly logoutButton: Locator;

  constructor(protected readonly page: Page) {
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
