import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData()
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

		const response = await fetch(`${backendUrl}/api/upload/radar/avatar`, {
			method: 'POST',
			body: formData,
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[API] Backend error:', errorText)
			throw new Error('Upload failed')
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error uploading radar avatar:', error)
		return NextResponse.json(
			{ error: 'Failed to upload avatar' },
			{ status: 500 },
		)
	}
}
