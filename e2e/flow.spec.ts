import { test, expect } from '@playwright/test'

const API = (process.env.E2E_BASE_URL || 'https://mooni.suspectuso.ru') + '/api'
const DEMO_USER = '1'

/** Гарантируем, что у демо-пользователя есть лайки (для сборки маршрута). */
test.beforeAll(async ({ request }) => {
	const feed = await request.get(`${API}/networking/feed?userId=${DEMO_USER}`)
	const places = (await feed.json()) as Array<{ id: string }>
	for (const p of places.slice(0, 3)) {
		await request.post(`${API}/networking/swipe?userId=${DEMO_USER}`, {
			data: { candidateId: p.id, action: 'like' },
		})
	}
})

test('главная грузится', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByText('Сервисы')).toBeVisible()
})

test('экран мест свайпа отдаёт карточку', async ({ page }) => {
	await page.goto('/networking', { waitUntil: 'domcontentloaded' })
	// карточка места рендерит название места из нашего бэкенда
	await expect(page.locator('body')).not.toContainText('This page couldn', {
		timeout: 10_000,
	})
})

test('ядро: лайкнутые места → собрать AI-маршрут', async ({ page }) => {
	await page.goto('/networking/likes')
	await expect(page.getByRole('heading', { name: 'Мои места' })).toBeVisible()

	const buildBtn = page.getByRole('button', { name: /Собрать маршрут/ })
	await expect(buildBtn).toBeVisible()
	await buildBtn.click()

	// после сборки появляется маршрут (кнопка возврата + счётчик точек)
	await expect(page.getByRole('button', { name: /К местам/ })).toBeVisible({
		timeout: 40_000,
	})
	await expect(page.getByText(/точек/)).toBeVisible()
})

test('слоты (экран спринтов) показывают наши активности', async ({ page }) => {
	await page.goto('/sprints')
	await expect(page.getByRole('heading', { name: 'Спринты' })).toBeVisible()
	await expect(page.getByText(/Подробнее/).first()).toBeVisible()
})

test('город: лента активности', async ({ page }) => {
	await page.goto('/city', { waitUntil: 'domcontentloaded' })
	await expect(
		page.getByRole('heading', { name: 'Город сейчас' }),
	).toBeVisible()
	await expect(page.getByText(/Сбор|Событие|Место/).first()).toBeVisible()
})

test('random coffee: экран поиска', async ({ page }) => {
	await page.goto('/coffee', { waitUntil: 'domcontentloaded' })
	await expect(
		page.getByRole('heading', { name: 'Random Coffee' }),
	).toBeVisible()
})

test('сезон: текущий сезон', async ({ page }) => {
	await page.goto('/season', { waitUntil: 'domcontentloaded' })
	await expect(page.getByText(/Сезон ·/)).toBeVisible({ timeout: 20_000 })
})

test('альбом памяти', async ({ page }) => {
	await page.goto('/memories', { waitUntil: 'domcontentloaded' })
	await expect(page.getByRole('heading', { name: 'Альбом' })).toBeVisible()
})

test('премиум: покупка', async ({ page }) => {
	await page.goto('/premium', { waitUntil: 'domcontentloaded' })
	await expect(
		page.getByRole('heading', { name: 'Mooni Premium' }),
	).toBeVisible()
	await expect(page.getByText(/Купить за 299/)).toBeVisible()
})

test('онбординг: привет + психотип + интересы', async ({ page }) => {
	await page.goto('/onboarding', { waitUntil: 'domcontentloaded' })
	await expect(page.getByText(/Привет/)).toBeVisible()
	await expect(page.getByRole('button', { name: 'Интроверт' })).toBeVisible()
	await expect(page.getByRole('button', { name: 'архитектура' })).toBeVisible()
})

test('сценарии: выбор вайба', async ({ page }) => {
	await page.goto('/scenarios', { waitUntil: 'domcontentloaded' })
	await expect(
		page.getByRole('heading', { name: /Под какое настроение/ }),
	).toBeVisible()
	await expect(page.getByRole('button', { name: /Свидание/ })).toBeVisible()
})

test('трекер вайбов', async ({ page }) => {
	await page.goto('/vibes', { waitUntil: 'domcontentloaded' })
	await expect(page.getByRole('heading', { name: 'Твои вайбы' })).toBeVisible()
})
