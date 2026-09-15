import { NextRequest, NextResponse } from 'next/server'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const initData = request.headers.get('x-telegram-init-data')
		const userId = request.headers.get('x-telegram-user-id')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		const { id: projectId } = await params
		const url = new URL(`${backendUrl}/api/radar/projects/${projectId}`)
		if (userId) {
			url.searchParams.append('userId', userId)
		}

		console.log('[API] Fetching project from:', url.toString())

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
				{ error: 'Failed to fetch project', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[API] Project fetched successfully:', data.id)
		return NextResponse.json(data)
	} catch (error) {
		console.error('[API] Error fetching project:', error)
		return NextResponse.json(
			{ error: 'Internal server error', details: String(error) },
			{ status: 500 },
		)
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const userId = request.headers.get('x-telegram-user-id')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		const { id: projectId } = await params
		const body = await request.json()

		console.log('[projects/[id] API] PATCH request:', {
			projectId,
			userId,
			userIdType: typeof userId,
		})

		const response = await fetch(
			`${backendUrl}/api/radar/projects/${projectId}?userId=${userId}`,
			{
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			},
		)

		console.log('[projects/[id] API] Response status:', response.status)

		if (!response.ok) {
			const errorText = await response.text()
			console.error('[projects/[id] API] Backend error:', errorText)
			return NextResponse.json(
				{ error: 'Failed to update project', details: errorText },
				{ status: response.status },
			)
		}

		const data = await response.json()
		console.log('[projects/[id] API] Project updated successfully')
		return NextResponse.json(data)
	} catch (error) {
		console.error('[projects/[id] API] Error updating project:', error)
		return NextResponse.json(
			{ error: 'Internal server error', details: String(error) },
			{ status: 500 },
		)
	}
}
