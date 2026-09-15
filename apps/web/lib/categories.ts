export const HABIT_CATEGORIES = {
	ALL: { name: 'Все', color: '#6b7280' },
	SPORT: { name: 'Спорт', color: '#fc2a0d' },
	MENTAL: { name: 'Ментальное', color: '#9333ea' },
	READING: { name: 'Чтение', color: '#3b82f6' },
	HEALTH: { name: 'Здоровье', color: '#ef4444' },
	PRODUCTIVITY: { name: 'Продуктивность', color: '#f59e0b' },
	CREATIVITY: { name: 'Творчество', color: '#ec4899' },
	SOCIAL: { name: 'Социальное', color: '#10b981' },
	FINANCE: { name: 'Финансы', color: '#14b8a6' },
	LEARNING: { name: 'Обучение', color: '#6366f1' },
	NUTRITION: { name: 'Питание', color: '#84cc16' },
	SLEEP: { name: 'Сон', color: '#8b5cf6' },
	MEDITATION: { name: 'Медитация', color: '#a855f7' },
	HOBBY: { name: 'Хобби', color: '#f97316' },
	WORK: { name: 'Работа', color: '#64748b' },
	OTHER: { name: 'Другое', color: '#6b7280' },
}

export type HabitCategory = keyof typeof HABIT_CATEGORIES
