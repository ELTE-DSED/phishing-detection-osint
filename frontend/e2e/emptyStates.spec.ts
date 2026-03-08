/**
 * E2E — Empty States
 *
 * Visit history with no data → See empty illustration.
 * Visit results with no analysis → See empty state.
 */

import { test, expect } from "@playwright/test";
import { mockApi, clearStorage } from "./fixtures";

test.describe("Empty States", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await page.goto("/");
    await clearStorage(page);
  });

  test("history page shows empty state when no analyses exist", async ({ page }) => {
    await page.goto("/history");

    /* Should show empty state */
    await expect(page.getByText("No Analyses Yet")).toBeVisible();

    /* Should have CTA to start analysing */
    await expect(page.getByRole("link", { name: "Start Analysing" })).toBeVisible();
  });

  test("results page shows empty state without analysis", async ({ page }) => {
    await page.goto("/results");

    /* Should show no results message */
    await expect(page.getByText("No Results Yet")).toBeVisible();

    /* Should have CTA to go to analyse */
    await expect(page.getByRole("link", { name: "Go to Analyse" })).toBeVisible();
  });

  test("clicking CTA from empty history navigates to analyse", async ({ page }) => {
    await page.goto("/history");

    await page.getByRole("link", { name: "Start Analysing" }).click();
    await page.waitForURL("**/analyze");
    await expect(page.getByRole("heading", { name: "Analyse Content" })).toBeVisible();
  });

  test("clicking CTA from empty results navigates to analyse", async ({ page }) => {
    await page.goto("/results");

    await page.getByRole("link", { name: "Go to Analyse" }).click();
    await page.waitForURL("**/analyze");
    await expect(page.getByRole("heading", { name: "Analyse Content" })).toBeVisible();
  });
});
