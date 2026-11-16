import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.username = page.getByRole('textbox', { name: 'Username' });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in to SecureBank' });
    this.heading = page.getByRole('heading', { name: 'SecureBank' });
  }

  async goto() {
    await this.page.goto('/bank/login');
    await expect(this.heading).toBeVisible();
  }

  async login(username: string, password: string) {
    await expect(this.username).toBeVisible();
    await this.username.fill(username);
    await this.password.fill(password);
    await expect(this.signInButton).toBeEnabled();
    await this.signInButton.click();
  }

  /** Error banner by its text; filters out the empty route-announcer alert. */
  errorMessage(text: string): Locator {
    return this.page.getByRole('alert').filter({ hasText: text });
  }
}
