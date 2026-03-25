import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const browser = await chromium.launch({
  executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=swiftshader']
});

const page = await browser.newPage();
await page.setViewportSize({ width: 1400, height: 900 });
await page.goto('http://localhost:5174', { timeout: 60000, waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2000);

// Take initial screenshot of the full app
await page.screenshot({ path: 'docs/screenshots/dice-roller/01-app-overview.png' });

// Click the "🎲 Dice" toggle button to open the dice roller
const toggleBtn = await page.locator('.dice-toggle-btn');
await toggleBtn.click();
await page.waitForTimeout(300);

// Take screenshot with dice roller open (no roll yet)
await page.screenshot({ path: 'docs/screenshots/dice-roller/02-dice-roller-open.png' });

// Click d20 die button (it's the default but click to be sure)
const d20Btn = await page.locator('.dice-btn').filter({ hasText: 'd20' });
await d20Btn.click();

// Click "Adv" button (exact match)
const advBtn = await page.locator('.adv-btn').filter({ hasText: /^Adv$/ });
await advBtn.click();

// Click Roll button
const rollBtn = await page.locator('.roll-btn');
await rollBtn.click();
await page.waitForTimeout(200);

// Take another roll
await rollBtn.click();
await page.waitForTimeout(200);

// Click d6 to switch die
const d6Btn = await page.locator('.dice-btn').filter({ hasText: 'd6' });
await d6Btn.click();

// Set dice count to 3
const countInput = await page.locator('.dice-input').first();
await countInput.fill('3');

// Roll 3d6
await rollBtn.click();
await page.waitForTimeout(200);

// Roll again for more history
await rollBtn.click();
await page.waitForTimeout(200);

// Switch to d8
const d8Btn = await page.locator('.dice-btn').filter({ hasText: 'd8' });
await d8Btn.click();

// Roll d8
await rollBtn.click();
await page.waitForTimeout(200);

// Take screenshot with history showing
await page.screenshot({ path: 'docs/screenshots/dice-roller/03-dice-roller-with-history.png' });

// Now screenshot just the right panel
const rightPanel = await page.locator('.app-initiative');
await rightPanel.screenshot({ path: 'docs/screenshots/dice-roller/04-right-panel-close-up.png' });

// Click a history entry to show details
const historyEntries = await page.locator('.history-entry');
const count = await historyEntries.count();
if (count > 1) {
  await historyEntries.nth(1).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'docs/screenshots/dice-roller/05-history-entry-selected.png' });
}

// Test keyboard shortcut: press D to close
await page.keyboard.press('d');
await page.waitForTimeout(300);
await page.screenshot({ path: 'docs/screenshots/dice-roller/06-dice-roller-closed-shortcut.png' });

// Press D again to reopen
await page.keyboard.press('d');
await page.waitForTimeout(300);
await page.screenshot({ path: 'docs/screenshots/dice-roller/07-dice-roller-reopened.png' });

await browser.close();
console.log('Screenshots saved to docs/screenshots/dice-roller/');
