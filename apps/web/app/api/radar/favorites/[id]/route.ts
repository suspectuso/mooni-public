import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const userId = request.headers.get('x-telegram-user-id')
		const { id } = await params

		if (!userId) {
			return NextResponse.json({ error: 'User ID required' }, { status: 400 })
		}

		console.log('[Favorites API] Adding favorite:', { projectId: id, userId })

		const response = await fetch(
			`${BACKEND_URL}/api/radar/favorites/${id}?userId=${userId}`,
			{
				method: 'POST',
			},
		)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[Favorites API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to add favorite', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[Favorites API] Favorite added successfully')
		return NextResponse.json(data)
	} catch (error) {
		console.error('[Favorites API] Error adding favorite:', error)
		return NextResponse.json(
			{ error: 'Failed to add favorite' },
			{ status: 500 },
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const userId = request.headers.get('x-telegram-user-id')
		const { id } = await params

		if (!userId) {
			return NextResponse.json({ error: 'User ID required' }, { status: 400 })
		}

		console.log('[Favorites API] Removing favorite:', { projectId: id, userId })

		const response = await fetch(
			`${BACKEND_URL}/api/radar/favorites/${id}?userId=${userId}`,
			{
				method: 'DELETE',
			},
		)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[Favorites API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to remove favorite', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[Favorites API] Favorite removed successfully')
		return NextResponse.json(data)
	} catch (error) {
		console.error('[Favorites API] Error removing favorite:', error)
		return NextResponse.json(
			{ error: 'Failed to remove favorite' },
			{ status: 500 },
		)
	}
}
