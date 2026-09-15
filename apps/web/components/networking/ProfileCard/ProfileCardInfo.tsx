'use client'

interface ProfileCardInfoProps {
	name: string
	about?: string
	location?: string
	onCardClick: () => void
	paddingBottomOverride?: number
	children?: React.ReactNode
}

export default function ProfileCardInfo({
	name,
	about,
	location,
	onCardClick,
	paddingBottomOverride,
	children,
}: ProfileCardInfoProps) {
	return (
		<div
			className='absolute bottom-0 left-0 right-0 z-20'
			style={{
				paddingLeft: '24px',
				paddingRight: '24px',
				paddingBottom: paddingBottomOverride != null ? `${paddingBottomOverride}px` : '52px',
				pointerEvents: 'none',
			}}
		>
			<div style={{ marginBottom: '12px' }}>
				{location && (
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '5px',
							height: '30px',
							paddingLeft: '12px',
							paddingRight: '12px',
							borderRadius: '17.5px',
							backgroundColor: 'rgba(252, 249, 247, 0.15)',
							backdropFilter: 'blur(10px)',
							maxWidth: '100%',
							marginBottom: '8px',
						}}
					>
						<svg
							width='11'
							height='14'
							viewBox='0 0 11 14'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								fillRule='evenodd'
								clipRule='evenodd'
								d='M6.56333 12.7967C8.5228 10.6134 11 7.8526 11 5.3697C11 2.4045 8.53747 0 5.5 0C2.46253 0 0 2.4045 0 5.3697C0 7.8526 2.4772 10.6134 4.43667 12.7967C4.53422 12.9056 4.63053 13.0129 4.7252 13.1187C5.1357 13.5774 5.86431 13.5774 6.2748 13.1187C6.36947 13.0129 6.46578 12.9056 6.56333 12.7967ZM5.5 7C5.76483 7 6.02707 6.95021 6.27175 6.85347C6.51642 6.75673 6.73873 6.61493 6.926 6.43618C7.11326 6.25743 7.26181 6.04522 7.36316 5.81167C7.4645 5.57811 7.51667 5.32779 7.51667 5.075C7.51667 4.82221 7.4645 4.57189 7.36316 4.33833C7.26181 4.10478 7.11326 3.89257 6.926 3.71382C6.73873 3.53507 6.51642 3.39327 6.27175 3.29653C6.02707 3.19979 5.76483 3.15 5.5 3.15C4.96515 3.15 4.4522 3.35281 4.074 3.71382C3.6958 4.07483 3.48333 4.56446 3.48333 5.075C3.48333 5.58554 3.6958 6.07517 4.074 6.43618C4.4522 6.79719 4.96515 7 5.5 7Z'
								fill='#FCF9F7'
								fillOpacity='0.65'
							/>
						</svg>
						<span
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '14px',
								fontWeight: 900,
								color: 'rgba(252, 249, 247, 0.65)',
								overflow: 'hidden',
								textOverflow: 'ellipsis',
								whiteSpace: 'nowrap',
							}}
						>
							{location}
						</span>
					</div>
				)}
				<h2
					onClick={(e) => {
						e.stopPropagation()
						onCardClick()
					}}
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '42px',
						lineHeight: '0.9',
						letterSpacing: '0.02em',
						color: '#FCF9F7',
						marginBottom: '8px',
						display: '-webkit-box',
						WebkitLineClamp: 2,
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						textShadow: '0 2px 8px rgba(0,0,0,0.3)',
						pointerEvents: 'auto',
						cursor: 'pointer',
					}}
				>
					{name}
				</h2>
				{about && (
					<p
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontSize: '14px',
							lineHeight: '1.3',
							color: 'rgba(252, 249, 247, 0.65)',
							display: '-webkit-box',
							WebkitLineClamp: 2,
							WebkitBoxOrient: 'vertical',
							overflow: 'hidden',
							textShadow: '0 1px 4px rgba(0,0,0,0.3)',
						}}
					>
						{about}
					</p>
				)}
				{children}
			</div>
		</div>
	)
}
