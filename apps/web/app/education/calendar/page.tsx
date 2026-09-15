'use client'

import EducationBottomNav from '@/components/EducationBottomNav'
import EducationHeader from '@/components/EducationHeader'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CalendarPage() {
	const router = useRouter()
	const [selectedDate, setSelectedDate] = useState(new Date())
	const [events, setEvents] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	const getMoscowDate = () => {
		const now = new Date()
		const moscowOffset = 3 * 60
		const localOffset = now.getTimezoneOffset()
		return new Date(now.getTime() + (moscowOffset + localOffset) * 60000)
	}

	const moscowDate = getMoscowDate()
	const currentDay = moscowDate.getDate()
	const fullDate = moscowDate.toLocaleDateString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	})

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		if (!tg) return
		const handleBack = () => {
			if (document.body.dataset.eduHeaderModal) {
				window.dispatchEvent(new Event('closeEduHeaderModal'))
				return
			}
			router.push('/')
		}
		tg.BackButton.show()
		tg.BackButton.onClick(handleBack)
		return () => {
			tg.BackButton.offClick(handleBack)
			tg.BackButton.hide()
		}
	}, [router])

	useEffect(() => {
		loadEvents()
	}, [])

	useEffect(() => {
		const scrollToCurrentDay = () => {
			const calendarScroll = document.getElementById('calendar-scroll')
			if (calendarScroll && currentDay > 1) {
				calendarScroll.scrollLeft = Math.max(0, (currentDay - 3) * 58)
			}
		}
		setTimeout(scrollToCurrentDay, 100)
	}, [currentDay])

	const loadEvents = async () => {
		setLoading(true)
		try {
			const response = await fetch('/api/events')
			if (response.ok) {
				setEvents(await response.json())
			}
		} catch (error) {
			console.error('Error loading events:', error)
		} finally {
			setLoading(false)
		}
	}

	const getDaysInMonth = (date: Date) => {
		return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
	}

	const getEventsForDay = (day: number) => {
		return events.filter(event => {
			const eventDate = new Date(event.eventDate)
			return (
				eventDate.getDate() === day &&
				eventDate.getMonth() === selectedDate.getMonth() &&
				eventDate.getFullYear() === selectedDate.getFullYear()
			)
		})
	}

	const daysInMonth = getDaysInMonth(selectedDate)
	const selectedDayEvents = getEventsForDay(selectedDate.getDate())
	const eventCount = getEventsForDay(currentDay).length

	const handlePrevMonth = () => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.selectionChanged()
		}
		const newDate = new Date(selectedDate)
		newDate.setDate(selectedDate.getDate() - 7)
		setSelectedDate(newDate)
	}

	const handleNextMonth = () => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.selectionChanged()
		}
		const newDate = new Date(selectedDate)
		newDate.setDate(selectedDate.getDate() + 7)
		setSelectedDate(newDate)
	}

	const handleDayClick = (day: number) => {
		if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
			window.Telegram.WebApp.HapticFeedback.selectionChanged()
		}
		const newDate = new Date(selectedDate)
		newDate.setDate(day)
		setSelectedDate(newDate)
	}

	const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

	return (
		<div style={{ minHeight: '100vh', backgroundColor: '#121212', paddingBottom: 'calc(120px + env(safe-area-inset-bottom, 0px))' }}>
			<EducationHeader />
			<div style={{ padding: '0 20px 20px' }}>
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-end',
						justifyContent: 'space-between',
						marginBottom: '24px',
						gap: '16px',
					}}
				>
					<div
						style={{
							fontFamily: 'Oks, sans-serif',
							fontSize: '200px',
							color: '#FCF9F7',
							lineHeight: 0.8,
							fontWeight: 'bold',
						}}
					>
						{currentDay}
					</div>
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							alignItems: 'flex-end',
							justifyContent: 'flex-end',
							paddingBottom: '0px',
							marginBottom: '4px',
						}}
					>
						{eventCount > 0 && (
							<div
								style={{
									backgroundColor: '#E865FF',
									borderRadius: '20px',
									padding: '8px 16px',
									display: 'flex',
									alignItems: 'center',
									gap: '8px',
									marginBottom: '12px',
								}}
							>
								<span
									style={{
										fontFamily: 'Zen Kaku Gothic New, sans-serif',
										fontSize: '18px',
										fontWeight: 500,
										color: '#1E1B1A',
									}}
								>
									{eventCount} {eventCount === 1 ? 'событие' : 'события'}
								</span>
							</div>
						)}
						<div
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '32px',
								fontWeight: 900,
								color: '#FCF9F7',
								textAlign: 'right',
							}}
						>
							{fullDate}
						</div>
					</div>
				</div>
				<div
					style={{
						backgroundColor: 'rgba(39, 39, 39, 0.6)',
						backdropFilter: 'blur(20px)',
						borderRadius: '28px',
						padding: '16px',
						marginBottom: '24px',
					}}
				>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '16px',
						}}
					>
						<button
							onClick={handlePrevMonth}
							style={{
								background: 'none',
								border: 'none',
								color: '#FCF9F7',
								fontSize: '24px',
								cursor: 'pointer',
								padding: '4px',
							}}
						>
							←
						</button>
						<div
							style={{
								fontFamily: 'Zen Kaku Gothic New, sans-serif',
								fontSize: '24px',
								fontWeight: 500,
								color: '#FCF9F7',
								textTransform: 'capitalize',
							}}
						>
							{selectedDate.toLocaleDateString('ru-RU', { month: 'long' })}
						</div>
						<button
							onClick={handleNextMonth}
							style={{
								background: 'none',
								border: 'none',
								color: '#FCF9F7',
								fontSize: '24px',
								cursor: 'pointer',
								padding: '4px',
							}}
						>
							→
						</button>
					</div>
					<div
						id='calendar-scroll'
						style={{
							display: 'flex',
							gap: '8px',
							overflowX: 'auto',
							paddingBottom: '4px',
							scrollbarWidth: 'none',
							msOverflowStyle: 'none',
						}}
						className='calendar-scroll'
					>
						{Array.from({ length: daysInMonth }).map((_, index) => {
							const day = index + 1
							const dayEvents = getEventsForDay(day)
							const isSelected =
								day === selectedDate.getDate() &&
								selectedDate.getMonth() === moscowDate.getMonth() &&
								selectedDate.getFullYear() === moscowDate.getFullYear()
							const isToday =
								day === currentDay &&
								selectedDate.getMonth() === moscowDate.getMonth() &&
								selectedDate.getFullYear() === moscowDate.getFullYear()
							const date = new Date(selectedDate)
							date.setDate(day)
							const dayOfWeek =
								weekDays[date.getDay() === 0 ? 6 : date.getDay() - 1]
							return (
								<div
									key={day}
									onClick={() => handleDayClick(day)}
									style={{
										textAlign: 'center',
										padding: '8px 6px',
										cursor: 'pointer',
										borderRadius: '12px',
										minWidth: '50px',
										flexShrink: 0,
										position: 'relative',
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
									}}
								>
									<div
										style={{
											fontFamily: 'Zen Kaku Gothic New, sans-serif',
											fontSize: '14px',
											color: 'rgba(252, 249, 247, 0.35)',
											fontWeight: 500,
											marginBottom: '6px',
										}}
									>
										{dayOfWeek}
									</div>
									<div
										style={{
											position: 'relative',
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: '40px',
											height: '40px',
											marginBottom: '6px',
										}}
									>
										{isSelected && (
											<div
												style={{
													position: 'absolute',
													width: '40px',
													height: '40px',
													borderRadius: '50%',
													backgroundColor: 'rgba(252, 249, 247, 0.15)',
												}}
											/>
										)}
										<div
											style={{
												fontFamily: 'Zen Kaku Gothic New, sans-serif',
												fontSize: '24px',
												color: isToday ? '#E865FF' : 'rgba(252, 249, 247, 0.65)',
												fontWeight: 500,
												position: 'relative',
												zIndex: 1,
											}}
										>
											{day}
										</div>
									</div>
									<div
										style={{
											display: 'flex',
											justifyContent: 'center',
											gap: '3px',
											minHeight: '6px',
										}}
									>
										{dayEvents.slice(0, 3).map((event, idx) => (
											<div
												key={idx}
												style={{
													width: '5px',
													height: '5px',
													borderRadius: '50%',
													backgroundColor:
														event.eventType === 'LIVE_STREAM'
															? '#E865FF'
															: event.eventType === 'WORKSHOP'
																? '#5111E3'
																: '#F23318',
												}}
											/>
										))}
									</div>
								</div>
							)
						})}
					</div>
				</div>
				{/* Legend */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '20px',
						marginBottom: '24px',
					}}
				>
					{[
						{ label: 'Эфиры', color: '#E865FF' },
						{ label: 'Встречи', color: '#5111E3' },
						{ label: 'Другое', color: '#F23318' },
					].map(item => (
						<div
							key={item.label}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '6px',
							}}
						>
							<div
								style={{
									width: '8px',
									height: '8px',
									borderRadius: '50%',
									backgroundColor: item.color,
									flexShrink: 0,
								}}
							/>
							<span
								style={{
									fontFamily: 'Zen Kaku Gothic New, sans-serif',
									fontSize: '14px',
									fontWeight: 500,
									color: 'rgba(252, 249, 247, 0.65)',
								}}
							>
								{item.label}
							</span>
						</div>
					))}
				</div>
				<div>
					<h2
						style={{
							fontFamily: 'Zen Kaku Gothic New, sans-serif',
							fontSize: '18px',
							fontWeight: 500,
							color: 'rgba(252, 249, 247, 0.65)',
							marginBottom: '16px',
						}}
					>
						События
					</h2>
					{loading ? (
						<div
							style={{
								display: 'flex',
								justifyContent: 'center',
								padding: '40px',
							}}
						>
							<div
								style={{
									width: '40px',
									height: '40px',
									border: '3px solid rgba(101, 255, 247, 0.3)',
									borderTop: '3px solid #65FFF7',
									borderRadius: '50%',
									animation: 'spin 1s linear infinite',
								}}
							/>
						</div>
					) : selectedDayEvents.length === 0 ? (
						<div style={{ textAlign: 'center', padding: '40px 20px' }}>
							<p
								style={{
									fontFamily: 'LT Superior, sans-serif',
									fontSize: '16px',
									color: 'rgba(252, 249, 247, 0.5)',
								}}
							>
								Нет событий на этот день
							</p>
						</div>
					) : (
						selectedDayEvents.map(event => (
							<div
								key={event.id}
								style={{
									marginBottom: '16px',
									borderRadius: '28px',
									overflow: 'hidden',
									cursor: 'pointer',
								}}
								onClick={() => {
									if (
										typeof window !== 'undefined' &&
										window.Telegram?.WebApp
									) {
										window.Telegram.WebApp.HapticFeedback.impactOccurred(
											'light',
										)
										if (event.postUrl) {
											window.Telegram.WebApp.openTelegramLink(event.postUrl)
										}
									}
								}}
							>
								{event.imageUrl && (
									<img
										src={event.imageUrl}
										alt={event.title}
										style={{
											width: '100%',
											height: 'auto',
											display: 'block',
											borderRadius: '28px',
										}}
									/>
								)}
							</div>
						))
					)}
				</div>
			</div>
			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
				.calendar-scroll {
					scrollbar-width: none;
					-ms-overflow-style: none;
				}
				.calendar-scroll::-webkit-scrollbar {
					display: none;
				}
			`}</style>
			<EducationBottomNav />
		</div>
	)
}
