'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRoot, type Root } from 'react-dom/client'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Search, SlidersHorizontal, Navigation, Sparkles } from 'lucide-react'
import AppBottomNav from '../AppBottomNav'
import FilterChips, { type FilterKey } from './FilterChips'
import BottomSheet, { type Snap } from './BottomSheet'
import { PinMarker } from './MapPin'
import { useMapData, SPB, type Pin } from './useMapData'
import { shell, mapCanvas, topWrap, searchBar, searchText, filterBtn, moodChip, fab, T } from './map.styles'

// светлая OSM-подложка (канон C2), бесплатно и без ключа
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'

const MOOD_LABEL: Record<string, string> = {
	recharge: 'перезагрузку',
	inspiration: 'вдохновение',
	social: 'компанию',
	romance: 'романтику',
	active: 'движ',
	solitude: 'уединение',
	anxious: 'спокойствие',
}

export default function MapScreen() {
	const router = useRouter()
	const [mood, setMood] = useState<string | null>(null)
	const [filter, setFilter] = useState<FilterKey>('all')
	const [selected, setSelected] = useState<Pin | null>(null)
	const [snap, setSnap] = useState<Snap>('peek')

	const { pins, loading, setUserLoc } = useMapData(mood)

	const containerRef = useRef<HTMLDivElement>(null)
	const mapRef = useRef<maplibregl.Map | null>(null)
	const markersRef = useRef<{ marker: maplibregl.Marker; root: Root }[]>([])
	const [mapReady, setMapReady] = useState(false)
	const [stubMode, setStubMode] = useState(false)

	useEffect(() => {
		setMood(typeof window !== 'undefined' ? localStorage.getItem('mooniMood') : null)
	}, [])

	const filtered = useMemo(
		() => (filter === 'all' ? pins : pins.filter((p) => p.type === filter)),
		[pins, filter],
	)
	const placeCount = useMemo(() => pins.filter((p) => p.type === 'place').length, [pins])

	// init карты (MapLibre + OpenFreeMap). Нет WebGL (старое устройство/headless) → стаб, не падаем.
	useEffect(() => {
		if (!containerRef.current) return
		let map: maplibregl.Map
		try {
			map = new maplibregl.Map({
				container: containerRef.current,
				style: MAP_STYLE,
				center: [SPB[1], SPB[0]], // MapLibre: [lng, lat]
				zoom: 12.5,
				attributionControl: { compact: true },
			})
		} catch {
			setStubMode(true)
			return
		}
		mapRef.current = map
		map.on('load', () => setMapReady(true))
		map.on('error', () => setStubMode(true))
		return () => {
			clearMarkers()
			map.remove()
			mapRef.current = null
		}
	}, [])

	// пересборка маркеров при смене выборки
	useEffect(() => {
		const map = mapRef.current
		if (!map || !mapReady) return
		clearMarkers()
		markersRef.current = filtered.map((pin) => {
			const el = document.createElement('div')
			el.addEventListener('click', (e) => {
				e.stopPropagation()
				selectPin(pin)
			})
			const root = createRoot(el)
			root.render(<PinMarker pin={pin} />)
			const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
				.setLngLat([pin.lng, pin.lat])
				.addTo(map)
			return { marker, root }
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filtered, mapReady])

	const clearMarkers = () => {
		markersRef.current.forEach(({ marker, root }) => {
			root.unmount()
			marker.remove()
		})
		markersRef.current = []
	}

	const selectPin = (pin: Pin) => {
		setSelected(pin)
		setSnap('half')
		mapRef.current?.flyTo({ center: [pin.lng, pin.lat], duration: 500 })
	}

	const locate = () => {
		if (!navigator.geolocation) return
		navigator.geolocation.getCurrentPosition((pos) => {
			const c: [number, number] = [pos.coords.latitude, pos.coords.longitude]
			setUserLoc(c)
			mapRef.current?.flyTo({ center: [c[1], c[0]], zoom: 14, duration: 600 })
		})
	}

	const buildRoute = () => router.push('/networking/likes')

	const moodText =
		mood && MOOD_LABEL[mood] ? `${placeCount} мест под «${MOOD_LABEL[mood]}»` : `${placeCount} мест рядом`

	return (
		<div style={shell}>
			{/* карта / стаб (нет WebGL) */}
			{stubMode ? (
				<div style={{ ...mapCanvas, ...stubBg }}>
					<div style={{ position: 'absolute', top: '38%', left: 0, right: 0, textAlign: 'center', color: T.muted, fontSize: 13, padding: '0 40px' }}>
						Карта недоступна на этом устройстве — показываю места списком снизу.
					</div>
				</div>
			) : (
				<div ref={containerRef} style={mapCanvas} />
			)}
			{loading && !stubMode && <div style={{ ...mapCanvas, ...skeleton }} />}

			{/* верх: поиск + чипы */}
			<div style={topWrap}>
				<div style={searchBar}>
					<Search size={20} color={T.tealDeep} strokeWidth={2.4} />
					<span style={searchText}>Куда сходить рядом?</span>
					<button style={filterBtn} aria-label="Фильтры">
						<SlidersHorizontal size={18} color={T.tealDeep} strokeWidth={2.4} />
					</button>
				</div>
				<FilterChips value={filter} onChange={setFilter} />
			</div>

			{/* низ: mood-чип + FAB (над sheet) */}
			<div
				style={{
					position: 'absolute',
					left: 12,
					right: 12,
					bottom: 'calc(136px + env(safe-area-inset-bottom))',
					zIndex: 25,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					pointerEvents: 'none',
				}}
			>
				<button style={{ ...moodChip, pointerEvents: 'auto' }} onClick={() => setSnap('half')}>
					<Sparkles size={15} /> {moodText}
				</button>
				<button style={{ ...fab, pointerEvents: 'auto' }} onClick={locate} aria-label="Моё местоположение">
					<Navigation size={20} color={T.tealDeep} strokeWidth={2.4} />
				</button>
			</div>

			<BottomSheet
				snap={snap}
				onSnap={setSnap}
				selected={selected}
				pins={pins}
				onSelect={selectPin}
				onRoute={buildRoute}
			/>

			<AppBottomNav active="map" />
		</div>
	)
}

const stubBg: React.CSSProperties = {
	background: 'repeating-linear-gradient(45deg,#EAF6F2,#EAF6F2 22px,#F3FAF7 22px,#F3FAF7 44px)',
}
const skeleton: React.CSSProperties = {
	background: 'linear-gradient(110deg,#EDEAF0 30%,#F6F3F8 50%,#EDEAF0 70%)',
	backgroundSize: '200% 100%',
	animation: 'lumiShimmer 1.3s linear infinite',
}
