'use client'

interface ProfileCardButtonsProps {
	isPlatformDesktop: boolean
	shouldShowILU: boolean
	shouldShowMegaLike: boolean
	onSkip: () => void
	onLike: () => void
	onExpressLove: () => void
	onMegaLike: () => void
}

export default function ProfileCardButtons({
	isPlatformDesktop,
	shouldShowILU,
	shouldShowMegaLike,
	onSkip,
	onLike,
	onExpressLove,
	onMegaLike,
}: ProfileCardButtonsProps) {
	const handleButtonClick = (
		e: React.MouseEvent | React.TouchEvent,
		callback: () => void,
	) => {
		e.stopPropagation()
		callback()
	}

	const stopPropagation = (e: React.TouchEvent | React.MouseEvent) => {
		e.stopPropagation()
	}

	const showAnyButton = shouldShowILU || shouldShowMegaLike

	if (isPlatformDesktop) {
		return (
			<>
				<div
					className='absolute top-5 left-5 z-30'
					style={{
						display: 'flex',
						gap: '10px',
						alignItems: 'center',
					}}
				>
					<button
						onClick={e => handleButtonClick(e, onSkip)}
						style={{
							width: '48px',
							height: '48px',
							border: 'none',
							background: 'none',
							padding: 0,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							cursor: 'pointer',
						}}
					>
						<img
							src='/skip_netw.webp'
							alt='Пропустить'
							style={{
								width: '48px',
								height: '48px',
							}}
						/>
					</button>

					{showAnyButton && (
						<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
							{shouldShowILU && (
								<button
									onClick={e => handleButtonClick(e, onExpressLove)}
									onTouchStart={stopPropagation}
									onTouchMove={stopPropagation}
									onTouchEnd={stopPropagation}
									onMouseDown={stopPropagation}
									style={{
										width: '97px',
										height: '97px',
										border: 'none',
										background: 'none',
										padding: 0,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
									}}
								>
									<img
										src='/ilu_btn.png'
										alt='Выразить симпатию'
										style={{
											width: '97px',
											height: '97px',
										}}
									/>
								</button>
							)}
							{shouldShowMegaLike && (
								<button
									onClick={e => handleButtonClick(e, onMegaLike)}
									onTouchStart={stopPropagation}
									onTouchMove={stopPropagation}
									onTouchEnd={stopPropagation}
									onMouseDown={stopPropagation}
									style={{
										width: '50px',
										height: '50px',
										border: 'none',
										background: 'none',
										padding: 0,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										cursor: 'pointer',
										marginTop: shouldShowILU ? '-18px' : '0',
									}}
								>
									<img
										src='/super.png'
										alt='Мега-лайк'
										style={{
											width: '50px',
											height: '50px',
										}}
									/>
								</button>
							)}
						</div>
					)}
				</div>

				<button
					className='absolute top-5 right-5 z-30'
					onClick={e => handleButtonClick(e, onLike)}
					style={{
						width: '48px',
						height: '48px',
						border: 'none',
						background: 'none',
						padding: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
					}}
				>
					<img
						src='/add_netw.webp'
						alt='Добавить'
						style={{
							width: '48px',
							height: '48px',
						}}
					/>
				</button>
			</>
		)
	}

	if (!showAnyButton) return null

	return (
		<div
			className='absolute z-30'
			style={{
				top: '12px',
				left: '12px',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '0px',
			}}
		>
			{shouldShowILU && (
				<button
					onClick={e => handleButtonClick(e, onExpressLove)}
					onTouchStart={stopPropagation}
					onTouchMove={stopPropagation}
					onTouchEnd={stopPropagation}
					onMouseDown={stopPropagation}
					style={{
						width: '73px',
						height: '73px',
						border: 'none',
						background: 'none',
						padding: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
					}}
				>
					<img
						src='/ilu_btn.png'
						alt='Выразить симпатию'
						style={{
							width: '73px',
							height: '73px',
						}}
					/>
				</button>
			)}
			{shouldShowMegaLike && (
				<button
					onClick={e => handleButtonClick(e, onMegaLike)}
					onTouchStart={stopPropagation}
					onTouchMove={stopPropagation}
					onTouchEnd={stopPropagation}
					onMouseDown={stopPropagation}
					style={{
						width: '66px',
						height: '66px',
						marginTop: shouldShowILU ? '-18px' : '0',
						border: 'none',
						background: 'none',
						padding: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						cursor: 'pointer',
					}}
				>
					<img
						src='/super.png'
						alt='Мега-лайк'
						style={{
							width: '66px',
							height: '66px',
						}}
					/>
				</button>
			)}
		</div>
	)
}
