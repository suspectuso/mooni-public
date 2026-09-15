import { defineConfig, devices } from '@playwright/test'

/**
 * E2E против задеплоенного Mooni (по умолчанию прод).
 * Переопределить: E2E_BASE_URL=http://localhost:3030 pnpm test:e2e
 */
export default defineConfig({
	testDir: './e2e',
	timeout: 60_000,
	expect: { timeout: 15_000 },
	retries: 1,
	reporter: [['list']],
	use: {
		baseURL: process.env.E2E_BASE_URL || 'https://mooni.suspectuso.ru',
		trace: 'on-first-retry',
		viewport: { width: 390, height: 844 },
	},
	projects: [{ name: 'chromium', use: { ...devices['Pixel 5'] } }],
})
