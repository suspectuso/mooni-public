'use client'

import { memo, useCallback, useEffect, useMemo, useRef } from 'react'







const dayContainerStyles = { width: '45px', gap: '4px' }

const dayLabelStyles = { color: 'rgba(252, 249, 247, 0.65)' }

// Мемоизированный компонент дня
const DayCell = memo(
	({
		date,
		isToday,
		isFuture,
		isSelectedDay,
		isPast,
		dayProgress,
		onDayClick,
	}: {
		date: Date
		isToday: boolean
		isFuture: boolean
		isSelectedDay: boolean
		isPast: boolean
		dayProgress: number
		onDayClick: (date: Date) => void
	}) => {
		const handleClick = useCallback(() => {
			if (!isFuture) onDayClick(date)
		}, [date, isFuture, onDayClick])

		const cellStyles = useMemo(
			() => ({
				width: '45px',
				height: '45px',
				borderRadius: '10px',
				backgroundColor: isSelectedDay
					? 'rgba(252, 249, 247, 0.15)'
					: 'rgba(252, 249, 247, 0.05)',
				opacity:
					isPast && dayProgress > 0 && dayProgress < 100
						? 0.3
						: isFuture
							? 0.5
							: 1,
				boxShadow:
					isPast && dayProgress > 0 && dayProgress < 100
						? '0 0 5px 5px rgba(247, 113, 11, 0.45)'
						: 'none',
				position: 'relative' as const,
				overflow: 'hidden',
				transition: 'all 0.2s',
				cursor: isFuture ? 'default' : 'pointer',
			}),
			[isSelectedDay, isPast, dayProgress, isFuture],
		)

		const progressBarStyles = useMemo(
			() => ({
				position: 'absolute' as const,
				bottom: 0,
				left: 0,
				right: 0,
				height: `${dayProgress}%`,
				background: 'linear-gradient(180deg, #E3F040 0%, #F23318 100%)',
				opacity: isPast && dayProgress < 100 ? 0.7 : 1,
				transition: 'all 0.2s',
			}),
			[dayProgress, isPast],
		)

		const numberStyles = useMemo(
			() => ({
				color: isToday
					? '#fc2a0d'
					: isPast && dayProgress > 0 && dayProgress < 100
						? 'rgba(252, 249, 247, 0.2)'
						: 'rgba(252, 249, 247, 0.65)',
				fontFamily: 'Zen Kaku Gothic New, sans-serif',
				fontSize: '24px',
				fontWeight: 600,
				position: 'relative' as const,
				zIndex: 10,
			}),
			[isToday, isPast, dayProgress],
		)

		return (
			<div
				className='flex flex-col items-center flex-shrink-0'
				style={dayContainerStyles}
			>
				<div className='text-xs font-medium' style={dayLabelStyles}>
					{date.toLocaleDateString('ru', { weekday: 'short' })[0].toUpperCase()}
				</div>
				<div
					className='relative overflow-hidden transition-all cursor-pointer hover:opacity-80'
					style={cellStyles}
					onClick={handleClick}
				>
					{!isFuture && dayProgress > 0 && <div style={progressBarStyles} />}
					<div className='absolute inset-0 flex items-center justify-center'>
						<span style={numberStyles}>{date.getDate()}</span>
					</div>
				</div>
			</div>
		)
	},
)

DayCell.displayName = 'DayCell'

interface HabitCalendarProps {
	selectedDate: Date
	habitStreak: number
	getStreakText: (days: number) => string
	getDayProgress: (date: Date) => number
	handleDayClick: (date: Date) => void
}

const HabitCalendar = memo(
	({
		selectedDate,
		habitStreak,
		getStreakText,
		getDayProgress,
		handleDayClick,
	}: HabitCalendarProps) => {
		const calendarRef = useRef<HTMLDivElement>(null)

		// Функция для получения локальной даты в формате YYYY-MM-DD
		const getLocalDateString = (date: Date): string => {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			return `${year}-${month}-${day}`
		}

		// Получаем текущую дату в локальном часовом поясе
		const today = new Date()
		const localDate = new Date(
			today.getFullYear(),
			today.getMonth(),
			today.getDate(),
		)

		// Автоскролл к текущему дню при монтировании
		useEffect(() => {
			if (calendarRef.current) {
				// Индекс текущего дня = 30 (середина массива из 61 элемента)
				// Ширина одного дня = 45px + gap 6px = 51px
				const scrollPosition =
					30 * 51 - calendarRef.current.clientWidth / 2 + 25
				calendarRef.current.scrollLeft = scrollPosition
			}
		}, [])

		return (
			<div style={{ marginBottom: '24px' }}>
				<div
					className='flex items-center justify-between'
					style={{ marginBottom: '12px' }}
				>
					<h2
						className='font-semibold'
						style={{
							fontSize: '24px',
							color: '#fff',
							textTransform: 'capitalize',
						}}
					>
						{localDate.toLocaleDateString('ru', {
							month: 'long',
							day: 'numeric',
						})}
					</h2>
					{habitStreak > 0 && (
						<div
							className='flex items-center rounded-full'
							style={{
								gap: '8px',
								padding: '6px 12px',
								backgroundColor: '#E3F040',
							}}
						>
							<svg
								width='9'
								height='13'
								viewBox='0 0 9 13'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M4.5 13C6.9855 13 9 11.375 9 8.53125C9 7.3125 8.625 5.28125 7.125 3.65625C7.3125 4.875 6.1875 5.28125 6.1875 5.28125C6.75 3.25 5.25 0.40625 3 0C3.26775 1.625 3.375 3.25 1.5 4.875C0.5625 5.6875 0 7.09231 0 8.53125C0 11.375 2.0145 13 4.5 13ZM4.5 12.1875C3.25725 12.1875 2.25 11.375 2.25 9.95312C2.25 9.34375 2.4375 8.32812 3.1875 7.51562C3.09375 8.125 3.75 8.53125 3.75 8.53125C3.46875 7.51562 4.125 5.89062 5.25 5.6875C5.11575 6.5 5.0625 7.3125 6 8.125C6.46875 8.53125 6.75 9.23325 6.75 9.95312C6.75 11.375 5.74275 12.1875 4.5 12.1875Z'
									fill='#F7710B'
								/>
							</svg>
							<span
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '14px',
									fontWeight: 600,
									color: '#000',
								}}
							>
								{getStreakText(habitStreak)}
							</span>
						</div>
					)}
				</div>
				<div
					ref={calendarRef}
					className='flex overflow-x-auto'
					style={{
						gap: '6px',
						paddingBottom: '8px',
						scrollbarWidth: 'none',
						scrollBehavior: 'smooth',
					}}
				>
					{Array.from({ length: 61 }).map((_, i) => {
						// Создаем дату в локальном часовом поясе
						const today = new Date()
						const date = new Date(
							today.getFullYear(),
							today.getMonth(),
							today.getDate() - 30 + i,
						)
						const dayProgress = getDayProgress(date)
						const isToday = i === 30
						const isFuture = i > 30
						const isSelectedDay =
							getLocalDateString(date) === getLocalDateString(selectedDate)
						const isPast = i < 30

						return (
							<div
								key={i}
								className='flex flex-col items-center flex-shrink-0'
								style={{ width: '45px', gap: '4px' }}
							>
								<div
									className='text-xs font-medium'
									style={{ color: 'rgba(252, 249, 247, 0.65)' }}
								>
									{date
										.toLocaleDateString('ru', { weekday: 'short' })[0]
										.toUpperCase()}
								</div>
								<div
									className='relative overflow-hidden transition-all cursor-pointer hover:opacity-80'
									style={{
										width: '45px',
										height: '45px',
										borderRadius: '10px',
										backgroundColor: isSelectedDay
											? 'rgba(252, 249, 247, 0.15)'
											: 'rgba(252, 249, 247, 0.05)',
										opacity:
											isPast && dayProgress > 0 && dayProgress < 100
												? 0.3
												: isFuture
													? 0.5
													: 1,
										boxShadow:
											isPast && dayProgress > 0 && dayProgress < 100
												? '0 0 5px 5px rgba(247, 113, 11, 0.45)'
												: 'none',
									}}
									onClick={() => !isFuture && handleDayClick(date)}
								>
									{!isFuture && dayProgress > 0 && (
										<div
											className='absolute bottom-0 left-0 right-0 transition-all'
											style={{
												height: `${dayProgress}%`,
												background:
													'linear-gradient(180deg, #E3F040 0%, #F23318 100%)',
												opacity: isPast && dayProgress < 100 ? 0.7 : 1,
											}}
										/>
									)}
									<div className='absolute inset-0 flex items-center justify-center'>
										<span
											className='relative z-10'
											style={{
												color: isToday
													? '#fc2a0d'
													: isPast && dayProgress > 0 && dayProgress < 100
														? 'rgba(252, 249, 247, 0.2)'
														: 'rgba(252, 249, 247, 0.65)',
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '24px',
												fontWeight: 600,
											}}
										>
											{date.getDate()}
										</span>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		)
	},
)

export default HabitCalendar
