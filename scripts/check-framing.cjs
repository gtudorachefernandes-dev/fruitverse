const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');

function checkPoster() {
  const stage = document.querySelector('.stage').getBoundingClientRect();
  const boxes = [];
  const issues = [];
  for (const selector of ['#first-word', '#second-word', '.hero-meta', '.visual']) {
    const element = document.querySelector(selector);
    const range = document.createRange();
    range.selectNodeContents(element);
    const box = selector.startsWith('#') ? range.getBoundingClientRect() : element.getBoundingClientRect();
    if (box.left < stage.left - 1 || box.top < stage.top - 1 ||
        box.right > stage.right + 1 || box.bottom > stage.bottom + 1) issues.push(selector + ' outside stage');
    for (const previous of boxes) {
      const width = Math.min(previous.box.right, box.right) - Math.max(previous.box.left, box.left);
      const height = Math.min(previous.box.bottom, box.bottom) - Math.max(previous.box.top, box.top);
      if (width > 2 && height > 2) issues.push(previous.selector + ' overlaps ' + selector);
    }
    boxes.push({selector, box});
  }
  return issues;
}

(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROME_BIN || '/usr/bin/chromium', args:['--no-sandbox']});
  try {
    const page = await browser.newPage({reducedMotion:'reduce'});
    await page.goto(process.argv[2] || 'http://localhost:4173');
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 390, 560, 760, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({width, height:650});
      for (const [index, id] of ['strawberry','mango','blueberry','lime'].entries()) {
        await page.locator('#flavor-picker button').nth(index).evaluate(button => button.click());
        await page.waitForSelector('.hero[data-flavor=' + id + ']');
        assert.deepEqual(await page.evaluate(checkPoster), [], width + 'px / ' + id);
      }
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
