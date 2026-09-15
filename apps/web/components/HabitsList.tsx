'use client'

interface Habit {
	id: string
	title: string
	description?: string
	category?: string
	color?: string
}

interface HabitsListProps {
	selectedActiveHabits: Habit[]
	selectedCompletedHabits: Habit[]
	userId: string
	handleLogHabit: (habitId: string) => void
	loadHabits: (userId: string) => void
	setShowAddModal: (show: boolean) => void
	setEditingHabit: (habit: Habit | null) => void
	setDeletingHabit: (habit: Habit | null) => void
}

export default function HabitsList({
	selectedActiveHabits,
	selectedCompletedHabits,
	userId: _userId,
	handleLogHabit,
	loadHabits: _loadHabits,
	setShowAddModal,
	setEditingHabit,
	setDeletingHabit,
}: HabitsListProps) {
	return (
		<div style={{ padding: '10px 18px' }}>
			{/* Habits Header */}
			<div
				className='flex items-center justify-between'
				style={{ marginBottom: '12px' }}
			>
				<h3 className='text-sm font-semibold text-gray-400'>Мои привычки</h3>
				<button
					onClick={() => {
						window.Telegram?.WebApp?.HapticFeedback.impactOccurred('light')
						setShowAddModal(true)
					}}
					className='flex items-center justify-center transition-all'
					style={{
						width: '32px',
						height: '32px',
						borderRadius: '50%',
						backgroundColor: '#272727',
					}}
				>
					<svg
						width='19'
						height='20'
						viewBox='0 0 19 20'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M18.0599 10.5684H10.2339V19.1302H7.82591V10.5684H-9.01591e-05V8.29418H7.82591V-3.93756e-05H10.2339V8.29418H18.0599V10.5684Z'
							fill='#F23318'
						/>
					</svg>
				</button>
			</div>

			{/* Active Habits */}
			{selectedActiveHabits.length > 0 && (
				<div
					className='bg-[#272727] rounded-3xl overflow-hidden'
					style={{ marginBottom: '16px' }}
				>
					{selectedActiveHabits.map((habit, index) => (
						<div key={habit.id}>
							<div
								className='transition-all'
								style={{
									padding: '16px 18px',
								}}
							>
								<div className='flex items-center gap-3'>
									<button
										onClick={() => handleLogHabit(habit.id)}
										className='rounded-full border-2 border-gray-600 hover:border-[#fc2a0d] flex items-center justify-center transition-all flex-shrink-0'
										style={{
											width: '40px',
											height: '40px',
										}}
									/>
									<div className='flex-1 min-w-0'>
										<h3 className='font-semibold text-white text-base truncate'>
											{habit.title}
										</h3>
										{habit.description && (
											<p className='text-sm text-gray-400 truncate'>
												{habit.description}
											</p>
										)}
									</div>
									<button
										onClick={() => {
											window.Telegram?.WebApp?.HapticFeedback.impactOccurred(
												'light'
											)
											setEditingHabit(habit)
										}}
										className='flex items-center justify-center transition-all flex-shrink-0'
										style={{
											width: '32px',
											height: '32px',
										}}
									>
										<svg
											width='21'
											height='21'
											viewBox='0 0 21 21'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M11 5.41418L1 15.4142V19.9142H5.5L15.5 9.91418M11 5.41418L15.5 9.91418M11 5.41418L15 1.41418L19.5 5.91418L15.5 9.91418'
												stroke='#FCF9F7'
												strokeWidth='2'
											/>
										</svg>
									</button>
									<button
										onClick={() => {
											window.Telegram?.WebApp?.HapticFeedback.impactOccurred(
												'light'
											)
											setDeletingHabit(habit)
										}}
										className='flex items-center justify-center transition-all flex-shrink-0'
										style={{
											width: '32px',
											height: '32px',
										}}
									>
										<svg
											width='18'
											height='22'
											viewBox='0 0 18 22'
											fill='none'
											xmlns='http://www.w3.org/2000/svg'
										>
											<path
												d='M7.2 0C6.7293 0 6.2469 0.168667 5.9058 0.516084C5.5656 0.861667 5.4 1.353 5.4 1.83333V2.75H0V4.58333H0.9V19.25C0.9 20.7579 2.1195 22 3.6 22H14.4C15.8805 22 17.1 20.7579 17.1 19.25V4.58333H18V2.75H12.6V1.83333C12.6 1.35392 12.4344 0.862583 12.0933 0.515167C11.754 0.168666 11.2707 0 10.8 0H7.2ZM7.2 1.83333H10.8V2.75H7.2V1.83333ZM2.7 4.58333H15.3V19.25C15.3 19.7588 14.8995 20.1667 14.4 20.1667H3.6C3.1005 20.1667 2.7 19.7588 2.7 19.25V4.58333ZM4.5 7.33333V17.4167H6.3V7.33333H4.5ZM8.1 7.33333V17.4167H9.9V7.33333H8.1ZM11.7 7.33333V17.4167H13.5V7.33333H11.7Z'
												fill='#F23318'
											/>
										</svg>
									</button>
								</div>
							</div>
							{index < selectedActiveHabits.length - 1 && (
								<div
									style={{
										height: '1px',
										backgroundColor: '#3D41487C',
										marginLeft: '18px',
										marginRight: '18px',
									}}
								/>
							)}
						</div>
					))}
				</div>
			)}

			{/* Completed Habits */}
			{selectedCompletedHabits.length > 0 && (
				<>
					<p
						className='text-center text-sm text-gray-500'
						style={{ marginBottom: '12px' }}
					>
						Выполнено
					</p>
					<div
						className='bg-[#272727] rounded-3xl overflow-hidden opacity-50'
						style={{ marginBottom: '16px' }}
					>
						{selectedCompletedHabits.map((habit, index) => (
							<div key={habit.id}>
								<div
									className='transition-all'
									style={{
										padding: '16px 18px',
									}}
								>
									<div className='flex items-center gap-3'>
										<button
											onClick={() => handleLogHabit(habit.id)}
											className='rounded-full border-2 bg-[#fc2a0d] border-[#fc2a0d] flex items-center justify-center transition-all flex-shrink-0'
											style={{
												width: '40px',
												height: '40px',
											}}
										>
											<svg
												width='19'
												height='15'
												viewBox='0 0 19 15'
												fill='none'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													fillRule='evenodd'
													clipRule='evenodd'
													d='M18.5872 0.18216C19.0745 0.525658 19.1534 1.21721 18.7561 1.66168L7.85802 13.8511L7.79177 13.9251C7.42342 14.3368 6.79107 14.3718 6.37953 14.0033L6.29512 13.9278L0.327884 8.5888C-0.111445 8.19573 -0.108928 7.50721 0.333264 7.11736C0.70721 6.78768 1.26862 6.78974 1.64014 7.12215L6.20495 11.2065C6.61664 11.5749 7.24901 11.5396 7.61722 11.1278L17.2695 0.332533C17.6069 -0.0448174 18.1735 -0.109475 18.5872 0.18216Z'
													fill='#FCF9F7'
												/>
											</svg>
										</button>
										<div className='flex-1 min-w-0'>
											<h3 className='font-semibold text-gray-400 text-base truncate line-through'>
												{habit.title}
											</h3>
											{habit.description && (
												<p className='text-sm text-gray-500 truncate line-through'>
													{habit.description}
												</p>
											)}
										</div>
									</div>
								</div>
								{index < selectedCompletedHabits.length - 1 && (
									<div
										style={{
											height: '1px',
											backgroundColor: '#3D41487C',
											marginLeft: '18px',
											marginRight: '18px',
										}}
									/>
								)}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}
