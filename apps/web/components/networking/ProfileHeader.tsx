'use client'

import { useEffect, useRef, useState } from 'react'
import LookingForBadges from './LookingForBadges'

interface ProfileHeaderProps {
	profile: {
		networkingPhoto: string
		networkingName: string
		firstName?: string
		networkingLookingFor: string[]
		networkingCases?: {
			id: string
			photoPath: string
			title: string | null
			link: string | null
			sortOrder: number
		}[]
		networkingAura?: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null
		networkingHelpText?: string | null
		networkingSearchText?: string | null
		networkingLocation?: string
		networkingGender?: string | null
		networkingBadge?: string | null
		username?: string | null
	}
	uploadingAvatar: boolean
	onAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
	onEditClick: () => void
	onSaveBubbleText?: (field: 'networkingHelpText' | 'networkingSearchText', value: string) => void
	isOwnProfile?: boolean
	showAddFriendButton?: boolean
	showRemoveMatchButton?: boolean
	onAddFriend?: () => void
	onRemoveMatch?: () => void
	hasActiveSubscription?: boolean
	isMatch?: boolean
}

interface FloatingCase {
	id: string
	photoPath: string
	title: string | null
	link: string | null
	position: { top: string; left: string }
}

function getAuraColors(
	aura: 'NONE' | 'TURQUOISE' | 'ORANGE' | 'RED' | null | undefined,
): [string, string, string, string] {
	if (aura === 'ORANGE') return ['#F7710B', '#FF9A44', '#F23318', '#FF6B35']
	if (aura === 'RED') return ['#F23318', '#E865FF', '#FF4444', '#D916A8']
	return ['#65FFF7', '#3DE8D4', '#5111E3', '#00C9B7']
}

function getBubbleColor(aura: string | null | undefined): string {
	if (aura === 'ORANGE') return '#F7710B'
	if (aura === 'RED') return '#F23318'
	if (aura === 'TURQUOISE') return '#65FFF7'
	return 'rgba(252, 249, 247, 0.2)'
}

function getBubbleTextColor(aura: string | null | undefined): string {
	if (aura === 'NONE' || !aura) return '#FCF9F7'
	return '#262626'
}

const PROFILE_AURA_ID = 'profile-header-aura-styles'

const PROFILE_AURA_STYLES = `
@keyframes phAmorph1 {
	0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: translate(-50%,-50%) rotate(0deg) scale(1); }
	20% { border-radius: 40% 60% 55% 45% / 45% 55% 40% 60%; transform: translate(-50%,-50%) rotate(72deg) scale(1.04); }
	40% { border-radius: 55% 45% 70% 30% / 30% 65% 45% 55%; transform: translate(-50%,-50%) rotate(144deg) scale(0.97); }
	60% { border-radius: 30% 70% 40% 60% / 65% 35% 60% 40%; transform: translate(-50%,-50%) rotate(216deg) scale(1.06); }
	80% { border-radius: 50% 50% 35% 65% / 50% 45% 55% 50%; transform: translate(-50%,-50%) rotate(288deg) scale(0.98); }
}
@keyframes phAmorph2 {
	0%, 100% { border-radius: 40% 60% 65% 35% / 50% 60% 35% 65%; transform: translate(-50%,-50%) rotate(0deg) scale(1.02); }
	17% { border-radius: 65% 35% 45% 55% / 35% 50% 65% 50%; transform: translate(-50%,-50%) rotate(-60deg) scale(0.96); }
	34% { border-radius: 50% 50% 30% 70% / 65% 40% 55% 45%; transform: translate(-50%,-50%) rotate(-120deg) scale(1.05); }
	51% { border-radius: 35% 65% 55% 45% / 45% 65% 40% 60%; transform: translate(-50%,-50%) rotate(-180deg) scale(0.98); }
	68% { border-radius: 55% 45% 40% 60% / 55% 35% 65% 45%; transform: translate(-50%,-50%) rotate(-240deg) scale(1.03); }
	85% { border-radius: 45% 55% 60% 40% / 40% 55% 45% 55%; transform: translate(-50%,-50%) rotate(-300deg) scale(1.0); }
}
@keyframes phAmorph3 {
	0%, 100% { border-radius: 50% 50% 45% 55% / 55% 45% 50% 50%; transform: translate(-50%,-50%) rotate(0deg) scale(1.01); }
	25% { border-radius: 35% 65% 60% 40% / 40% 60% 35% 65%; transform: translate(-50%,-50%) rotate(90deg) scale(1.07); }
	50% { border-radius: 65% 35% 35% 65% / 60% 35% 65% 40%; transform: translate(-50%,-50%) rotate(180deg) scale(0.95); }
	75% { border-radius: 45% 55% 50% 50% / 35% 65% 50% 50%; transform: translate(-50%,-50%) rotate(270deg) scale(1.03); }
}
@keyframes phAmorph4 {
	0%, 100% { border-radius: 45% 55% 55% 45% / 50% 40% 60% 50%; transform: translate(-50%,-50%) rotate(0deg) scale(0.99); }
	20% { border-radius: 60% 40% 35% 65% / 55% 50% 45% 55%; transform: translate(-50%,-50%) rotate(-75deg) scale(1.05); }
	40% { border-radius: 35% 65% 50% 50% / 40% 60% 50% 50%; transform: translate(-50%,-50%) rotate(-150deg) scale(0.97); }
	60% { border-radius: 55% 45% 65% 35% / 65% 35% 55% 45%; transform: translate(-50%,-50%) rotate(-225deg) scale(1.04); }
	80% { border-radius: 40% 60% 45% 55% / 50% 55% 40% 60%; transform: translate(-50%,-50%) rotate(-300deg) scale(1.0); }
}
@keyframes phAmorph5 {
	0%, 100% { border-radius: 55% 45% 40% 60% / 45% 55% 55% 45%; transform: translate(-50%,-50%) rotate(0deg) scale(1.03); }
	33% { border-radius: 40% 60% 60% 40% / 60% 40% 40% 60%; transform: translate(-50%,-50%) rotate(120deg) scale(0.96); }
	66% { border-radius: 60% 40% 50% 50% / 40% 60% 50% 50%; transform: translate(-50%,-50%) rotate(240deg) scale(1.06); }
}
@keyframes phDrift1 {
	0%, 100% { transform: translate(0px, 0px); }
	25% { transform: translate(10px, -12px); }
	50% { transform: translate(-8px, 9px); }
	75% { transform: translate(12px, 5px); }
}
@keyframes phDrift2 {
	0%, 100% { transform: translate(0px, 0px); }
	25% { transform: translate(-11px, 6px); }
	50% { transform: translate(9px, -10px); }
	75% { transform: translate(-5px, -9px); }
}
@keyframes phPulse {
	0%, 100% { opacity: 0.55; }
	50% { opacity: 0.8; }
}
@keyframes rotateAura {
	from { transform: translate(-50%, -50%) rotate(0deg); }
	to { transform: translate(-50%, -50%) rotate(360deg); }
}
`

export default function ProfileHeader({
	profile,
	uploadingAvatar: _uploadingAvatar,
	onAvatarUpload: _onAvatarUpload,
	onEditClick,
	onSaveBubbleText,
	isOwnProfile = false,
	showAddFriendButton = false,
	showRemoveMatchButton = false,
	onAddFriend,
	onRemoveMatch,
	hasActiveSubscription = false,
	isMatch = false,
}: ProfileHeaderProps) {
	const [floatingCases, setFloatingCases] = useState<FloatingCase[]>([])
	const injectedRef = useRef(false)
	const [editingHelp, setEditingHelp] = useState(false)
	const [editingSearch, setEditingSearch] = useState(false)
	const [helpText, setHelpText] = useState(profile.networkingHelpText || '')
	const [searchText, setSearchText] = useState(profile.networkingSearchText || '')

	useEffect(() => {
		// Генерируем рандомные позиции для кейсов для ВСЕХ профилей
		const positions = [
			{ top: '-25%', left: '-25%' },
			{ top: '10%', left: '95%' },
			{ top: '50%', left: '-63%' },
		]
		if (profile.networkingCases && Array.isArray(profile.networkingCases)) {
			const cases = profile.networkingCases.slice(0, 3).map((c, index) => ({
				...c,
				position: positions[index % positions.length],
			}))

			setFloatingCases(cases)
		}
	}, [profile.networkingCases])

	// Inject aura CSS keyframes
	useEffect(() => {
		if (injectedRef.current) return
		if (typeof document === 'undefined') return
		const old = document.getElementById(PROFILE_AURA_ID)
		if (old) old.remove()
		const style = document.createElement('style')
		style.id = PROFILE_AURA_ID
		style.textContent = PROFILE_AURA_STYLES
		document.head.appendChild(style)
		injectedRef.current = true
	}, [])

	const showAura =
		!!profile.networkingAura && profile.networkingAura !== 'NONE'

	const [c1, c2, c3, c4] = getAuraColors(profile.networkingAura)

	if (!profile) {
		return null
	}

	return (
		<div style={{ overflow: 'visible', position: 'relative' }}>
			{/* Верхняя строка: город+пол слева, LookingFor иконки справа */}
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					padding: '0 20px',
					marginBottom: '12px',
				}}
			>
				{/* Город (пилл) + иконка пола (пилл) */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
					{profile.networkingLocation && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '5px',
								backgroundColor: 'rgba(252, 249, 247, 0.15)',
								borderRadius: '17.5px',
								padding: '7px 12px 10px',
								height: '30px',
							}}
						>
							<svg width='11' height='14' viewBox='0 0 11 14' fill='none' xmlns='http://www.w3.org/2000/svg'>
								<path fillRule='evenodd' clipRule='evenodd' d='M6.56333 12.7967C8.5228 10.6134 11 7.8526 11 5.3697C11 2.4045 8.53747 0 5.5 0C2.46253 0 0 2.4045 0 5.3697C0 7.8526 2.4772 10.6134 4.43667 12.7967C4.53422 12.9056 4.63053 13.0129 4.7252 13.1187C5.1357 13.5774 5.86431 13.5774 6.2748 13.1187C6.36947 13.0129 6.46578 12.9056 6.56333 12.7967ZM5.5 7C5.76483 7 6.02707 6.95021 6.27175 6.85347C6.51642 6.75673 6.73873 6.61493 6.926 6.43618C7.11326 6.25743 7.26181 6.04522 7.36316 5.81167C7.4645 5.57811 7.51667 5.32779 7.51667 5.075C7.51667 4.82221 7.4645 4.57189 7.36316 4.33833C7.26181 4.10478 7.11326 3.89257 6.926 3.71382C6.73873 3.53507 6.51642 3.39327 6.27175 3.29653C6.02707 3.19979 5.76483 3.15 5.5 3.15C4.96515 3.15 4.4522 3.35281 4.074 3.71382C3.6958 4.07483 3.48333 4.56446 3.48333 5.075C3.48333 5.58554 3.6958 6.07517 4.074 6.43618C4.4522 6.79719 4.96515 7 5.5 7Z' fill='rgba(252,249,247,0.65)' />
							</svg>
							<span
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '13px',
									fontWeight: 900,
									color: 'rgba(252, 249, 247, 0.65)',
									whiteSpace: 'nowrap',
								}}
							>
								{profile.networkingLocation}
							</span>
						</div>
					)}
					{profile.networkingGender && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								backgroundColor: 'rgba(252, 249, 247, 0.15)',
								borderRadius: '17.5px',
								width: '30px',
								height: '30px',
							}}
						>
							{profile.networkingGender === 'MALE' ? (
								<svg width='14' height='14' viewBox='0 0 16 16' fill='none'>
									<circle cx='6' cy='10' r='4.25' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' />
									<path d='M9.5 6.5L14 2M14 2h-4M14 2v4' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
								</svg>
							) : (
								<svg width='14' height='16' viewBox='0 0 14 16' fill='none'>
									<circle cx='7' cy='5.5' r='4.25' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' />
									<path d='M7 9.75v5M5 12.5h4' stroke='rgba(252,249,247,0.65)' strokeWidth='1.5' strokeLinecap='round' />
								</svg>
							)}
						</div>
					)}
				</div>

				</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					marginBottom: '16px',
					position: 'relative',
					overflow: 'visible',
				}}
			>
				{/* Аватарка с летающими кейсами */}
				<div
					style={{
						position: 'relative',
						width: '170px',
						height: '170px',
					}}
				>
					{/* Animated CSS blob aura */}
					{showAura && (
						<div
							style={{
								position: 'absolute',
								top: '50%',
								left: '50%',
								transform: 'translate(-50%, -50%)',
								width: '260%',
								height: '260%',
								pointerEvents: 'none',
								zIndex: 0,
							}}
						>
							{/* Outer glow — wide ambient halo */}
							<div
								style={{
									position: 'absolute',
									top: '50%',
									left: '50%',
									width: '110%',
									height: '105%',
									background: `radial-gradient(ellipse at center, ${c1}66 0%, ${c1}33 40%, ${c1}11 65%, transparent 85%)`,
									filter: 'blur(55px)',
									animation: 'phPulse 8s ease-in-out infinite',
									borderRadius: '50%',
									transform: 'translate(-50%, -50%)',
								}}
							/>

							{/* Drift wrapper 1 */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									animation: 'phDrift1 25s ease-in-out infinite',
								}}
							>
								{/* Blob 1 — primary, large */}
								<div
									style={{
										position: 'absolute',
										top: '48%',
										left: '50%',
										width: '95%',
										height: '88%',
										background: `radial-gradient(ellipse at 40% 40%, ${c1} 0%, ${c1}bb 20%, ${c1}44 50%, transparent 78%)`,
										opacity: 0.85,
										filter: 'blur(30px)',
										animation: 'phAmorph1 20s ease-in-out infinite',
										willChange: 'border-radius, transform',
									}}
								/>
								{/* Blob 2 — secondary, counter-rotating */}
								<div
									style={{
										position: 'absolute',
										top: '52%',
										left: '48%',
										width: '88%',
										height: '82%',
										background: `radial-gradient(ellipse at 60% 55%, ${c2}ee 0%, ${c2}77 25%, ${c2}22 55%, transparent 76%)`,
										opacity: 0.7,
										filter: 'blur(32px)',
										animation: 'phAmorph2 24s ease-in-out infinite',
										willChange: 'border-radius, transform',
									}}
								/>
							</div>

							{/* Drift wrapper 2 */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									animation: 'phDrift2 30s ease-in-out infinite',
								}}
							>
								{/* Blob 3 — accent, faster morph */}
								<div
									style={{
										position: 'absolute',
										top: '50%',
										left: '52%',
										width: '80%',
										height: '75%',
										background: `radial-gradient(ellipse at 50% 45%, ${c3}dd 0%, ${c3}66 30%, ${c3}18 55%, transparent 73%)`,
										opacity: 0.65,
										filter: 'blur(26px)',
										animation: 'phAmorph3 16s ease-in-out infinite',
										willChange: 'border-radius, transform',
									}}
								/>
								{/* Blob 4 — shimmer */}
								<div
									style={{
										position: 'absolute',
										top: '46%',
										left: '47%',
										width: '72%',
										height: '68%',
										background: `radial-gradient(ellipse at 45% 50%, ${c4}cc 0%, ${c4}55 25%, ${c4}11 55%, transparent 72%)`,
										opacity: 0.6,
										filter: 'blur(24px)',
										animation: 'phAmorph4 22s ease-in-out infinite',
										willChange: 'border-radius, transform',
									}}
								/>
							</div>

							{/* Blob 5 — bright core */}
							<div
								style={{
									position: 'absolute',
									top: '50%',
									left: '50%',
									width: '62%',
									height: '58%',
									background: `radial-gradient(ellipse at 50% 50%, ${c1} 0%, ${c1}88 20%, ${c2}33 50%, transparent 70%)`,
									opacity: 0.75,
									filter: 'blur(20px)',
									animation: 'phAmorph5 14s ease-in-out infinite',
									willChange: 'border-radius, transform',
								}}
							/>
						</div>
					)}

					{/* Кнопка редактирования - только для своего профиля */}
					{isOwnProfile && (
						<div
							onClick={onEditClick}
							style={{
								position: 'absolute',
								top: '0',
								right: '0',
								width: '40px',
								height: '40px',
								borderRadius: '50%',
								backgroundColor: '#FCF9F7',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
								zIndex: 10,
							}}
						>
							<svg
								width='17'
								height='17'
								viewBox='0 0 17 17'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M8.85811 4.30379L0.75 12.4119V16.0605H4.39865L12.5068 7.95244M8.85811 4.30379L12.5068 7.95244M8.85811 4.30379L12.1014 1.06055L15.75 4.7092L12.5068 7.95244'
									stroke='#1D1D1B'
									strokeWidth='1.5'
								/>
							</svg>
						</div>
					)}

					{/* Кнопка добавить в друзья - только если пользователь лайкнул меня */}
					{showAddFriendButton && onAddFriend && (
						<div
							onClick={() => {
								const tg = (window as any).Telegram?.WebApp
								if (tg) {
									tg.HapticFeedback.impactOccurred('medium')
								}
								onAddFriend()
							}}
							style={{
								position: 'absolute',
								bottom: '0',
								right: '0',
								width: '46px',
								height: '46px',
								cursor: 'pointer',
								zIndex: 10,
							}}
						>
							<img
								src='/add_match.webp'
								alt='Add to friends'
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'contain',
									opacity: 1,
									filter: 'hue-rotate(137deg)',
								}}
							/>
						</div>
					)}

					{/* Кнопка удалить из друзей - только если уже в мэтче */}
					{showRemoveMatchButton && onRemoveMatch && (
						<div
							onClick={() => {
								const tg = (window as any).Telegram?.WebApp
								if (tg) {
									tg.HapticFeedback.impactOccurred('medium')
								}
								onRemoveMatch()
							}}
							style={{
								position: 'absolute',
								bottom: '0',
								right: '0',
								width: '46px',
								height: '46px',
								cursor: 'pointer',
								zIndex: 10,
							}}
						>
							<img
								src='/remove_match.webp'
								alt='Remove from friends'
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'contain',
									opacity: 1,
									filter: 'hue-rotate(137deg)',
								}}
							/>
						</div>
					)}

					{/* Аватарка */}
					<div
						style={{
							width: '170px',
							height: '170px',
							borderRadius: '50%',
							overflow: 'hidden',
							position: 'relative',
							zIndex: 2,
							backgroundColor: '#272727',
							touchAction: 'none',
						}}
					>
						{profile.networkingPhoto && (
							<img
								src={profile.networkingPhoto}
								alt={profile.networkingName}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
									touchAction: 'none',
								}}
								draggable={false}
							/>
						)}
					</div>

					{/* Летающие кейсы - ПОВЕРХ аватарки */}
					{floatingCases.map(floatingCase => (
						<div
							key={floatingCase.id}
							onClick={() => {
								if (floatingCase.link) {
									const tg = (window as any).Telegram?.WebApp
									if (tg) {
										tg.HapticFeedback.impactOccurred('light')
										tg.openLink(floatingCase.link)
									} else {
										window.open(floatingCase.link, '_blank')
									}
								}
							}}
							style={{
								position: 'absolute',
								...floatingCase.position,
								zIndex: 5,
								width: '120px',
								height: '120px',
								cursor: floatingCase.link ? 'pointer' : 'default',
								touchAction: 'manipulation',
							}}
						>
							{/* Аура за кейсом - всегда голубая, светится */}
							<img
								src='/blue_aura.webp'
								alt='Aura'
								style={{
									position: 'absolute',
									top: '50%',
									left: '50%',
									transform: 'translate(-50%, -50%)',
									width: '118px',
									height: '118px',
									objectFit: 'contain',
									zIndex: 0,
									filter: 'drop-shadow(0 0 20px rgba(101, 255, 247, 0.8))',
									animation: 'rotateAura 15s linear infinite',
									touchAction: 'none',
									pointerEvents: 'none',
								}}
								draggable={false}
							/>

							{/* Фото кейса 52x52 */}
							{floatingCase.photoPath && (
								<img
									src={floatingCase.photoPath}
									alt={floatingCase.title || 'Case'}
									style={{
										position: 'absolute',
										top: '50%',
										left: '50%',
										transform: 'translate(-50%, -50%)',
										width: '52px',
										height: '52px',
										borderRadius: '50%',
										objectFit: 'cover',
										zIndex: 1,
										backgroundColor: '#272727',
										touchAction: 'none',
										pointerEvents: 'none',
									}}
									draggable={false}
								/>
							)}
						</div>
					))}
				</div>
			</div>
			{/* Имя + бейдж подписки */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: '8px',
					marginBottom: '8px',
				}}
			>
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '28px',
						lineHeight: '1.1',
						letterSpacing: '0.02em',
						color: '#FCF9F7',
						fontWeight: 600,
						margin: 0,
					}}
				>
					{profile.networkingName || profile.firstName}
				</h1>
				{hasActiveSubscription && (() => {
					const badge = profile.networkingBadge || 'PLUS_M'
					if (badge === 'NONE') return null
					const badgeImages: Record<string, string> = {
						'PLUS_M': '/orange.png',
						'ORANGE_CHECK': '/orange_yes.png',
						'TURQUOISE_CHECK': '/golub.png',
						'RED_CHECK': '/red_yes.png',
					}
					const badgeImg = badgeImages[badge]
					if (badgeImg) {
						return (
							<div style={{ width: '28px', height: '28px', flexShrink: 0 }}>
								<img src={badgeImg} width={28} height={28} alt='Badge' style={{ borderRadius: '50%', objectFit: 'cover' }} />
							</div>
						)
					}
					
					return (
						<div style={{ width: '28px', height: '28px', flexShrink: 0 }}>
							<img src='/+m_netw.webp' width={28} height={28} alt='+M' style={{ borderRadius: '50%', objectFit: 'cover' }} />
						</div>
					)
				})()}
			</div>

			{/* @username под именем — только при мэтче */}
			{isMatch && profile.username && (
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						marginBottom: '12px',
					}}
				>
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'rgba(252, 249, 247, 0.15)',
							borderRadius: '17.5px',
							padding: '7px 12px 10px',
						}}
					>
						<span
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '13px',
								fontWeight: 900,
								color: 'rgba(252, 249, 247, 0.65)',
							}}
						>
							@{profile.username}
						</span>
					</div>
				</div>
			)}

			{/* LookingFor бейджи с текстом — всегда все 3, невыбранные серые */}
			<div style={{ marginBottom: '28px' }}>
				<LookingForBadges
					lookingFor={profile.networkingLookingFor || []}
					onEdit={onEditClick}
					isOwnProfile={isOwnProfile}
					showAllWithText={true}
				/>
			</div>

			{/* Speech bubbles — Помогу / Ищу */}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '15px',
					marginBottom: '12px',
					width: '100%',
					padding: '0 20px',
					boxSizing: 'border-box',
				}}
			>
				{/* Помогу bubble */}
				{(isOwnProfile || profile.networkingHelpText) && (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						{editingHelp || profile.networkingHelpText ? (
							<div
								onClick={() => {
									if (isOwnProfile && !editingHelp) setEditingHelp(true)
								}}
								style={{
									position: 'relative',
									cursor: isOwnProfile ? 'pointer' : 'default',
									minWidth: '75px',
									maxWidth: '100%',
									opacity: 0.85,
								}}
							>
								{/* Два кружка сверху, ПОЗАДИ пилла — большой справа, маленький слева */}
								<div
									style={{
										position: 'absolute',
										top: '-7px',
										right: '25px',
										width: '16px',
										height: '16px',
										borderRadius: '50%',
										backgroundColor: getBubbleColor(profile.networkingAura),
										zIndex: 0,
										clipPath: 'inset(0 0 calc(50% + 1px) 0)',
									}}
								/>
								<div
									style={{
										position: 'absolute',
										top: '-18px',
										right: '42px',
										width: '9px',
										height: '9px',
										borderRadius: '50%',
										backgroundColor: getBubbleColor(profile.networkingAura),
										zIndex: 0,
									}}
								/>
								{/* Основной пилл поверх кружков */}
								<div
									style={{
										position: 'relative',
										zIndex: 1,
										background: getBubbleColor(profile.networkingAura),
										borderRadius: '35px',
										padding: '14px 24px',
									}}
								>
									{editingHelp ? (
										<textarea
											autoFocus
											value={helpText}
											onChange={e => setHelpText(e.target.value)}
											onBlur={() => {
												setEditingHelp(false)
												if (onSaveBubbleText) onSaveBubbleText('networkingHelpText', helpText)
											}}
											placeholder='Помогу...'
											style={{
												width: '100%',
												minWidth: '200px',
												background: 'transparent',
												border: 'none',
												outline: 'none',
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '18px',
												fontWeight: 500,
												color: getBubbleTextColor(profile.networkingAura),
												textAlign: 'center',
												resize: 'none',
												lineHeight: '1.3',
											}}
											rows={1}
										/>
									) : (
										<span
											style={{
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '18px',
												fontWeight: 500,
												color: getBubbleTextColor(profile.networkingAura),
												textAlign: 'center',
												display: 'block',
												wordBreak: 'break-word',
											}}
										>
											{profile.networkingHelpText}
										</span>
									)}
								</div>
							</div>
						) : (
							<div
								onClick={() => {
									if (isOwnProfile) setEditingHelp(true)
								}}
								style={{
									position: 'relative',
									width: '75px',
									height: '56px',
									cursor: 'pointer',
								}}
							>
								<img
									src='/bubble_help_grey.svg'
									alt=''
									style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
								/>
								<div
									style={{
										position: 'absolute',
										top: '30%',
										left: '0',
										right: '0',
										bottom: '0',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '0 6px',
									}}
								>
									<span
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '11px',
											fontWeight: 500,
											color: '#FCF9F7',
											textAlign: 'center',
										}}
									>
										Помогу...
									</span>
								</div>
								{isOwnProfile && (
									<div
										style={{
											position: 'absolute',
											top: '2px',
											right: '-8px',
											width: '26px',
											height: '26px',
											borderRadius: '50%',
											backgroundColor: '#FCF9F7',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
											zIndex: 10,
											boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
										}}
									>
										<span style={{ fontSize: '15px', color: '#121212', fontWeight: 400, lineHeight: 1 }}>+</span>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* Ищу bubble */}
				{(isOwnProfile || profile.networkingSearchText) && (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						{editingSearch || profile.networkingSearchText ? (
							<div
								onClick={() => {
									if (isOwnProfile && !editingSearch) setEditingSearch(true)
								}}
								style={{
									position: 'relative',
									cursor: isOwnProfile ? 'pointer' : 'default',
									minWidth: '59px',
									maxWidth: '100%',
									opacity: 0.5,
								}}
							>
								{/* Два кружка снизу-слева, ПОЗАДИ пилла */}
								<div
									style={{
										position: 'absolute',
										bottom: '-7px',
										left: '25px',
										width: '16px',
										height: '16px',
										borderRadius: '50%',
										backgroundColor: getBubbleColor(profile.networkingAura),
										zIndex: 0,
										clipPath: 'inset(calc(50% + 1px) 0 0 0)',
									}}
								/>
								<div
									style={{
										position: 'absolute',
										bottom: '-18px',
										left: '18px',
										width: '9px',
										height: '9px',
										borderRadius: '50%',
										backgroundColor: getBubbleColor(profile.networkingAura),
										zIndex: 0,
									}}
								/>
								{/* Основной пилл поверх кружков */}
								<div
									style={{
										position: 'relative',
										zIndex: 1,
										background: getBubbleColor(profile.networkingAura),
										backdropFilter: 'blur(10px)',
										borderRadius: '35px',
										padding: '14px 24px',
									}}
								>
									{editingSearch ? (
										<textarea
											autoFocus
											value={searchText}
											onChange={e => setSearchText(e.target.value)}
											onBlur={() => {
												setEditingSearch(false)
												if (onSaveBubbleText) onSaveBubbleText('networkingSearchText', searchText)
											}}
											placeholder='Ищу...'
											style={{
												width: '100%',
												minWidth: '180px',
												background: 'transparent',
												border: 'none',
												outline: 'none',
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '18px',
												fontWeight: 500,
												color: getBubbleTextColor(profile.networkingAura),
												textAlign: 'center',
												resize: 'none',
												lineHeight: '1.3',
											}}
											rows={1}
										/>
									) : (
										<span
											style={{
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '18px',
												fontWeight: 500,
												color: getBubbleTextColor(profile.networkingAura),
												textAlign: 'center',
												display: 'block',
												wordBreak: 'break-word',
											}}
										>
											{profile.networkingSearchText}
										</span>
									)}
								</div>
							</div>
						) : (
							<div
								onClick={() => {
									if (isOwnProfile) setEditingSearch(true)
								}}
								style={{
									position: 'relative',
									width: '59px',
									height: '55px',
									cursor: 'pointer',
								}}
							>
								<img
									src='/bubble_search_grey.svg'
									alt=''
									style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
								/>
								<div
									style={{
										position: 'absolute',
										top: '0',
										left: '0',
										right: '0',
										height: '66%',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										padding: '0 4px',
									}}
								>
									<span
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '11px',
											fontWeight: 500,
											color: '#FCF9F7',
											textAlign: 'center',
										}}
									>
										Ищу...
									</span>
								</div>
								{isOwnProfile && (
									<div
										style={{
											position: 'absolute',
											top: '-8px',
											right: '-8px',
											width: '26px',
											height: '26px',
											borderRadius: '50%',
											backgroundColor: '#FCF9F7',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											cursor: 'pointer',
											zIndex: 10,
											boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
										}}
									>
										<span style={{ fontSize: '15px', color: '#121212', fontWeight: 400, lineHeight: 1 }}>+</span>
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
