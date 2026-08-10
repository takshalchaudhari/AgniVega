import { test, expect } from "@playwright/test";

test.describe("Smart Krishi-Yatra AI Demo Journey", () => {
  test("Farmer Journey: calculation, delay injection, and re-optimization", async ({ page }) => {
    // 1. Open the application
    await page.goto("/");

    // Wait for the app to load
    await expect(page.getByRole("heading", { name: /What will you actually earn/i })).toBeVisible();

    // 2. Navigate to Farmer Portal
    await page.getByRole("link", { name: /Open Farmer Portal/i }).click();

    // 3. Ensure Demo Mode is active
    const demoToggle = page.locator('button:has-text("Demo Mode")');
    if (await demoToggle.isVisible()) {
      const isPressed = await demoToggle.getAttribute("aria-pressed");
      if (isPressed !== "true") {
        await demoToggle.click();
      }
    }

    // 4. Enter Farmer Details
    // The quantity input might be named differently
    await page.getByLabel(/Quantity/i).fill("10");

    // 5. Calculate Recommendation
    await page.getByRole("button", { name: /Calculate & Pool/i }).click();

    // 6. View market comparison and ENR
    await expect(page.locator("text=All mandis ranked by Expected Net Realization")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("text=Expected Net Realization")).first().toBeVisible();

    // 7. Inject a delay
    await page.click("#simulate-delay-btn");

    // 8. Verify ENR/spoilage changes (we expect a delay alert to appear)
    await expect(page.getByText(/Route Delay/i)).toBeVisible({ timeout: 5000 });

    // Verify some text indicating spoilage risk or delay impact
    await expect(page.getByText(/Spoilage/i).first()).toBeVisible();

    // 9. Confirm/dispatch
    await page
      .getByRole("button", { name: /Choose/i })
      .first()
      .click();
    await expect(page.getByText(/Confirm transport/i)).toBeVisible();

    // We don't submit if we are not logged in, but we verified the journey.
  });
});
