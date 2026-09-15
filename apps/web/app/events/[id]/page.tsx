'use client'

import BottomNav from '@/components/BottomNav'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Event {
	id: string
	title: string
	description?: string
	eventDate: string
	eventType: string
	liveStreamLink?: string
	recordingLink?: string
	communityLink: string
	imageUrl?: string
}

export default function EventDetailPage() {
	const params = useParams()
	const router = useRouter()
	const [event, setEvent] = useState<Event | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		loadEvent()
	}, [params.id])

	const loadEvent = async () => {
		const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
		try {
			const response = await fetch(`${API_URL}/events/${params.id}`)
			if (response.ok) {
				const data = await response.json()
				setEvent(data)
			}
		} catch (error) {
			console.error('Error loading event:', error)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#121212',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div className='text-white'>Загрузка...</div>
			</div>
		)
	}

	if (!event) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#121212',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div className='text-white'>Мероприятие не найдено</div>
			</div>
		)
	}

	const eventTime = new Date(event.eventDate).toLocaleTimeString('ru-RU', {
		hour: '2-digit',
		minute: '2-digit',
	})

	const eventDate = new Date(event.eventDate).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
	})

	return (
		<div
			style={{
				minHeight: '100vh',
				paddingBottom: '140px',
				backgroundColor: '#121212',
				maxWidth: '480px',
				margin: '0 auto',
			}}
		>
			{/* Back button */}
			<div style={{ padding: '24px 18px 0' }}>
				<button
					onClick={() => router.back()}
					className='flex items-center text-white'
					style={{ gap: '8px', marginBottom: '16px' }}
				>
					<svg
						width={24}
						height={24}
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth={2}
					>
						<path d='M19 12H5M12 19l-7-7 7-7' />
					</svg>
					<span>Назад</span>
				</button>
			</div>

			{/* Event image */}
			{event.imageUrl && (
				<div className='relative w-full' style={{ height: '300px' }}>
					<img
						src={event.imageUrl}
						alt={event.title}
						className='object-cover'
					/>
				</div>
			)}

			{/* Event details */}
			<div style={{ padding: '24px 18px' }}>
				<h1
					style={{
						fontFamily: 'Oks, sans-serif',
						fontSize: '32px',
						color: '#fff',
						marginBottom: '16px',
					}}
				>
					{event.title}
				</h1>

				<div
					className='flex items-center'
					style={{ gap: '16px', marginBottom: '24px' }}
				>
					<div className='flex items-center' style={{ gap: '8px' }}>
						<svg
							width={20}
							height={20}
							viewBox='0 0 24 24'
							className='text-gray-400'
						>
							<path
								fill='currentColor'
								d='M12 20a8 8 0 0 0 8-8a8 8 0 0 0-8-8a8 8 0 0 0-8 8a8 8 0 0 0 8 8m0-18a10 10 0 0 1 10 10a10 10 0 0 1-10 10C6.47 22 2 17.5 2 12A10 10 0 0 1 12 2m.5 5v5.25l4.5 2.67l-.75 1.23L11 13V7z'
							/>
						</svg>
						<span className='text-gray-400 text-sm'>
							{eventTime} • {eventDate}
						</span>
					</div>
				</div>

				{event.description && (
					<p
						className='text-white text-base'
						style={{ marginBottom: '32px', lineHeight: '1.6' }}
					>
						{event.description}
					</p>
				)}

				{/* Action buttons */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					{event.liveStreamLink && (
						<a
							href={event.liveStreamLink}
							target='_blank'
							rel='noopener noreferrer'
							className='block w-full text-center bg-[#fc2a0d] text-white font-medium rounded-full hover:bg-[#e02509] transition-all'
							style={{ padding: '16px' }}
						>
							Перейти к эфиру
						</a>
					)}

					{event.recordingLink && (
						<a
							href={event.recordingLink}
							target='_blank'
							rel='noopener noreferrer'
							className='block w-full text-center bg-[#272727] border border-[#95fe65] text-[#95fe65] font-medium rounded-full hover:bg-[#95fe6510] transition-all'
							style={{ padding: '16px' }}
						>
							Смотреть запись
						</a>
					)}

					{!event.liveStreamLink && (
						<a
							href={`https://t.me/${event.communityLink
								.replace('@', '')
								.replace('https://t.me/', '')}`}
							target='_blank'
							rel='noopener noreferrer'
							className='block w-full text-center bg-[#272727] text-gray-400 font-medium rounded-full hover:bg-[#2a2a2a] transition-all'
							style={{ padding: '16px' }}
						>
							Ссылка в сообществе {event.communityLink}
						</a>
					)}
				</div>
			</div>

			<BottomNav />
		</div>
	)
}
