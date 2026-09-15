import BottomNav from '@/components/BottomNav'

export default function TrackerLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<>
			{children}
			<BottomNav />
		</>
	)
}
