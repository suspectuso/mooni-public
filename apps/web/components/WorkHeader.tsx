'use client'

import { usePathname, useRouter } from 'next/navigation'

export default function WorkHeader() {
	const pathname = usePathname()
	const router = useRouter()

	// Main navigation pages (show menu button)
	const mainPages = ['/work', '/work/favorites', '/work/profile']
	const isMainPage = mainPages.some(page => pathname === page)

	const handleBackClick = () => {
		// Go back to main work page
		router.push('/work')
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
					src='/+m_work.webp'
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
			</div>

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
	)
}
