import { NextResponse } from 'next/server'

export async function GET() {
	try {
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
		const response = await fetch(`${backendUrl}/api/events/upcoming`, {
			cache: 'no-store',
		})

		if (!response.ok) {
			return NextResponse.json([])
		}

		const events = await response.json()
		return NextResponse.json(events)
	} catch (error) {
		console.error('Error fetching upcoming events:', error)
		return NextResponse.json([])
	}
}
