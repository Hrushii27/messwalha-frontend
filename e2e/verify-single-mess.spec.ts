import { test, expect } from '@playwright/test';

test('Verify Single Mess Policy on Production', async ({ page }) => {
  // 1. Go to login
  await page.goto('https://www.findmess.me/login');
  
  // 2. Login as existing owner
  await page.fill('input[type="email"]', 'newowner@findmess.me');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button:has-text("Sign In")');

  // 3. Wait for dashboard
  await page.waitForURL('**/owner/dashboard');
  
  // 4. Go to Add Mess
  await page.goto('https://www.findmess.me/owner/add-mess');
  
  // 5. Wait for the Registration Blocked UI to appear
  // Usually this has a specific text or a redirect back to dashboard.
  // We'll wait a bit to see what the page settles on.
  await page.waitForTimeout(3000);
  
  // 6. Capture screenshot
  await page.screenshot({ path: 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\bcf9d896-a2ba-482a-b118-5394d9e04d23\\verify_single_mess.png', fullPage: true });


  // 7. Verify the text "Registration Blocked" or we are redirected
  const url = page.url();
  console.log('Current URL after trying to add mess:', url);
  
  const text = await page.innerText('body');
  console.log('PAGE TEXT PREVIEW:', text.substring(0, 500));

  if (url.includes('/owner/dashboard')) {
      console.log('Successfully redirected to dashboard (Policy Enforced)!');
  } else {
      if (text.includes('Registration Blocked') || text.includes('already registered') || text.includes('REGISTRATION BLOCKED')) {
          console.log('Successfully blocked on Add Mess page (Policy Enforced)!');
      } else {
          console.log('Policy may not be enforced properly, see screenshot.');
      }
  }
});
