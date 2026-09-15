import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const initData = request.headers.get('x-telegram-init-data')
		const userId = request.headers.get('x-telegram-user-id')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		const url = new URL(`${backendUrl}/api/radar/projects`)
		if (userId) {
			url.searchParams.append('userId', userId)
		}

		console.log('[API] Fetching projects from:', url.toString())

		const response = await fetch(url.toString(), {
			headers: {
				'x-telegram-init-data': initData || '',
			},
		})

		console.log('[API] Response status:', response.status)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to fetch projects', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[API] Projects fetched successfully:', data.length, 'projects')
		return NextResponse.json(data)
	} catch (error) {
		console.error('[API] Error fetching projects:', error)
		return NextResponse.json(
			{ error: 'Internal server error', details: String(error) },
			{ status: 500 },
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const initData = request.headers.get('x-telegram-init-data')
		const userId = request.headers.get('x-telegram-user-id')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
		const body = await request.json()

		console.log('[projects API] POST request:', {
			userId,
			userIdType: typeof userId,
			projectName: body.name,
		})

		const url = new URL(`${backendUrl}/api/radar/projects`)
		if (userId) {
			url.searchParams.append('userId', userId)
		}

		console.log('[projects API] Creating project at:', url.toString())

		const response = await fetch(url.toString(), {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-telegram-init-data': initData || '',
			},
			body: JSON.stringify(body),
		})

		console.log('[projects API] Response status:', response.status)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[projects API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to create project', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[projects API] Project created successfully:', data.id)
		return NextResponse.json(data)
	} catch (error) {
		console.error('[projects API] Error creating project:', error)
		return NextResponse.json(
			{ error: 'Internal server error', details: String(error) },
			{ status: 500 },
		)
	}
}
