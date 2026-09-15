import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const query = searchParams.get('query')

		if (!query) {
			return NextResponse.json([])
		}

		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		const response = await fetch(
			`${backendUrl}/api/users/search?query=${encodeURIComponent(query)}`,
		)

		if (!response.ok) {
			return NextResponse.json([], { status: 200 })
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error searching users:', error)
		return NextResponse.json([], { status: 200 })
	}
}
