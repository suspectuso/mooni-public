'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function RadarHeader() {
	const pathname = usePathname()
	const router = useRouter()

	// Main navigation pages (show menu button)
	const mainPages = [
		'/radar',
		'/radar/profile',
		'/radar/favorites',
		'/radar/create',
	]
	const isMainPage = mainPages.some(page => pathname === page)

	// Pages where favorites button should be shown
	const showFavoritesButton = [
		'/radar',
		'/radar/create',
		'/radar/profile',
	].includes(pathname)

	const handleBackClick = () => {
		// Go back in history
		router.back()
	}

	return (
		<div
			style={{
				padding: '20px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
			}}
		>
			<div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
				{/* +M Icon */}
				<img
					src='/+m_tracker.webp'
					alt='+M'
					width={50}
					height={50}
					style={{ width: '50px', height: '50px', marginBottom: '20px' }}
				/>

				{/* Logo (white) */}
				<img
					src='/logo.svg'
					alt='МЭТЧ'
					width={120}
					height={48}
					style={{ filter: 'brightness(0) invert(1)' }}
				/>

				{/* Favorites Button - прижата к логотипу */}
				{showFavoritesButton && (
					<button
						onClick={() => router.push('/radar/favorites')}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: 0,
							marginLeft: '12px',
						}}
					>
						<img
							src='/radar_favorites.webp'
							alt='Избранное'
							width={50}
							height={50}
							style={{ cursor: 'pointer', width: '50px', height: 'auto' }}
						/>
					</button>
				)}
			</div>

			<div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
				{/* Menu or Back Button */}
				{isMainPage ? (
					<a href='/'>
						<img
							src='/menu.webp'
							alt='Меню'
							width={80}
							height={80}
							style={{ cursor: 'pointer', width: '80px', height: 'auto' }}
						/>
					</a>
				) : (
					<button
						onClick={handleBackClick}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: 0,
						}}
					>
						<img
							src='/back.webp'
							alt='Назад'
							width={80}
							height={80}
							style={{ cursor: 'pointer', width: '80px', height: 'auto' }}
						/>
					</button>
				)}
			</div>
		</div>
	)
}
