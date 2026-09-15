'use client'

interface MegaLikeBannerProps {
	senderName: string
	senderPhoto: string | null
	message: string
	onClick: () => void
}

export default function MegaLikeBanner({ senderName, senderPhoto, message, onClick }: MegaLikeBannerProps) {
	return (
		<div
			onClick={onClick}
			style={{
				position: 'relative',
				width: '100%',
				borderRadius: '100px',
				overflow: 'hidden',
				cursor: 'pointer',
				marginBottom: '20px',
			}}
		>
			{/* Background pill image */}
			<img
				src="/mega_like_pill.png"
				alt=""
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					borderRadius: '100px',
				}}
			/>

			{/* Content */}
			<div
				style={{
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
					padding: '12px',
					gap: '12px',
					zIndex: 1,
				}}
			>
				{/* Avatar circle with mega-like icon */}
				<div style={{ position: 'relative', flexShrink: 0 }}>
					<div
						style={{
							width: '65px',
							height: '65px',
							borderRadius: '50%',
							overflow: 'hidden',
							backgroundColor: '#3a3a3a',
						}}
					>
						{senderPhoto && (
							<img
								src={senderPhoto}
								alt=""
								style={{ width: '100%', height: '100%', objectFit: 'cover' }}
							/>
						)}
					</div>
					{/* Mega-like icon badge */}
					<img
						src="/super.png"
						alt=""
						style={{
							position: 'absolute',
							top: '-17px',
							right: '-17px',
							width: '50px',
							height: '50px',
							objectFit: 'contain',
						}}
					/>
				</div>

				{/* Text block */}
				<div style={{ flex: 1, minWidth: 0 }}>
					<p
						style={{
							fontFamily: "'Zen Kaku Gothic New', sans-serif",
							fontWeight: 900,
							fontSize: '11px',
							color: '#FCF9F7',
							margin: '0 0 3px',
							lineHeight: 1.2,
						}}
					>
						Послание от {senderName}:
					</p>
					<p
						style={{
							fontFamily: "'Zen Kaku Gothic New', sans-serif",
							fontWeight: 500,
							fontSize: '10px',
							color: '#FCF9F7',
							margin: 0,
							lineHeight: 1.3,
							display: '-webkit-box',
							WebkitLineClamp: 3,
							WebkitBoxOrient: 'vertical' as const,
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						{message}
					</p>
				</div>

				{/* Arrow */}
				<div style={{ flexShrink: 0, paddingRight: '8px' }}>
					<svg width="12" height="20" viewBox="0 0 12 20" fill="none">
						<path d="M2 2L10 10L2 18" stroke="#FCF9F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
			</div>
		</div>
	)
}
