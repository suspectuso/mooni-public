import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
	try {
		const { fileUrl } = await request.json()

		if (!fileUrl) {
			return NextResponse.json(
				{ error: 'File URL is required' },
				{ status: 400 },
			)
		}

		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		console.log('[Delete API] Deleting file:', fileUrl)

		const response = await fetch(`${backendUrl}/api/upload/delete`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ fileUrl }),
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[Delete API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to delete file', details: errorText },
				{ status: response.status },
			)
		}

		console.log('[Delete API] File deleted successfully')
		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('[Delete API] Error:', error)
		return NextResponse.json(
			{ error: 'Internal server error', details: String(error) },
			{ status: 500 },
		)
	}
}
