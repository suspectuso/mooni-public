'use client'

import { useEffect, useMemo, useState } from 'react'
import { getUserId } from '@/utils/telegram'

/**
 * Данные пинов карты из 4 источников (места/впечатления/события/сборы). Нормализуем в единый Pin,
 * отбрасываем всё без координат. Если API недоступен или пусто — отдаём STUB (СПб-достопримечательности),
 * чтобы экран не был пустым. Дистанция считается от геопозиции пользователя (если разрешена).
 */

export type PinType = 'place' | 'experience' | 'event' | 'sprint'

export interface Pin {
	id: string
	type: PinType
	name: string
	lat: number
	lng: number
	photo?: string
	district?: string
	tags?: string[]
	rating?: number
	distanceKm?: number
	recommended?: boolean
}

// Достопримечательности СПб — стаб на случай недоступного API/ключа (тип place со звёздочкой sight).
const STUB: Pin[] = [
	{ id: 's1', type: 'place', name: 'Эрмитаж', lat: 59.9398, lng: 30.3146, district: 'Центральный', tags: ['искусство', 'музей'], rating: 4.9, recommended: true },
	{ id: 's2', type: 'place', name: 'Новая Голландия', lat: 59.9286, lng: 30.2867, district: 'Адмиралтейский', tags: ['парк', 'отдых'], rating: 4.8 },
	{ id: 's3', type: 'place', name: 'Летний сад', lat: 59.9455, lng: 30.3352, district: 'Центральный', tags: ['парк', 'прогулка'], rating: 4.7 },
	{ id: 's4', type: 'event', name: 'Развод мостов', lat: 59.9433, lng: 30.3089, district: 'Центральный', tags: ['ночь'], rating: 4.9 },
	{ id: 's5', type: 'place', name: 'Севкабель Порт', lat: 59.9269, lng: 30.2385, district: 'Васильевский', tags: ['движ', 'кофе'], rating: 4.6, recommended: true },
	{ id: 's6', type: 'place', name: 'Никольские ряды', lat: 59.9231, lng: 30.3009, district: 'Адмиралтейский', tags: ['еда', 'двор'], rating: 4.5 },
]

const SPB: [number, number] = [59.9386, 30.3141]

function num(v: unknown): number | null {
	const n = typeof v === 'string' ? parseFloat(v) : (v as number)
	return Number.isFinite(n) ? (n as number) : null
}

function haversineKm(a: [number, number], b: [number, number]): number {
	const R = 6371
	const dLat = ((b[0] - a[0]) * Math.PI) / 180
	const dLng = ((b[1] - a[1]) * Math.PI) / 180
	const s =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
	return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

async function fetchJson(url: string): Promise<unknown[]> {
	try {
		const r = await fetch(url)
		if (!r.ok) return []
		const j = await r.json()
		return Array.isArray(j) ? j : []
	} catch {
		return []
	}
}

function normalize(raw: {
	places: unknown[]
	experiences: unknown[]
	events: unknown[]
	sprints: unknown[]
}): Pin[] {
	const out: Pin[] = []

	raw.places.forEach((p, i) => {
		const o = p as Record<string, unknown>
		const lat = num(o.lat ?? o.latitude)
		const lng = num(o.lng ?? o.longitude)
		if (lat == null || lng == null) return
		out.push({
			id: String(o.id ?? `place-${i}`),
			type: 'place',
			name: String(o.networkingName ?? o.name ?? 'Место'),
			lat,
			lng,
			photo: (o.networkingPhoto ?? o.photo) as string | undefined,
			district: (o.networkingLocation ?? o.district) as string | undefined,
			tags: (o.tags as string[]) ?? [],
			recommended: i < 3, // первые в подобранной колоде — рекомендации Луми
		})
	})

	// впечатления и сборы в модели пока без координат → пинов не будет, но нормализуем на будущее
	raw.experiences.forEach((e, i) => {
		const o = e as Record<string, unknown>
		const lat = num(o.lat)
		const lng = num(o.lng)
		if (lat == null || lng == null) return
		out.push({ id: String(o.id ?? `exp-${i}`), type: 'experience', name: String(o.title ?? 'Впечатление'), lat, lng, photo: o.photo as string | undefined })
	})
	raw.events.forEach((e, i) => {
		const o = e as Record<string, unknown>
		const lat = num(o.lat)
		const lng = num(o.lng)
		if (lat == null || lng == null) return
		out.push({ id: String(o.id ?? `evt-${i}`), type: 'event', name: String(o.title ?? 'Событие'), lat, lng, photo: o.imageUrl as string | undefined, district: o.placeName as string | undefined })
	})
	raw.sprints.forEach((s, i) => {
		const o = s as Record<string, unknown>
		const lat = num(o.lat)
		const lng = num(o.lng)
		if (lat == null || lng == null) return
		out.push({ id: String(o.id ?? `spr-${i}`), type: 'sprint', name: String(o.title ?? 'Сбор'), lat, lng })
	})

	return out
}

export function useMapData(mood?: string | null) {
	const [pins, setPins] = useState<Pin[]>([])
	const [loading, setLoading] = useState(true)
	const [userLoc, setUserLoc] = useState<[number, number] | null>(null)

	useEffect(() => {
		let alive = true
		;(async () => {
			const uid = getUserId()
			const q = uid ? `?userId=${uid}` : ''
			const moodQ = mood ? `${q ? '&' : '?'}mood=${encodeURIComponent(mood)}` : ''
			const [places, experiences, events, sprints] = await Promise.all([
				fetchJson(`/api/networking/feed${q}${moodQ}`),
				fetchJson(`/api/experiences`),
				fetchJson(`/api/events/upcoming`),
				fetchJson(`/api/sprints${q}`),
			])
			if (!alive) return
			const norm = normalize({ places, experiences, events, sprints })
			setPins(norm.length ? norm : STUB)
			setLoading(false)
		})()
		return () => {
			alive = false
		}
	}, [mood])

	// дистанция от пользователя (если разрешит гео)
	const withDistance = useMemo(() => {
		const origin = userLoc ?? SPB
		return pins
			.map((p) => ({ ...p, distanceKm: haversineKm(origin, [p.lat, p.lng]) }))
			.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
	}, [pins, userLoc])

	return { pins: withDistance, loading, userLoc, setUserLoc, isStub: !loading && pins === STUB }
}

export { SPB }
