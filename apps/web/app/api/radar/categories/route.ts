import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const initData = request.headers.get('x-telegram-init-data')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		const response = await fetch(`${backendUrl}/api/radar/categories`, {
			headers: {
				'x-telegram-init-data': initData || '',
			},
		})

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch categories' },
				{ status: response.status },
			)
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error fetching categories:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
