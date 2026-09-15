'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

interface Pt {
	lat?: number | null
	lng?: number | null
	name: string
}

/**
 * Карта маршрута: рисует линию через точки-места с нумерованными маркерами.
 * Leaflet грузится динамически (client-only). Точки без координат отбрасываются;
 * если валидных точек нет — компонент не рендерит карту.
 */
export default function RouteMap({
	points,
	height = 260,
}: {
	points: Pt[]
	height?: number
}) {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		let destroyed = false
		let map: import('leaflet').Map | null = null

		;(async () => {
			const L = (await import('leaflet')).default
			const pts = points.filter(
				(p): p is { lat: number; lng: number; name: string } =>
					typeof p.lat === 'number' && typeof p.lng === 'number',
			)
			if (destroyed || !ref.current || pts.length === 0) return

			map = L.map(ref.current, {
				zoomControl: false,
				attributionControl: false,
				scrollWheelZoom: false,
			})
			L.tileLayer(
				'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
				{ maxZoom: 19, attribution: '© OpenStreetMap, © CARTO' },
			).addTo(map)

			const latlngs = pts.map((p) => [p.lat, p.lng] as [number, number])
			L.polyline(latlngs, {
				color: '#65fff7',
				weight: 4,
				opacity: 0.9,
			}).addTo(map)

			pts.forEach((p, i) => {
				const icon = L.divIcon({
					className: '',
					html: `<div style="width:26px;height:26px;border-radius:50%;background:#65fff7;color:#121212;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;border:2px solid #121212;box-shadow:0 0 0 2px #65fff7">${i + 1}</div>`,
					iconSize: [26, 26],
					iconAnchor: [13, 13],
				})
				L.marker([p.lat, p.lng], { icon })
					.addTo(map as import('leaflet').Map)
					.bindPopup(p.name)
			})

			map.fitBounds(L.latLngBounds(latlngs).pad(0.25), { maxZoom: 15 })
		})()

		return () => {
			destroyed = true
			try {
				map?.remove()
			} catch {
				// карта уже снята
			}
		}
	}, [points])

	const hasCoords = points.some(
		(p) => typeof p.lat === 'number' && typeof p.lng === 'number',
	)
	if (!hasCoords) return null

	return (
		<div
			ref={ref}
			style={{
				height,
				borderRadius: 16,
				overflow: 'hidden',
				marginBottom: 16,
				// замыкаем z-index leaflet (его панели/маркеры = 600/700) в свой
				// stacking-контекст, иначе карта перекрывает фикс-навигацию при скролле
				isolation: 'isolate',
				position: 'relative',
				zIndex: 0,
			}}
		/>
	)
}
