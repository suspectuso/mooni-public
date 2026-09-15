'use client'

import EducationBottomNav from '@/components/EducationBottomNav'
import EducationHeader from '@/components/EducationHeader'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function FilesPage() {
	const router = useRouter()

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg) return
		const handleBack = () => {
			if (document.body.dataset.eduHeaderModal) {
				window.dispatchEvent(new Event('closeEduHeaderModal'))
				return
			}
			router.push('/')
		}
		tg.BackButton.show()
		tg.BackButton.onClick(handleBack)
		return () => {
			tg.BackButton.offClick(handleBack)
			tg.BackButton.hide()
		}
	}, [router])

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#121212', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
			<EducationHeader />

			<div style={{ padding: '0 20px 20px' }}>
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '68px',
						color: '#FCF9F7',
						margin: 0,
						lineHeight: 1,
					}}
				>
					ФАЙЛЫ
				</h1>
			</div>

			<div style={{ padding: '0 20px 20px' }}>
				<div
					style={{
						textAlign: 'center',
						padding: '40px 20px',
					}}
				>
					<p
						style={{
							fontFamily: 'LT Superior, sans-serif',
							fontSize: '16px',
							color: 'rgba(252, 249, 247, 0.5)',
						}}
					>
						Скоро здесь появятся материалы
					</p>
				</div>
			</div>

			<EducationBottomNav />
		</div>
	)
}
