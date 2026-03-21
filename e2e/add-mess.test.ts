import { test, expect } from '@playwright/test';

test.describe('Add Mess Functionality (Mocked)', () => {
  test('should allow an owner to add a new mess', async ({ page }) => {
    // Enable console logging from the browser
    page.on('console', msg => console.log(`BROWSER: ${msg.text()}`));

    // Specific mock for backend API calls only
    const API_URL = 'http://localhost:5000/api';

    await page.route(`${API_URL}/**`, async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // 1. Mock Registration
      if (url.includes('/auth/owner-register') && method === 'POST') {
        console.log('MOCK: Intercepted registration call');
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
              token: 'fake-jwt-token',
              user: { id: 1, name: 'Test Owner', role: 'OWNER', email: 'testowner@example.com' }
          }),
        });
        return;
      }

      // 2. Mock Subscription Status
      if (url.includes('/subscriptions/status')) {
        console.log('MOCK: Intercepted subscription status check');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { status: 'active', subscription_end: '2027-01-01' } }),
        });
        return;
      }

      // 3. Mock Messes (POST to create, GET to list)
      if (url.includes('/messes')) {
        console.log(`MOCK: Intercepted messes call [${method}]`);
        if (method === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, message: 'Mess added successfully' }),
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, count: 1, data: [
              { 
                id: 101, 
                name: 'Test Mess 123', 
                mess_name: 'Test Mess 123',
                address: 'Test Address, Pune', 
                price_per_month: 3000, 
                mess_image: 'sample_plate.png',
                owner_name: 'Test Owner',
                mobile: '1234567890',
                verified: true
              }
            ] }),
          });
        }
        return;
      }

      // 4. Mock Favorites
      if (url.includes('/favorites')) {
        console.log('MOCK: Intercepted favorites call');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: [] }),
        });
        return;
      }

      // 5. Default success for other backend API calls
      console.log(`MOCK: Default success for ${method} ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }),
      });
    });

    // 1. Register as owner (Mocked)
    console.log('TEST: Navigating to registration page');
    await page.goto('/mess-owner-register');
    await page.waitForLoadState('networkidle');
    
    // Fill Owner Registration Form
    await page.fill('input[name="name"]', 'Test Owner');
    await page.fill('input[name="email"]', 'testowner@example.com');
    await page.fill('input[name="phone"]', '9876543210');
    await page.fill('input[name="password"]', 'Password@123');
    await page.fill('input[name="confirmPassword"]', 'Password@123');
    await page.fill('input[name="messName"]', 'Test Mess 123');
    await page.fill('input[name="city"]', 'Pune');
    await page.fill('input[name="location"]', 'Kothrud, near MIT College');
    
    // Click register
    console.log('TEST: Clicking register button');
    await page.click('button:has-text("Start My 60-Day Free Trial")');
    
    // Redirection to dashboard
    console.log('TEST: Waiting for dashboard redirection');
    await expect(page).toHaveURL(/\/owner\/dashboard/, { timeout: 15000 });
    console.log('TEST: Reached dashboard');

    // 2. Navigate to Add Mess
    console.log('TEST: Navigating to add-mess page');
    await page.goto('/owner/add-mess');
    await page.waitForLoadState('networkidle');
    
    // Safety check: Are we still authenticated?
    const currentURL = page.url();
    console.log(`TEST: Current URL: ${currentURL}`);
    if (currentURL.includes('/login')) {
        console.error('TEST FAIL: Redirected to login page!');
        throw new Error('Redirected to login page');
    }

    // 3. Fill Add Mess form
    console.log('TEST: Filling add-mess form');
    await page.locator('input[name="messName"]').waitFor({ state: 'visible', timeout: 10000 });
    await page.fill('input[name="messName"]', 'Test Mess 123');
    await page.fill('input[name="ownerName"]', 'Test Owner');
    await page.fill('input[name="mobile"]', '1234567890');
    await page.fill('input[name="address"]', 'Test Address, Pune');
    await page.fill('input[name="pricePerMonth"]', '3000');
    await page.fill('input[name="pricePerWeek"]', '800');
    await page.fill('input[name="pricePerDay"]', '120');
    await page.fill('input[name="upiId"]', 'test@upi');
    await page.fill('textarea[name="menuText"]', 'Monday: Poha\nTuesday: Upma');

    // 4. Upload image
    console.log('TEST: Uploading image');
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('text=Click to Upload'),
    ]);
    await fileChooser.setFiles('sample_plate.png');

    // 5. Submit
    console.log('TEST: Submitting form');
    await page.click('button:has-text("Submit Mess Registry")');

    // 6. Verify Success
    console.log('TEST: Verifying success message');
    await expect(page.locator('text=Mess Registered!')).toBeVisible({ timeout: 10000 });
    
    // 7. Verify Redirection
    console.log('TEST: Waiting for final redirection to /find-mess');
    await page.waitForTimeout(4000); // Wait for the redirect in the component (setTimeout 3000)
    await expect(page).toHaveURL(/\/find-mess/);

    // 8. Verify mess appears in list
    console.log('TEST: Verifying mess appears in list');
    // The list is mocked to return the new mess.
    await expect(page.locator('text=Test Mess 123')).toBeVisible({ timeout: 10000 });
    console.log('TEST: All steps completed successfully');
  });
});
