import { test, expect } from '@playwright/test';

test.describe('FileFaker Faux Integration Tests', () => {
	test('loads the FileMaker Pro-style desktop window and homepage', async ({ page }) => {
		await page.goto('/');

		// Check title bar
		await expect(page.locator('.fm-titlebar')).toContainText('FileFaker Faux 4.0');
		await expect(page.locator('.fm-titlebar')).toContainText('BUSINESS_CONTACTS.FP3');

		// Check menu bar
		await expect(page.locator('.fm-menubar')).toBeVisible();

		// Check toolbar
		await expect(page.getByTitle('Homepage & Recently Accessed')).toBeVisible();
		await expect(page.getByTitle('Form Detail View')).toBeVisible();
		await expect(page.getByTitle('Table / List View')).toBeVisible();

		// Check Recently-Accessed shelf
		await expect(page.locator('.fm-recent-shelf')).toBeVisible();
		await expect(page.locator('.fm-recent-card')).toHaveCount(8);
	});

	test('filters records using global quick search', async ({ page }) => {
		await page.goto('/');

		const searchInput = page.locator('#home-search');
		await expect(searchInput).toBeVisible();

		// Type search term
		await searchInput.fill('Boston');

		// Matching results banner
		await expect(page.locator('text=Matching Search Results')).toBeVisible();

		// Switch to list view to verify filtered results
		await page.getByRole('button', { name: /View Results in List View/i }).click();
		await expect(page.locator('.fm-table tbody tr')).not.toHaveCount(0);
	});

	test('navigates to Form View, flips records, and adds a timestamped note', async ({ page }) => {
		await page.goto('/');

		// Click the first recent record card to open in Form View
		const firstCard = page.locator('.fm-recent-card').first();
		const cardTitle = await firstCard.locator('.font-bold.text-sm').textContent();
		await firstCard.click();

		// Verify Form View is displayed with the selected record
		await expect(page.locator('.fm-form-view')).toBeVisible();
		await expect(page.locator('#rec-name')).toHaveValue(cardTitle?.trim() || '');

		// Verify left-hand Book Flipper is active
		await expect(page.locator('.fm-flipper-container')).toBeVisible();
		const initialRecordNum = await page.locator('.fm-flipper-container input').inputValue();

		// Click Next page on the book flipper
		await page.locator('.fm-book-bottom').click();
		const nextRecordNum = await page.locator('.fm-flipper-container input').inputValue();
		expect(Number(nextRecordNum)).toBe(Number(initialRecordNum) + 1);

		// Switch to Notes History tab
		await page.getByRole('button', { name: /Timestamped Notes History/i }).click();

		// Append a new timestamped note
		const noteInput = page.locator('input[placeholder*="Enter memo"]');
		await noteInput.fill('Playwright integration test note logged.');
		await page.getByRole('button', { name: /Append Note/i }).click();

		// Verify note is appended to the chronological log
		await expect(page.locator('.fm-form-view')).toContainText('Playwright integration test note logged.');
	});

	test('creates a new record via the retro New Record dialog', async ({ page }) => {
		await page.goto('/');

		// Click New Record button in toolbar
		await page.getByRole('button', { name: /✚ New Record/i }).click();

		// Modal should open
		const modal = page.locator('.fm-modal-window');
		await expect(modal).toBeVisible();

		// Fill in form fields
		await modal.locator('#new-name').fill('Acme Automation Works Inc');
		await modal.locator('#new-cat').fill('Industrial Robotics');
		await modal.locator('#new-phone').fill('(617) 555-9080');
		await modal.locator('#new-email').fill('info@acmeautomation.net');
		await modal.locator('input[placeholder="Street Address"]').fill('404 Machine Way');
		await modal.locator('input[placeholder="City"]').fill('Boston');

		// Submit
		await modal.getByRole('button', { name: /Create Record/i }).click();

		// Modal should close and navigate to Form View for the new record
		await expect(modal).not.toBeVisible();
		await expect(page.locator('#rec-name')).toHaveValue('Acme Automation Works Inc');
	});
});
