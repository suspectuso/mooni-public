'use client'

import WorkBottomNav from '@/components/WorkBottomNav'

export default function WorkLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#121212',
				paddingBottom: '100px',
			}}
		>
			{children}
			<WorkBottomNav />
		</div>
	)
}
