import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	try {
		const { userId: telegramId, type } = await request.json()

		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

		const fullUrl = `${backendUrl}/api/subscriptions/create?userId=${telegramId}`

		const response = await fetch(fullUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ type }),
		})

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Backend error response:', errorText)
			try {
				const error = JSON.parse(errorText)
				return NextResponse.json(error, { status: response.status })
			} catch {
				return NextResponse.json(
					{ error: errorText || 'Backend error' },
					{ status: response.status },
				)
			}
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error creating subscription:', error)
		return NextResponse.json(
			{
				error: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		)
	}
}
