---
name: playwright
description: Write Playwright end-to-end QA tests using best practices - user-facing locators, pre-action checks, loading-state handling, and outcome-focused assertions
---

# Playwright QA Automation

Use when generating or editing Playwright (`@playwright/test`) tests. Tests verify what a user sees and can do, not implementation details.

## 1. Best practices

- One behavior per test; tests are independent (no shared state or order dependence).
- Arrange state through the fastest reliable path (API, DB seed, saved `storageState` for login) instead of clicking through UI that isn't under test.
- Use unique data per test (e.g. timestamp/UUID in titles, emails) so parallel runs don't collide. Clean up what you create.
- Group with `test.describe`; share setup with `test.beforeEach` and fixtures, not helper globals.
- Never use `waitForTimeout` / fixed sleeps. Rely on auto-waiting and web-first assertions.
- No conditional logic or try/catch in tests that hides failures.
- Name tests as user behavior: `test('signed-in user can share a note publicly', ...)`.
- Keep selectors/page logic in small page objects or helpers only when reused across tests.
- Use `baseURL` from config; navigate with relative paths (`page.goto('/dashboard')`).

## 2. Locators (priority order)

1. `getByRole('button', { name: 'Save' })` - default choice
2. `getByLabel('Email')` - form fields
3. `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle` - when no role/label exists
4. `getByTestId` - last resort, only for elements with no accessible identity

Avoid: CSS class chains, XPath, `nth()` by position, auto-generated ids, text-in-DOM-structure selectors. If a good locator is impossible, fix the app's accessibility (add a label/role) rather than writing a fragile selector.

Scope with parents when names repeat: `page.getByRole('listitem').filter({ hasText: 'My note' }).getByRole('link')`.

## 3. Before important actions

Verify state first, then act:

```ts
const save = page.getByRole('button', { name: 'Save note' });
await expect(save).toBeVisible();
await expect(save).toBeEnabled();
await save.click();
```

- Fill forms by label; assert required fields are visible before typing.
- Consider loading states: wait for spinners/skeletons to disappear (`await expect(page.getByRole('progressbar')).toBeHidden()`), or for the button to leave its "Saving..." / disabled state, before asserting results.
- Wait on user-visible signals (`expect(...).toBeVisible()`, `expect(page).toHaveURL(...)`), or `page.waitForResponse` for a specific request, never on arbitrary time.
- For navigations triggered by a click, assert the new URL/heading rather than awaiting load events.

## 4. Assertions

Assert the user outcome, not internals.

- Prefer web-first assertions (auto-retrying): `toBeVisible`, `toHaveText`, `toContainText`, `toHaveURL`, `toHaveValue`, `toBeChecked`, `toHaveCount`.
- After an action verify the visible result: success message, new item in list, redirected page heading, updated value after reload.
- Cover the negative path: validation message shown, unauthorized user redirected/404, deleted item gone.
- Verify persistence where relevant (`page.reload()` then re-assert).
- Avoid weak assertions (`toBeTruthy` on a locator, only checking an element exists, snapshot-everything). Don't assert on CSS classes or DOM structure.
- Use `expect.soft` only for independent secondary checks.

## Example

```ts
import { test, expect } from '@playwright/test';

test('user can create a note and see it on the dashboard', async ({ page }) => {
  const title = `Note ${Date.now()}`;
  await page.goto('/notes/new');

  const titleField = page.getByLabel('Title');
  await expect(titleField).toBeVisible();
  await titleField.fill(title);

  const save = page.getByRole('button', { name: 'Save' });
  await expect(save).toBeEnabled();
  await save.click();

  await expect(page).toHaveURL(/\/notes\/[\w-]+$/);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  await page.goto('/dashboard');
  await expect(page.getByRole('link', { name: title })).toBeVisible();
});
```

## Checklist before finishing

- [ ] Every locator is role/label based (or justified)
- [ ] Visibility/enabled checks precede key actions
- [ ] Loading states handled without sleeps
- [ ] Assertions check user-visible outcomes, incl. at least one failure path
- [ ] Test is independent and uses unique data
