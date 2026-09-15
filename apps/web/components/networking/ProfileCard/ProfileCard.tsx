'use client'

import { NetworkingProfile } from '@/types/networking'
import CardHeader from '../CardHeader'
import ProfileCardButtons from './ProfileCardButtons'
import ProfileCardCases from './ProfileCardCases'
import ProfileCardContainer from './ProfileCardContainer'
import ProfileCardInfo from './ProfileCardInfo'
import ProfileCardPhoto from './ProfileCardPhoto'
import ProfileCardTags from './ProfileCardTags'

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

interface ProfileCardProps {
	profile: NetworkingProfile
	isCurrentCard: boolean
	isSecondCard: boolean
	visibleProfilesLength: number
	index: number
	dragOffset: number
	rotation: number
	opacity: number
	isDragging: boolean
	isAnimatingOut: boolean
	swipeDirection: 'left' | 'right' | null
	isSwipeDisabled: boolean
	isPlatformDesktop: boolean
	myProfile: any
	onTouchStart?: (e: React.TouchEvent) => void
	onTouchMove?: (e: React.TouchEvent) => void
	onTouchEnd?: (e: React.TouchEvent) => void
	onMouseDown?: (e: React.MouseEvent) => void
	onCardClick: () => void
	onSkip: () => void
	onLike: () => void
	onExpressLove: () => void
	onMegaLike: () => void
	onPhotoLoad?: () => void
}

export default function ProfileCard({
	profile,
	isCurrentCard,
	isSecondCard,
	visibleProfilesLength,
	index,
	dragOffset,
	rotation,
	opacity,
	isDragging,
	isAnimatingOut,
	swipeDirection,
	isSwipeDisabled,
	isPlatformDesktop,
	myProfile,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onMouseDown,
	onCardClick,
	onSkip,
	onLike,
	onExpressLove,
	onMegaLike,
	onPhotoLoad,
}: ProfileCardProps) {
	const targetHasRelationships =
		profile.networkingLookingFor?.includes('relationships')
	const myGender = myProfile?.networkingGender?.toUpperCase()
	const targetGender = profile.networkingGender?.toUpperCase()
	const shouldShowILU =
		targetHasRelationships &&
		((myGender === 'MALE' && targetGender === 'FEMALE') ||
			(myGender === 'FEMALE' && targetGender === 'MALE'))

	const hasHelpText = !!profile.networkingHelpText
	const helpBubbleOffset = hasHelpText ? 55 : 0
	const infoPaddingBottom = 16 + helpBubbleOffset

	return (
		<>
			<ProfileCardContainer
				profile={profile}
				isCurrentCard={isCurrentCard}
				isSecondCard={isSecondCard}
				visibleProfilesLength={visibleProfilesLength}
				index={index}
				dragOffset={dragOffset}
				rotation={rotation}
				opacity={opacity}
				isDragging={isDragging}
				isAnimatingOut={isAnimatingOut}
				swipeDirection={swipeDirection}
				isSwipeDisabled={isSwipeDisabled}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
				onMouseDown={onMouseDown}
				onCardClick={onCardClick}
				overlay={
					<>
						<ProfileCardCases cases={profile.networkingCases} />

						{/* "Помогу" speech bubble — bottom of card, wider than card */}
						{isCurrentCard && profile.networkingHelpText && (
							<div
								style={{
									position: 'absolute',
									bottom: '20px',
									left: '0px',
									right: '0px',
									zIndex: 30,
									pointerEvents: 'none',
									opacity: 0.85,
								}}
							>
								<div
									style={{
										background: getBubbleColor(profile.networkingAura),
										borderRadius: '18px',
										padding: '12px 20px',
									}}
								>
									<p
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '14px',
											fontWeight: 500,
											color: getBubbleTextColor(profile.networkingAura),
											lineHeight: 1.3,
											textAlign: 'center',
											margin: 0,
											wordBreak: 'break-word',
											overflowWrap: 'break-word',
											display: '-webkit-box',
											WebkitLineClamp: 2,
											WebkitBoxOrient: 'vertical' as any,
											overflow: 'hidden',
										}}
									>
										{profile.networkingHelpText}
									</p>
								</div>
								{/* Decorative circles — left */}
								<div
									style={{
										width: '16px',
										height: '16px',
										borderRadius: '50%',
										background: getBubbleColor(profile.networkingAura),
										position: 'absolute',
										left: '38px',
										top: 'calc(100% + -9px)',
										clipPath: 'inset(calc(50% + 1px) 0 0 0)',
									}}
								/>
								<div
									style={{
										width: '9px',
										height: '9px',
										borderRadius: '50%',
										background: getBubbleColor(profile.networkingAura),
										position: 'absolute',
										left: '30px',
										top: 'calc(100% + 5px)',
									}}
								/>
							</div>
						)}
					</>
				}
			>
				<ProfileCardPhoto
					photoUrl={profile.networkingPhoto}
					name={profile.networkingName || profile.firstName || ''}
					onLoad={isCurrentCard ? onPhotoLoad : undefined}
				/>

				<CardHeader
					lookingFor={profile.networkingLookingFor}
				/>

				<ProfileCardButtons
					isPlatformDesktop={isPlatformDesktop}
					shouldShowILU={shouldShowILU}
					shouldShowMegaLike={true}
					onSkip={onSkip}
					onLike={onLike}
					onExpressLove={onExpressLove}
					onMegaLike={onMegaLike}
				/>

				<ProfileCardInfo
					name={profile.networkingName || profile.firstName || ''}
					about={profile.networkingAbout}
					location={profile.networkingLocation}
					onCardClick={onCardClick}
					paddingBottomOverride={infoPaddingBottom}
				>
					{isCurrentCard && (
						<ProfileCardTags
							hasWorkProfile={profile.hasWorkProfile}
							primarySkill={profile.primarySkill}
							skills={profile.networkingSkills}
							values={profile.networkingValues}
							isCurrentCard={isCurrentCard}
						/>
					)}
				</ProfileCardInfo>

			</ProfileCardContainer>
		</>
	)
}
