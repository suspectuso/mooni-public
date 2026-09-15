'use client'

interface LookingForBadgesProps {
	lookingFor: string[]
	onEdit?: () => void
	isOwnProfile?: boolean
	iconOnly?: boolean
	showAllWithText?: boolean
}

export default function LookingForBadges({
	lookingFor,
	onEdit: _onEdit,
	isOwnProfile = false,
	iconOnly = false,
	showAllWithText = false,
}: LookingForBadgesProps) {
	const getBadgeConfig = (type: string) => {
		switch (type) {
			case 'relationships':
				return {
					label: 'Отношения',
					icon: (
						<svg
							width='16'
							height='14'
							viewBox='0 0 16 14'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M15.501 1.97563C14.8309 0.641827 12.9006 -0.449469 10.6553 0.185907C9.58235 0.486493 8.64624 1.13111 7.99989 2.01443C7.35354 1.13111 6.41743 0.486493 5.3445 0.185907C3.09417 -0.439769 1.16888 0.641827 0.498786 1.97563C-0.441352 3.84296 -0.0512946 5.9431 1.65896 8.21784C2.99915 9.99787 4.91444 11.8021 7.69484 13.8974C7.78271 13.9639 7.89095 14 8.00239 14C8.11382 14 8.22207 13.9639 8.30994 13.8974C11.0853 11.807 13.0056 10.0173 14.3458 8.21784C16.0511 5.9431 16.4411 3.84296 15.501 1.97563Z'
								fill='#F23318'
							/>
						</svg>
					),
					bgColor: 'rgba(242, 51, 24, 0.45)',
					textColor: '#F23318',
				}
			case 'work':
				return {
					label: 'Работа',
					icon: (
						<svg
							width='19'
							height='17'
							viewBox='0 0 19 17'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M10.45 12.2778H8.55C8.0275 12.2778 7.6 11.8528 7.6 11.3333H0.9595V15.1111C0.9595 16.15 1.8145 17 2.8595 17H16.15C17.195 17 18.05 16.15 18.05 15.1111V11.3333H11.4C11.4 11.8528 10.9725 12.2778 10.45 12.2778ZM17.1 3.77778H13.3C13.3 1.69056 11.5995 0 9.5 0C7.4005 0 5.7 1.69056 5.7 3.77778H1.9C0.855 3.77778 0 4.62778 0 5.66667V8.5C0 9.54833 0.8455 10.3889 1.9 10.3889H7.6V9.44444C7.6 8.925 8.0275 8.5 8.55 8.5H10.45C10.9725 8.5 11.4 8.925 11.4 9.44444V10.3889H17.1C18.145 10.3889 19 9.53889 19 8.5V5.66667C19 4.62778 18.145 3.77778 17.1 3.77778ZM7.6 3.77778C7.6 2.73889 8.455 1.88889 9.5 1.88889C10.545 1.88889 11.4 2.73889 11.4 3.77778H7.5905H7.6Z'
								fill='#F7710B'
							/>
						</svg>
					),
					bgColor: 'rgba(247, 113, 11, 0.45)',
					textColor: '#F7710B',
				}
			case 'employees':
				return {
					label: 'Сотрудники',
					icon: (
						<svg
							width='15'
							height='17'
							viewBox='0 0 15 17'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								fillRule='evenodd'
								clipRule='evenodd'
								d='M7.5 9.93033C10.0031 9.93033 15 11.5092 15 14.6442V16.0016C14.9998 16.5537 14.5522 17.0016 14 17.0016H1C0.447851 17.0016 0.000181532 16.5537 0 16.0016L0 14.6442C0 11.5092 4.99686 9.93035 7.5 9.93033ZM5.96973 0.304355C6.70048 0.00172426 7.50452 -0.0774349 8.28027 0.0768155C9.0562 0.231156 9.76969 0.612133 10.3291 1.17154C10.8883 1.73085 11.2685 2.44369 11.4229 3.21939C11.5772 3.99532 11.4981 4.80001 11.1953 5.53092C10.8926 6.26163 10.3803 6.88639 9.72266 7.32584C9.06486 7.76536 8.29112 7.99967 7.5 7.99967C6.43933 7.99961 5.42195 7.57871 4.67188 6.82877C3.92173 6.07862 3.5 5.06053 3.5 3.99967C3.50005 3.20864 3.73533 2.43571 4.1748 1.77799C4.61433 1.12019 5.23882 0.607105 5.96973 0.304355Z'
								fill='#65FFF7'
							/>
						</svg>
					),
					bgColor: 'rgba(101, 255, 247, 0.45)',
					textColor: '#65FFF7',
				}
			default:
				return null
		}
	}

	const ALL_TYPES = ['relationships', 'work', 'employees'] as const

	// Если не свой профиль и нет целей - не показываем ничего
	if (!isOwnProfile && !iconOnly && !showAllWithText && lookingFor.length === 0) {
		return null
	}

	const typesToRender = (iconOnly || showAllWithText) ? ALL_TYPES : lookingFor

	return (
		<div
			style={{
				display: 'flex',
				gap: '6px',
				alignItems: 'center',
				flexWrap: 'wrap',
				justifyContent: 'center',
			}}
		>
			{typesToRender.map(type => {
				const config = getBadgeConfig(type)
				if (!config) return null

				const isActive = lookingFor.includes(type)
				const inactiveBg = 'rgba(130, 129, 127, 0.45)'

				const isInactive = (iconOnly || showAllWithText) && !isActive
				const showText = !iconOnly

				return (
					<div
						key={type}
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: iconOnly ? '0' : '6px',
							width: iconOnly ? '30px' : 'auto',
							height: '30px',
							paddingLeft: iconOnly ? '0' : '8px',
							paddingRight: iconOnly ? '0' : '12px',
							borderRadius: '17.5px',
							backgroundColor: isInactive ? inactiveBg : config.bgColor,
							backdropFilter: 'blur(10px)',
							flexShrink: 0,
						}}
					>
						<div
							style={{
								transform: 'scale(0.75)',
								display: 'flex',
								alignItems: 'center',
								opacity: isInactive ? 0.5 : 1,
								filter: isInactive ? 'grayscale(100%)' : 'none',
							}}
						>
							{config.icon}
						</div>
						{showText && (
							<span
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '13px',
									fontWeight: 900,
									color: isInactive ? 'rgba(252, 249, 247, 0.5)' : config.textColor,
									whiteSpace: 'nowrap',
								}}
							>
								{config.label}
							</span>
						)}
					</div>
				)
			})}
		</div>
	)
}
