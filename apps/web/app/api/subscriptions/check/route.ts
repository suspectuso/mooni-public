import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const userId = searchParams.get('userId')
		const type = searchParams.get('type') || 'NETWORKING_PLUS'

		if (!userId) {
			return NextResponse.json({ error: 'userId is required' }, { status: 400 })
		}

		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

		const response = await fetch(
			`${backendUrl}/api/subscriptions/check?userId=${userId}&type=${type}`,
		)

		if (!response.ok) {
			const error = await response.json()
			return NextResponse.json(error, { status: response.status })
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error checking subscription:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
