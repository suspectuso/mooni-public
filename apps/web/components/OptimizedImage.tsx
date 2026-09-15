'use client'

import { useState } from 'react'

interface OptimizedImageProps {
	src: string
	alt: string
	width?: number
	height?: number
	className?: string
	style?: React.CSSProperties
	priority?: boolean
	fill?: boolean
	sizes?: string
	quality?: number
	onLoad?: () => void
}

export default function OptimizedImage({
	src,
	alt,
	width,
	height,
	className,
	style,
	priority: _priority = false,
	fill = false,
	sizes,
	quality: _quality = 90,
	onLoad,
}: OptimizedImageProps) {
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(false)

	// Определяем формат изображения
	const isWebP = src.endsWith('.webp')
	const isPNG = src.endsWith('.webp')
	const isJPG = src.endsWith('.jpg') || src.endsWith('.jpeg')

	// Для WebP используем оригинал, для остальных пытаемся найти WebP версию
	const optimizedSrc = isWebP ? src : src.replace(/\.(png|jpg|jpeg)$/i, '.webp')

	return (
		<>
			{fill ? (
				<img
					src={error ? src : optimizedSrc}
					alt={alt}
					className={className}
					style={{
						...style,
						opacity: isLoading ? 0 : 1,
						transition: 'opacity 0.3s ease-in-out',
					}}
					sizes={sizes}
					onLoad={() => {
						setIsLoading(false)
						onLoad?.()
					}}
					onError={() => {
						if (!error) {
							setError(true)
							setIsLoading(false)
						}
					}}
				/>
			) : (
				<img
					src={error ? src : optimizedSrc}
					alt={alt}
					width={width}
					height={height}
					className={className}
					style={{
						...style,
						opacity: isLoading ? 0 : 1,
						transition: 'opacity 0.3s ease-in-out',
					}}
					onLoad={() => {
						setIsLoading(false)
						onLoad?.()
					}}
					onError={() => {
						if (!error) {
							setError(true)
							setIsLoading(false)
						}
					}}
				/>
			)}

			{/* Placeholder пока загружается */}
			{isLoading && (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						backgroundColor: 'rgba(255, 255, 255, 0.05)',
						animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
					}}
				/>
			)}
		</>
	)
}
