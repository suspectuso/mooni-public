'use client'

import LookingForBadges from './LookingForBadges'

interface CardHeaderProps {
	lookingFor?: string[]
	searchText?: string | null
}

export default function CardHeader({ lookingFor, searchText }: CardHeaderProps) {
	return (
		<div
			style={{
				position: 'absolute',
				top: '12px',
				left: '12px',
				right: '12px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'flex-end',
				zIndex: 15,
				gap: '6px',
			}}
		>
			<LookingForBadges lookingFor={lookingFor || []} iconOnly />

			{searchText && (
				<div
					style={{
						alignSelf: 'flex-end',
						background: 'rgba(101, 255, 247, 0.45)',
						borderRadius: '35px',
						paddingLeft: '12px',
						paddingRight: '12px',
						height: '30px',
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<span
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontSize: '14px',
							fontWeight: 500,
							color: '#FCF9F7',
							textAlign: 'center',
							display: 'block',
							wordBreak: 'break-word',
						}}
					>
						{searchText}
					</span>
				</div>
			)}
		</div>
	)
}
