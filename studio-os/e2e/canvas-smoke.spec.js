import { test, expect } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL;
const PASS  = process.env.E2E_PASSWORD;

test.skip(!EMAIL || !PASS, 'E2E_EMAIL / E2E_PASSWORD not configured — see docs/canvas-quickstart.md');

test('canvas: add note, edit title, reload, persists', async ({ page }) => {
  // ── Login ────────────────────────────────────────────────────────
  await page.goto('/login');
  await page.fill('input[type="email"]',    EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');

  // Land on dashboard after signIn → navigate('/')
  await page.waitForURL('**/', { timeout: 15_000 });

  // ── Open a fresh canvas via the canvas launcher ──────────────────
  await page.goto('/canvas-home');
  await page.getByRole('button', { name: /Nuovo Canvas/i }).click();
  await page.waitForURL(/\/canvas\/[0-9a-f-]{36}/, { timeout: 10_000 });
  const canvasUrl = page.url();

  // ── Right-click the canvas background to open the context menu ──
  const bg = page.locator('[data-canvas-bg="1"]').first();
  await bg.click({ button: 'right', position: { x: 500, y: 350 } });

  // Click "Note" in the context menu (uppercase in UI)
  await page.getByRole('button', { name: /^Note$/i }).first().click();

  // ── Type into the new card's title input ─────────────────────────
  const titleInput = page.locator('.cv-card input').last();
  await expect(titleInput).toBeVisible({ timeout: 5_000 });
  await titleInput.click();
  await titleInput.fill('E2E persisted note');

  // Wait for the save indicator to flip to "Salvato"
  await expect(page.getByText(/Salvato/)).toBeVisible({ timeout: 8_000 });

  // ── Reload the canvas — note should still be there ───────────────
  await page.reload();
  await expect(page.locator('input[value="E2E persisted note"]')).toBeVisible({ timeout: 10_000 });

  console.log('Test canvas:', canvasUrl);
});
