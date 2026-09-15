import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData()
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')

		if (!userId) {
			return NextResponse.json({ error: 'userId is required' }, { status: 400 })
		}

		// Create new FormData with correct field name and userId in body
		const backendFormData = new FormData()
		const file = formData.get('avatar') || formData.get('file')
		if (file) {
			backendFormData.append('file', file)
		}
		backendFormData.append('userId', userId)

		const BACKEND_URL =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

		const response = await fetch(`${BACKEND_URL}/api/upload/avatar/work`, {
			method: 'POST',
			body: backendFormData,
		})

		if (!response.ok) {
			const error = await response.json()
			return NextResponse.json(error, { status: response.status })
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error uploading avatar:', error)
		return NextResponse.json(
			{ error: 'Failed to upload avatar' },
			{ status: 500 },
		)
	}
}
