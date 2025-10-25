import re
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Login to Medusa Admin
    page.goto("http://localhost:9000/admin")
    page.get_by_placeholder("Email").fill("admin@medusa-test.com")
    page.get_by_placeholder("Password").fill("supersecret")
    page.get_by_role("button", name="Continue").click()

    # Wait for login to complete and navigate to products
    expect(page.get_by_text("Getting started")).to_be_visible(timeout=20000) # Dashboard text
    page.goto("http://localhost:9000/admin/products")

    # Click the first product to go to details page
    expect(page.locator("table > tbody > tr:first-child")).to_be_visible(timeout=10000)
    page.locator("table > tbody > tr:first-child > td:nth-child(2) > a").click()

    # Verify and screenshot the Technical Sheets widget
    technical_sheets_widget = page.get_by_role("heading", name="Technical Sheets")
    expect(technical_sheets_widget).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/admin_technical_sheets.png")

    # Navigate to the bundles page (custom route)
    page.goto("http://localhost:9000/a/bundles")

    # Verify and screenshot the Bundles page
    bundles_heading = page.get_by_role("heading", name="Manage Bundles")
    expect(bundles_heading).to_be_visible(timeout=10000)
    page.screenshot(path="jules-scratch/verification/admin_bundles_page.png")

    context.close()
    browser.close()

# Main execution block
if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
