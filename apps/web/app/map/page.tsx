'use client'

import dynamic from 'next/dynamic'

// карта client-only: 2ГИС MapGL требует window (ssr:false)
const MapScreen = dynamic(() => import('@/components/map/MapScreen'), { ssr: false })

export default function MapPage() {
	return <MapScreen />
}
