/**
 * E2E — Error Handling
 *
 * Submit with backend down → See error toast / message.
 */

import { test, expect } from "@playwright/test";
import { mockApiDown, clearStorage } from "./fixtures";

test.describe("Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await mockApiDown(page);
    await page.goto("/");
    await clearStorage(page);
  });

  test("shows error when backend is unreachable during analysis", async ({ page }) => {
    await page.goto("/analyze");

    await page.locator("#content").fill("https://malicious-site.com");
    await page.getByRole("button", { name: "Analyse" }).click();

    /* Should show an error toast or error message */
    await expect(
      page.getByText(/error|failed|unavailable|could not/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows degraded health status", async ({ page }) => {
    /* The header health indicator should show unhealthy */
    await page.goto("/");

    await expect(
      page.getByText(/unhealthy|degraded|checking/i).first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("prevents submission with empty content", async ({ page }) => {
    await page.goto("/analyze");

    /* Analyse button should be disabled when input is empty */
    const analyseButton = page.getByRole("button", { name: "Analyse" });
    await expect(analyseButton).toBeDisabled();
  });
});
