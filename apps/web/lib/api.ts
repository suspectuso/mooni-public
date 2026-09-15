import axios from 'axios'
import { getInitData } from '../utils/telegram'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const api = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
	},
})

// Хардненинг: подписанный Telegram initData в каждый запрос — бэк доверяет ему, а не ?userId.
api.interceptors.request.use((config) => {
	const initData = getInitData()
	if (initData) config.headers['X-Telegram-Init-Data'] = initData
	return config
})

export const usersApi = {
	createOrUpdate: (data: any) => api.post('/users', data),
	getByTelegramId: (telegramId: string) => api.get(`/users/${telegramId}`),
	updateBio: (id: string, bio: string) => api.put(`/users/${id}/bio`, { bio }),
}

export const habitsApi = {
	create: (data: any) => api.post('/habits', data),
	update: (id: string, data: any) => api.patch(`/habits/${id}`, data),
	getUserHabits: (userId: string) => api.get(`/habits/user/${userId}`),
	logHabit: (data: any) => api.post('/habits/log', data),
	getStats: (habitId: string, days?: number) =>
		api.get(`/habits/${habitId}/stats`, { params: { days } }),
	delete: (id: string, userId: string) =>
		api.delete(`/habits/${id}`, { data: { userId } }),
}

export const leaderboardApi = {
	get: (limit?: number, category?: string) =>
		api.get('/leaderboard', { params: { limit, category } }),
}

export const marathonsApi = {
	getActive: () => api.get('/marathons'),
	get: (id: string) => api.get(`/marathons/${id}`),
	getLeaderboard: (id: string) => api.get(`/marathons/${id}/leaderboard`),
	join: (id: string, userId: string) =>
		api.post(`/marathons/${id}/join`, { userId }),
	create: (data: {
		title: string
		description?: string
		startDate: string
		endDate: string
	}) => api.post('/marathons', data),
}

export const sprintsApi = {
	getActive: () => api.get('/sprints'),
	getUserSprints: (userId: string) => api.get(`/sprints/user/${userId}`),
	get: (id: string) => api.get(`/sprints/${id}`),
	getLeaderboard: (id: string) => api.get(`/sprints/${id}/leaderboard`),
	getTaskStatus: (id: string, userId: string) =>
		api.get(`/sprints/${id}/user/${userId}/task-status`),
	join: (id: string, userId: string) =>
		api.post(`/sprints/${id}/join`, { userId }),
	leave: (id: string, userId: string) =>
		api.delete(`/sprints/${id}/leave`, { data: { userId } }),
	completeTask: (id: string, userId: string, note?: string) =>
		api.post(`/sprints/${id}/complete-task`, { userId, note }),
	create: (data: {
		title: string
		description?: string
		taskTitle: string
		taskDescription?: string
		startDate?: string
		endDate?: string
	}) => api.post('/sprints', data),
}
