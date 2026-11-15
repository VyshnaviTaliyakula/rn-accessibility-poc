const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: 'Accessibility Testing PoC',
    }),
  ).toBeVisible();
});

test('page has no detected WCAG A/AA violations', async ({
  page,
}, testInfo) => {
  const results = await new AxeBuilder({ page })
    .withTags([
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa',
      'wcag22aa',
    ])
    .analyze();

  await testInfo.attach('axe-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  expect(results.violations).toEqual([]);
});

test('keyboard focus follows the form order', async ({ page }) => {
  const email = page.getByLabel('Email address', { exact: true });
  const password = page.getByLabel('Password', { exact: true });
  const submit = page.getByRole('button', { name: 'Sign in' });

  await page.keyboard.press('Tab');
  await expect(email).toBeFocused();
  await page.keyboard.type('person@example.com');

  await page.keyboard.press('Tab');
  await expect(password).toBeFocused();
  await page.keyboard.type('example-password');

  await page.keyboard.press('Tab');
  await expect(submit).toBeFocused();

  await expect(submit).toHaveCSS('outline-style', 'solid');
  await expect(submit).toHaveCSS('outline-width', '3px');

  await page.keyboard.press('Enter');
  await expect(page.getByRole('status')).toContainText('This demo does not authenticate accounts.');

  await page.keyboard.press('Shift+Tab');
  await expect(password).toBeFocused();
});

test('form reflows at 320 CSS pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });

  await expect(page.getByLabel('Email address', { exact: true }))
    .toBeInViewport();

  await expect(page.getByRole('button', { name: 'Sign in' }))
    .toBeInViewport();

  const hasHorizontalOverflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
});

test('desktop form has a readable width and the page has document semantics', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page).toHaveTitle('Sign in | Accessibility Testing PoC');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('main')).toBeVisible();
  const form = page.getByRole('form', { name: 'Accessibility Testing PoC' });
  const bounds = await form.boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(440);
  expect(Math.abs(bounds.x + bounds.width / 2 - 720)).toBeLessThan(2);
  await page.screenshot({ path: testInfo.outputPath('desktop-form.png'), fullPage: true });
});

test('required fields block an empty submission', async ({ page }) => {
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByLabel('Email address', { exact: true })).toBeFocused();
  await expect(page.getByRole('status')).toBeEmpty();
  await expect(page.getByRole('alert')).toHaveText('Enter a valid email address.');
});

test('form remains reachable in a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 256 });
  const submit = page.getByRole('button', { name: 'Sign in' });
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeInViewport();
  await page.getByRole('heading').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading')).toBeInViewport();
});

test('resizing across 768px switches layout without losing input or focus', async ({ page }) => {
  const form = page.getByRole('form', { name: 'Accessibility Testing PoC' });
  const email = page.getByLabel('Email address', { exact: true });
  await email.fill('person@example.com');

  for (const [width, expectedWidth] of [[767, 719], [768, 440], [767, 719]]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(async () => (await form.boundingBox()).width).toBe(expectedWidth);
    await expect(email).toHaveValue('person@example.com');
    await expect(email).toBeFocused();
    const bounds = await form.boundingBox();
    expect(Math.abs(bounds.x + bounds.width / 2 - width / 2)).toBeLessThan(2);
  }
});
