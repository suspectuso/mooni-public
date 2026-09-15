import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const initData = request.headers.get('x-telegram-init-data')
		const userId = request.headers.get('x-telegram-user-id')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		console.log('[my-projects API] GET request:', {
			userId,
			userIdType: typeof userId,
		})

		const url = new URL(`${backendUrl}/api/radar/my-projects`)
		if (userId) {
			url.searchParams.append('userId', userId)
		}

		console.log('[my-projects API] Fetching from:', url.toString())

		const response = await fetch(url.toString(), {
			headers: {
				'x-telegram-init-data': initData || '',
			},
		})

		console.log('[my-projects API] Response status:', response.status)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[my-projects API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to fetch my projects', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[my-projects API] Projects fetched:', data.length, 'projects')
		return NextResponse.json(data)
	} catch (error) {
		console.error('[my-projects API] Error:', error)
		return NextResponse.json(
			{ error: 'Internal server error', details: String(error) },
			{ status: 500 },
		)
	}
}
