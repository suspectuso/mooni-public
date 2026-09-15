import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId =
			searchParams.get('userId') || request.headers.get('x-telegram-user-id')

		if (!userId) {
			return NextResponse.json({ error: 'User ID required' }, { status: 400 })
		}

		console.log('[Favorites API] Fetching favorites for user:', userId)

		const response = await fetch(
			`${BACKEND_URL}/api/radar/favorites?userId=${userId}`,
		)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[Favorites API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to fetch favorites', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[Favorites API] Fetched favorites:', data.length)
		return NextResponse.json(data)
	} catch (error) {
		console.error('[Favorites API] Error fetching favorites:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch favorites' },
			{ status: 500 },
		)
	}
}
