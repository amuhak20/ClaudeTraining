import type { Locator, Page } from '@playwright/test';

export class DashboardPage {
  readonly logoutButton: Locator;

  constructor(private readonly page: Page) {
    this.logoutButton = page.getByRole('button', { name: 'Logout' });
  }

  loggedInUser(username: string): Locator {
    return this.page.getByText(username, { exact: true });
  }
}
