'use client'

interface CaseItem {
	id: string
	photoPath: string
	link: string | null
}

interface ProfileCardCasesProps {
	cases: CaseItem[]
}

export default function ProfileCardCases({ cases }: ProfileCardCasesProps) {
	if (!cases || cases.length === 0) return null

	const positions = [
		{ top: '12%', left: '2%' },
		{ top: '16%', right: '2%' },
		{ top: '42%', left: '0%' },
	]

	const sizes = [
		{ container: 104, aura: 150, photo: 55 },
		{ container: 108, aura: 155, photo: 58 },
		{ container: 112, aura: 160, photo: 60 },
	]

	return (
		<>
			{cases.slice(0, 3).map((caseItem, index) => {
				const position = positions[index]
				const size = sizes[index]

				return (
					<div
						key={caseItem.id}
						onClick={e => {
							e.stopPropagation()
							if (caseItem.link) {
								const tg = (window as any).Telegram?.WebApp
								if (tg) {
									tg.HapticFeedback.impactOccurred('light')
									tg.openLink(caseItem.link)
								}
							}
						}}
						style={{
							position: 'absolute',
							...position,
							zIndex: 25,
							width: `${size.container}px`,
							height: `${size.container}px`,
							pointerEvents: caseItem.link ? 'auto' : 'none',
							cursor: caseItem.link ? 'pointer' : 'default',
							transition: 'transform 0.2s ease',
						}}
						onMouseDown={e => {
							if (caseItem.link) {
								e.currentTarget.style.transform = 'scale(0.95)'
							}
						}}
						onMouseUp={e => {
							if (caseItem.link) {
								e.currentTarget.style.transform = 'scale(1)'
							}
						}}
						onMouseLeave={e => {
							if (caseItem.link) {
								e.currentTarget.style.transform = 'scale(1)'
							}
						}}
					>
						<img
							src='/blue_aura.webp'
							alt='Aura'
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								width: `${size.aura}px`,
								height: `${size.aura}px`,
								objectFit: 'contain',
								zIndex: 0,
								filter: 'drop-shadow(0 0 20px rgba(101, 255, 247, 0.7))',
								animation: 'rotateAura 15s linear infinite',
							}}
						/>
						<img
							src={caseItem.photoPath}
							alt='Case'
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								width: `${size.photo}px`,
								height: `${size.photo}px`,
								borderRadius: '50%',
								objectFit: 'cover',
								zIndex: 1,
							}}
						/>
					</div>
				)
			})}
		</>
	)
}
