'use client'

interface Sprint {
	id: string
	title: string
	taskTitle: string
	taskDescription?: string
}

interface SprintTasksProps {
	userSprints: Sprint[]
	sprintTaskStatuses: Map<string, any>
	selectedDate: Date
	isToday: (date: Date) => boolean
	handleCompleteSprintTask: (sprintId: string) => void
}

export default function SprintTasks({
	userSprints,
	sprintTaskStatuses,
	selectedDate,
	isToday,
	handleCompleteSprintTask,
}: SprintTasksProps) {
	if (userSprints.length === 0) return null

	return (
		<div style={{ padding: '10px 18px' }}>
			<h3
				className='text-sm font-semibold text-gray-400 flex items-center'
				style={{ marginBottom: '12px', padding: '0 8px', gap: '6px' }}
			>
				<svg
					width='10'
					height='12'
					viewBox='0 0 10 12'
					fill='none'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path
						fillRule='evenodd'
						clipRule='evenodd'
						d='M9.18765 0C9.51952 0 9.70705 0.380837 9.5047 0.643885L7.87991 2.75611C7.76931 2.89989 7.76931 3.1001 7.87991 3.24388L9.50471 5.35613C9.70705 5.61918 9.51952 6.00002 9.18765 6.00001L1.93844 5.99998C1.71753 5.99998 1.53844 6.17907 1.53844 6.39998V11.6C1.53844 11.8209 1.35935 12 1.13844 12H0.4C0.179086 12 0 11.8209 0 11.6V0.4C0 0.179086 0.179086 0 0.4 0H9.18765Z'
						fill='#F23318'
					/>
				</svg>
				Активности
			</h3>
			<div
				className='bg-[#272727] rounded-3xl overflow-hidden'
				style={{ marginBottom: '16px' }}
			>
				{userSprints.map((sprint, index) => {
					const status = sprintTaskStatuses.get(sprint.id)
					const isCompletedToday = status?.completedToday || false
					const canComplete = isToday(selectedDate) && !isCompletedToday

					return (
						<div key={sprint.id}>
							<div
								className='transition-all'
								style={{
									padding: '16px 18px',
								}}
							>
								<div className='flex items-center gap-3'>
									<button
										onClick={() => {
											if (canComplete) {
												handleCompleteSprintTask(sprint.id)
											}
										}}
										disabled={!canComplete}
										className='flex-shrink-0 transition-all rounded-full flex items-center justify-center'
										style={{
											width: '40px',
											height: '40px',
											border: isCompletedToday ? 'none' : '2px solid #fc2a0d',
											backgroundColor: isCompletedToday
												? '#fc2a0d'
												: 'transparent',
											opacity: canComplete ? 1 : 0.5,
											cursor: canComplete ? 'pointer' : 'not-allowed',
										}}
									>
										{isCompletedToday && (
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
										)}
									</button>

									<div className='flex-1'>
										<div
											className='flex items-center justify-between'
											style={{ marginBottom: '4px' }}
										>
											<span className='text-white font-medium'>
												{sprint.taskTitle}
											</span>
											<div
												className='flex items-center rounded-full'
												style={{
													padding: '4px 10px',
													backgroundColor: 'rgba(242, 51, 24, 0.2)',
													gap: '6px',
												}}
											>
												<svg
													width='10'
													height='12'
													viewBox='0 0 10 12'
													fill='none'
													xmlns='http://www.w3.org/2000/svg'
												>
													<path
														fillRule='evenodd'
														clipRule='evenodd'
														d='M9.18765 0C9.51952 0 9.70705 0.380837 9.5047 0.643885L7.87991 2.75611C7.76931 2.89989 7.76931 3.1001 7.87991 3.24388L9.50471 5.35613C9.70705 5.61918 9.51952 6.00002 9.18765 6.00001L1.93844 5.99998C1.71753 5.99998 1.53844 6.17907 1.53844 6.39998V11.6C1.53844 11.8209 1.35935 12 1.13844 12H0.4C0.179086 12 0 11.8209 0 11.6V0.4C0 0.179086 0.179086 0 0.4 0H9.18765Z'
														fill='#F23318'
													/>
												</svg>
												<span
													className='text-xs font-medium'
													style={{ color: '#F23318' }}
												>
													Спринт
												</span>
											</div>
										</div>
										{sprint.taskDescription && (
											<p className='text-sm text-gray-400'>
												{sprint.taskDescription}
											</p>
										)}
										<div
											className='flex items-center justify-between'
											style={{ marginTop: '4px' }}
										>
											<p className='text-xs text-gray-500'>{sprint.title}</p>
											<div
												className='flex items-center rounded-full'
												style={{
													padding: '2px 8px',
													backgroundColor: 'rgba(247, 113, 11, 0.2)',
													gap: '4px',
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
													className='text-xs font-medium'
													style={{ color: '#F7710B' }}
												>
													{status?.totalCompletions || 0} раза
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							{index < userSprints.length - 1 && (
								<div
									style={{
										height: '1px',
										backgroundColor: '#1a1a1a',
										margin: '0 18px',
									}}
								/>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
