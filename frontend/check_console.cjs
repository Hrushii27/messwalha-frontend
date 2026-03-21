const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', error => {
    console.error(`Page error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error(`Console error: ${msg.text()}`);
    } else if (msg.type() === 'warning') {
      console.warn(`Console warning: ${msg.text()}`);
    } else {
      console.log(`Console msg: ${msg.text()}`);
    }
  });

  console.log('Navigating to http://localhost:5173/mess/45/menu...');
  try {
    await page.goto('http://localhost:5173/mess/45/menu', { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('Goto error:', e.message);
  }
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await browser.close();
})();
