'use client'

import { useMemo } from 'react'
import { useWebGLAura, hexToRGB } from '@/hooks/useWebGLAura'

interface ProfileCardAuraProps {
	aura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null
	photoReady?: boolean
}

function getColor(aura: ProfileCardAuraProps['aura']): string | null {
	if (aura === 'ORANGE') return '#F7710B'
	if (aura === 'RED') return '#F23318'
	if (aura === 'TURQUOISE') return '#65FFF7'
	return null
}

export default function ProfileCardAura({ aura, photoReady }: ProfileCardAuraProps) {
	const hex = getColor(aura)

	if (!hex) return null
	const rgb = useMemo(() => hexToRGB(hex), [hex])

	const { canvasRef, supported } = useWebGLAura({
		color: rgb,
		opacity: 1,
	})

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				pointerEvents: 'none',
				zIndex: 0,
				opacity: photoReady ? 1 : 0,
				transition: 'opacity 0.4s ease-in',
			}}
		>
			{supported ? (
				<canvas
					ref={canvasRef}
					style={{
						width: '100%',
						height: '100%',
						display: 'block',
						maskImage:
							'radial-gradient(ellipse 95% 95% at center, black 50%, transparent 100%)',
						WebkitMaskImage:
							'radial-gradient(ellipse 95% 95% at center, black 50%, transparent 100%)',
					}}
				/>
			) : (
				/* Fallback: static colored gradient for no-WebGL devices */
				<div
					style={{
						width: '100%',
						height: '100%',
						background: `radial-gradient(ellipse 70% 60% at center, ${hex}66 0%, ${hex}22 40%, transparent 70%)`,
						filter: 'blur(20px)',
					}}
				/>
			)}
		</div>
	)
}
