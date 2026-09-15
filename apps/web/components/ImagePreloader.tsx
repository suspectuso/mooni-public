'use client'

import { memo, useEffect, useState } from 'react'
import MatchLoader from './MatchLoader'

interface ImagePreloaderProps {
	children: React.ReactNode
	images: string[]
}

const ImagePreloader = memo(function ImagePreloader({
	children,
	images,
}: ImagePreloaderProps) {
	const [loaded, setLoaded] = useState(false)
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		let loadedCount = 0
		const totalImages = images.length

		if (totalImages === 0) {
			setLoaded(true)
			return
		}

		const imagePromises = images.map(src => {
			return new Promise<void>(resolve => {
				const img = new Image()
				img.onload = () => {
					loadedCount++
					const progress = Math.round((loadedCount / totalImages) * 100)
					setProgress(progress)
					resolve()
				}
				img.onerror = error => {
					loadedCount++
					const progress = Math.round((loadedCount / totalImages) * 100)
					console.error(`[ImagePreloader] Failed to load: ${src}`, error)
					setProgress(progress)
					resolve()
				}
				img.src = src
			})
		})

		Promise.all(imagePromises).then(() => {
			setTimeout(() => {
				setLoaded(true)
			}, 300)
		})
	}, [images])

	if (!loaded) {
		return (
			<div
				style={{
					position: 'fixed',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundColor: '#121212',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					zIndex: 99999,
				}}
			>
				<MatchLoader />
				<div
					style={{
						marginTop: '24px',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '14px',
						color: 'rgba(252, 249, 247, 0.6)',
					}}
				>
					Загрузка {progress}%
				</div>
			</div>
		)
	}

	return <>{children}</>
})

export default ImagePreloader
