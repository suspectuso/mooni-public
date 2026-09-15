'use client'


interface MatchModalProps {
	isOpen: boolean
	onClose: () => void
	myAvatar: string
	matchAvatar: string
	matchName: string
	matchUsername?: string
}

export default function MatchModal({
	isOpen,
	onClose: _onClose,
	myAvatar,
	matchAvatar,
	matchName,
	matchUsername,
}: MatchModalProps) {
	if (!isOpen) return null

	const handleWriteMessage = () => {
		const tg = (window as any).Telegram?.WebApp
		if (tg && matchUsername) {
			tg.HapticFeedback.impactOccurred('medium')
			tg.openTelegramLink(`https://t.me/${matchUsername}`)
		}
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: '100vw',
				height: '100vh',
				zIndex: 9999,
				display: 'flex',
				flexDirection: 'column',
				background:
					'#121212 url(/match_netw.webp) top center / 100% auto no-repeat',
				maxWidth: 'none',
			}}
		>
			{/* Контент */}
			<div
				style={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 24px',
				}}
			>
				{/* Заголовок */}
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '48px',
						lineHeight: '1.1',
						textTransform: 'uppercase',
						color: '#F23318',
						textAlign: 'center',
						marginBottom: '48px',
					}}
				>
					У ВАС МЭТЧ
					<br />С {matchName.toUpperCase()}
				</h1>

				{/* Аватарки с огоньком */}
				<div
					style={{
						position: 'relative',
						width: '275px',
						height: '140px',
						marginBottom: '48px',
					}}
				>
					{/* Левая аватарка (моя) */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: '50%',
							transform: 'translateY(-50%)',
							width: '140px',
							height: '140px',
							borderRadius: '50%',
							overflow: 'hidden',
							zIndex: 1,
						}}
					>
						<img
							src={myAvatar}
							alt='My avatar'
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
					</div>

					{/* Правая аватарка (мэтч) */}
					<div
						style={{
							position: 'absolute',
							right: 0,
							top: '50%',
							transform: 'translateY(-50%)',
							width: '140px',
							height: '140px',
							borderRadius: '50%',
							overflow: 'hidden',
							zIndex: 2,
						}}
					>
						<img
							src={matchAvatar}
							alt='Match avatar'
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
							}}
						/>
					</div>

					{/* Огонек по центру */}
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							transform: 'translate(-50%, -50%)',
							width: '60px',
							height: '60px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							zIndex: 3,
						}}
					>
						<img
							src='/match_netw.webp'
							alt='Match'
							style={{
								width: '60px',
								height: '60px',
								objectFit: 'contain',
							}}
						/>
					</div>
				</div>

				{/* Текст */}
				<p
					style={{
						fontFamily: 'LT Superior, sans-serif',
						color: '#FCF9F7',
						textAlign: 'center',
						fontSize: '16px',
						lineHeight: '1.5',
						maxWidth: '350px',
					}}
				>
					Вы можете написать *{matchName}*. Попробуйте начать с комплимента или
					small-talk
				</p>
			</div>

			{/* Кнопка внизу */}
			<div
				style={{
					padding: '20px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<button
					onClick={handleWriteMessage}
					style={{
						width: '100%',
						maxWidth: '450px',
						height: '72px',
						borderRadius: '28px',
						backgroundColor: '#F23318',
						border: 'none',
						fontFamily: 'LT Superior, sans-serif',
						fontSize: '17px',
						fontWeight: 600,
						color: '#1D1D1B',
						cursor: 'pointer',
						boxShadow: '0 4px 20px rgba(242, 51, 24, 0.4)',
					}}
				>
					Написать @{matchUsername || matchName.toLowerCase()}
				</button>
			</div>
		</div>
	)
}
