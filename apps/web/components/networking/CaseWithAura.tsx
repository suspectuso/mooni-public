'use client'

interface CaseWithAuraProps {
	photoPath: string
	auraColor: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null
	size?: number
	onClick?: () => void
}

export default function CaseWithAura({
	photoPath,
	auraColor,
	size = 120,
	onClick,
}: CaseWithAuraProps) {
	const getAuraImage = () => {
		switch (auraColor) {
			case 'TURQUOISE':
				return '/blue_aura.webp'
			case 'ORANGE':
				return '/orange_aura.webp'
			case 'RED':
				return '/red_aura.webp'
			default:
				return null
		}
	}

	const auraImage = getAuraImage()
	const photoSize = size === 120 ? 52 : Math.round(size * 0.43) // 52/120 = 0.43
	const auraSize = size === 120 ? 118 : size - 2

	return (
		<div
			onClick={onClick}
			style={{
				position: 'relative',
				width: `${size}px`,
				height: `${size}px`,
				cursor: onClick ? 'pointer' : 'default',
			}}
		>
			{/* Аура за фото - вращается */}
			{auraImage && (
				<img
					src={auraImage}
					alt='Aura'
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: `${auraSize}px`,
						height: `${auraSize}px`,
						objectFit: 'contain',
						zIndex: 0,
						filter: 'drop-shadow(0 0 20px rgba(101, 255, 247, 0.8))',
						animation: 'rotateAura 15s linear infinite',
					}}
				/>
			)}

			{/* Фото кейса */}
			{photoPath && (
				<img
					src={photoPath}
					alt='Case'
					style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						width: `${photoSize}px`,
						height: `${photoSize}px`,
						borderRadius: '50%',
						objectFit: 'cover',
						zIndex: 1,
						backgroundColor: '#272727',
					}}
				/>
			)}

			<style jsx>{`
				@keyframes rotateAura {
					from {
						transform: translate(-50%, -50%) rotate(0deg);
					}
					to {
						transform: translate(-50%, -50%) rotate(360deg);
					}
				}
			`}</style>
		</div>
	)
}
