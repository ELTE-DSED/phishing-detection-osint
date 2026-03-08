/**
 * E2E — Settings
 *
 * Change API URL → Test connection → Verify status.
 */

import { test, expect } from "@playwright/test";
import { mockApi } from "./fixtures";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/settings");
  });

  test("displays about information", async ({ page }) => {
    /* About card information */
    const aboutSection = page.locator('[data-slot="card"]').filter({ hasText: "About" });
    await expect(aboutSection.getByText("Ishaq Muhammad")).toBeVisible();
    await expect(aboutSection.getByText("Eötvös Loránd University")).toBeVisible();
  });

  test("tests API connection successfully", async ({ page }) => {
    /* API URL field should have default value */
    const apiUrlInput = page.locator("#apiUrl");
    await expect(apiUrlInput).toBeVisible();

    /* Click "Test" button */
    await page.getByRole("button", { name: "Test" }).click();

    /* Wait for connection result — match the exact badge text */
    await expect(page.getByText("Connected", { exact: true })).toBeVisible({ timeout: 5_000 });
  });

  test("changes detail level setting", async ({ page }) => {
    /* Open the detail-level dropdown and pick "Expert" */
    await page.locator("#detailLevel").click();
    await page.getByRole("option", { name: /expert/i }).click();

    /* Verify the trigger now shows "Expert" */
    await expect(page.locator("#detailLevel")).toContainText(/expert/i);

    /* Verify persistence after reload */
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page.locator("#detailLevel")).toContainText(/expert/i);
  });

  test("resets settings to defaults", async ({ page }) => {
    /* Change something first */
    await page.locator("#detailLevel").click();
    await page.getByRole("option", { name: /expert/i }).click();

    /* Click reset */
    await page.getByRole("button", { name: /reset to defaults/i }).click();

    /* Detail level should be back to "Detailed" */
    await expect(page.locator("#detailLevel")).toContainText(/detailed/i);
  });
});
