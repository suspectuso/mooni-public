'use client'

import RadarBottomNav from '@/components/RadarBottomNav'
import RadarHeader from '@/components/RadarHeader'
import ProjectForm from '@/components/radar/ProjectForm'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Category {
	id: string
	name: string
}

interface Tag {
	id: string
	name: string
}

export default function EditProjectPage() {
	const router = useRouter()
	const params = useParams()
	const [categories, setCategories] = useState<Category[]>([])
	const [tags, setTags] = useState<Tag[]>([])
	const [initialData, setInitialData] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const [dataLoading, setDataLoading] = useState(true)

	useEffect(() => {
		const tg = (window as any).Telegram?.WebApp
		const handleBack = () => { router.back() }
		if (tg) {
			tg.ready()
			tg.expand()
			tg.BackButton.show()
			tg.BackButton.onClick(handleBack)
		}

		fetchFiltersData()
		fetchProjectData()

		return () => {
			if (tg) {
				tg.BackButton.offClick(handleBack)
				tg.BackButton.hide()
			}
		}
	}, [])

	const fetchFiltersData = async () => {
		try {
			const [categoriesRes, tagsRes] = await Promise.all([
				fetch('/api/radar/categories'),
				fetch('/api/radar/tags'),
			])

			if (categoriesRes.ok) {
				const categoriesData = await categoriesRes.json()
				setCategories(categoriesData)
			}

			if (tagsRes.ok) {
				const tagsData = await tagsRes.json()
				setTags(tagsData)
			}
		} catch (error) {
			console.error('Error fetching filters:', error)
		}
	}

	const fetchProjectData = async () => {
		try {
			const id = Array.isArray(params.id) ? params.id[0] : params.id
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			const response = await fetch(`/api/radar/projects/${id}`, {
				headers: {
					'x-telegram-user-id': userId.toString(),
				},
			})

			if (response.ok) {
				const project = await response.json()

				// Получаем текущего пользователя
				const currentUserResponse = await fetch('/api/users/search?query=me', {
					headers: {
						'x-telegram-user-id': userId.toString(),
					},
				})

				let currentUserId = null
				if (currentUserResponse.ok) {
					const users = await currentUserResponse.json()
					if (users && users.length > 0) {
						currentUserId = users[0].id
					}
				}

				// Формируем список founders, включая текущего пользователя если его нет
				let founders = project.teamMembers
					? project.teamMembers.map((tm: any) => ({
							id: tm.user.id,
							username: tm.user.username,
							avatarUrl: tm.user.avatarUrl,
						}))
					: []

				// Если текущий пользователь не в списке, добавляем его
				if (
					currentUserId &&
					!founders.find((f: any) => f.id === currentUserId)
				) {
					const currentUser = await fetch(`/api/users/search?query=${userId}`, {
						headers: {
							'x-telegram-user-id': userId.toString(),
						},
					})
					if (currentUser.ok) {
						const userData = await currentUser.json()
						if (userData && userData.length > 0) {
							founders = [
								{
									id: userData[0].id,
									username: userData[0].username,
									avatarUrl: userData[0].avatarUrl,
								},
								...founders,
							]
						}
					}
				}

				setInitialData({
					name: project.name,
					description: project.description,
					avatarPath: project.avatarPath,
					projectUrl: project.projectUrl || '',
					stage: project.stage,
					needsInvestment: project.needsInvestment,
					investmentMin: project.investmentMin?.toString() || '',
					investmentMax: project.investmentMax?.toString() || '',
					investmentPurpose: project.investmentPurpose || '',
					investorShare: project.investorShare?.toString() || '',
					needsEmployees: project.needsEmployees,
					selectedCategories: project.categories.map((c: any) => c.category.id),
					selectedTags: project.tags.map((t: any) => t.tag.id),
					linkedVacancies: project.linkedVacancies
						? project.linkedVacancies.map((lv: any) => ({
								id: lv.vacancy.id,
								position: lv.vacancy.position,
							}))
						: [],
					founders,
					photos: project.photos.map((p: any) => p.photoPath),
				})
			}
		} catch (error) {
			console.error('Error fetching project:', error)
		} finally {
			setDataLoading(false)
		}
	}

	const handleSubmit = async (projectData: any) => {
		setLoading(true)
		try {
			const id = Array.isArray(params.id) ? params.id[0] : params.id
			const tg = (window as any).Telegram?.WebApp
			const userId = tg?.initDataUnsafe?.user?.id || 'test_user'

			const response = await fetch(`/api/radar/projects/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					'x-telegram-user-id': userId.toString(),
				},
				body: JSON.stringify(projectData),
			})

			if (response.ok) {
				if (tg) tg.HapticFeedback.notificationOccurred('success')
				router.push('/radar/profile')
			} else {
				throw new Error('Failed to update project')
			}
		} catch (error) {
			console.error('Error updating project:', error)
			alert('Ошибка при обновлении проекта')
		} finally {
			setLoading(false)
		}
	}

	if (dataLoading) {
		return (
			<div
				style={{
					minHeight: '100vh',
					backgroundColor: '#1E1B1A',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						width: '40px',
						height: '40px',
						border: '3px solid rgba(140, 255, 101, 0.2)',
						borderTop: '3px solid #8CFF65',
						borderRadius: '50%',
						animation: 'spin 1s linear infinite',
					}}
				/>
			</div>
		)
	}

	return (
		<div
			style={{
				minHeight: '100vh',
				backgroundColor: '#1E1B1A',
				paddingBottom: '100px',
			}}
		>
			<RadarHeader />
			<div style={{ padding: '20px' }}>
				<h1
					style={{
						fontFamily: 'Zen Kaku Gothic New, sans-serif',
						fontWeight: 900,
						fontSize: '24px',
						color: '#FCF9F7',
						marginBottom: '24px',
					}}
				>
					Редактировать проект
				</h1>

				{initialData && (
					<ProjectForm
						initialData={initialData}
						categories={categories}
						tags={tags}
						onSubmit={handleSubmit}
						submitButtonText='Сохранить изменения'
						loading={loading}
					/>
				)}
			</div>

			<RadarBottomNav />

			<style jsx>{`
				@keyframes spin {
					0% {
						transform: rotate(0deg);
					}
					100% {
						transform: rotate(360deg);
					}
				}
			`}</style>
		</div>
	)
}
