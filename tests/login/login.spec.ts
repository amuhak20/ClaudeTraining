import { expect, test } from '@playwright/test';
import { DashboardPage } from '../../pages/DashboardPage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Bank login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('valid user can sign in and reach the dashboard', async ({ page }) => {
    const dashboard = new DashboardPage(page);

    await loginPage.login('standard_user', 'bank_sauce');

    await expect(page).toHaveURL(/\/bank\/dashboard$/);
    await expect(dashboard.logoutButton).toBeVisible();
    await expect(dashboard.loggedInUser('standard_user')).toBeVisible();
  });

  test('wrong password shows an error and stays on the login page', async ({ page }) => {
    await loginPage.login('standard_user', 'wrong_password');

    await expect(
      loginPage.errorMessage('The username or password you entered is incorrect.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/bank\/login$/);
  });

  test('locked user sees a suspended-account message', async ({ page }) => {
    await loginPage.login('locked_user', 'bank_sauce');

    await expect(
      loginPage.errorMessage('Your account has been suspended. Please contact support.'),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/bank\/login$/);
  });

  test('empty form asks for a username', async ({ page }) => {
    await loginPage.signInButton.click();

    await expect(loginPage.errorMessage('Please enter your username.')).toBeVisible();
    await expect(page).toHaveURL(/\/bank\/login$/);
  });
});
