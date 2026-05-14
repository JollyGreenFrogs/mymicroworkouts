import { test, expect } from '@playwright/test';
import { mintE2EToken } from './helpers/auth';

/**
 * UI smoke tests — headless Chromium hitting the real wrangler dev server.
 * We bypass the OAuth login flow by injecting a valid JWT directly into
 * localStorage before the page loads, which is the same mechanism the
 * frontend uses after a real login.
 */

test.describe('UI smoke', () => {
  test('login page renders when unauthenticated', async ({ page }) => {
    await page.goto('/');
    // App should show the login/register form when no token is present
    await expect(page.locator('body')).toBeVisible();
    // Auth section or login form should be visible
    const authSection = page.locator('#auth-section, .auth-container, form');
    await expect(authSection.first()).toBeVisible({ timeout: 5000 });
  });

  test('app loads workouts view when token is injected', async ({ page }) => {
    const token = await mintE2EToken();

    // Inject the token into localStorage before the app script runs
    await page.addInitScript((t) => {
      localStorage.setItem('auth_token', t);
    }, token);

    await page.goto('/');

    // App should render the main workout UI (not the login form)
    // Wait for something that only appears when authenticated
    const appSection = page.locator('#app-section, #workout-section, .workout-container, main');
    await expect(appSection.first()).toBeVisible({ timeout: 8000 });
  });

  test('page title is set', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/workout|micro|mymicro/i);
  });
});
