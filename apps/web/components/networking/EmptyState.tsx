'use client'

import NetworkingBottomNav from '@/components/NetworkingBottomNav'
import NetworkingHeader from '@/components/NetworkingHeader'

interface EmptyStateProps {
	type: 'no-profiles' | 'no-user-id' | 'loading'
}

export default function EmptyState({ type }: EmptyStateProps) {
	if (type === 'no-user-id') {
		return (
			<div className='h-screen bg-[#121212] flex flex-col'>
				<NetworkingHeader />
				<div className='flex-1 flex flex-col items-center justify-center px-6'>
					<div
						style={{
							width: '80px',
							height: '80px',
							borderRadius: '50%',
							backgroundColor: 'rgba(252, 249, 247, 0.1)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: '24px',
						}}
					>
						<svg
							width='40'
							height='40'
							viewBox='0 0 24 24'
							fill='none'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								d='M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z'
								fill='#FCF9F7'
								opacity='0.65'
							/>
						</svg>
					</div>
					<p
						className='text-[#FCF9F7] text-xl text-center mb-2'
						style={{ fontFamily: 'Oks, sans-serif' }}
					>
						Ошибка инициализации
					</p>
					<p className='text-[#FCF9F7]/65 text-sm text-center mb-8'>
						Откройте приложение через Telegram бота
					</p>
				</div>
				<NetworkingBottomNav />
			</div>
		)
	}

	if (type === 'no-profiles') {
		return (
			<div className='h-screen bg-[#121212] flex flex-col'>
				<NetworkingHeader />
				<div className='flex-1 flex flex-col items-center justify-center px-6'>
					<p className='text-[#FCF9F7] text-lg text-center mb-4'>
						Пока нет профилей
					</p>
					<p className='text-[#FCF9F7]/65 text-sm text-center'>
						Включите показ профиля в настройках
					</p>
				</div>
				<NetworkingBottomNav />
			</div>
		)
	}

	return null
}
