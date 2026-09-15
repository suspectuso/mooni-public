'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function EditResumePage() {
	const params = useParams()
	const router = useRouter()
	const resumeId = params.id as string

	useEffect(() => {
		// Redirect immediately with edit parameter
		if (resumeId) {
			router.replace(`/work/resumes/new?edit=${resumeId}`)
		}
	}, [resumeId, router])

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
			<div
				style={{
					width: '50px',
					height: '50px',
					border: '3px solid rgba(252, 249, 247, 0.1)',
					borderTop: '3px solid #FCF9F7',
					borderRadius: '50%',
					animation: 'spin 1s linear infinite',
				}}
			/>
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
