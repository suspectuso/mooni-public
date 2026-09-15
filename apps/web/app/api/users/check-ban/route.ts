import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
	process.env.BACKEND_URL ||
	process.env.NEXT_PUBLIC_BACKEND_URL ||
	'http://localhost:3001'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const userId = searchParams.get('userId')

		console.log('[check-ban] Checking ban for userId:', userId)
		console.log('[check-ban] BACKEND_URL:', BACKEND_URL)

		if (!userId) {
			return NextResponse.json(
				{ error: 'User ID is required' },
				{ status: 400 },
			)
		}

		const url = `${BACKEND_URL}/api/users/telegram/${userId}/check-ban`
		console.log('[check-ban] Fetching:', url)

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		console.log('[check-ban] Response status:', response.status)

		if (!response.ok) {
			const errorData = await response.json()
			console.error('[check-ban] Error response:', errorData)
			return NextResponse.json(errorData, { status: response.status })
		}

		const data = await response.json()
		console.log('[check-ban] Success response:', data)
		return NextResponse.json(data)
	} catch (error) {
		console.error('[check-ban] Error checking ban status:', error)
		return NextResponse.json(
			{ error: 'Failed to check ban status' },
			{ status: 500 },
		)
	}
}
