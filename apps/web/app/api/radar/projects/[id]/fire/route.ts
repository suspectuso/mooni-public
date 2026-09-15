import { NextRequest, NextResponse } from 'next/server'

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params
		const initData = request.headers.get('x-telegram-init-data')
		const userId = request.headers.get('x-telegram-user-id')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		const response = await fetch(
			`${backendUrl}/api/radar/projects/${id}/fire?userId=${userId || 'test_user'}`,
			{
				method: 'POST',
				headers: {
					'x-telegram-init-data': initData || '',
				},
			},
		)

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to add fire' },
				{ status: response.status },
			)
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error adding fire:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params
		const initData = request.headers.get('x-telegram-init-data')
		const userId = request.headers.get('x-telegram-user-id')
		const backendUrl =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

		const response = await fetch(
			`${backendUrl}/api/radar/projects/${id}/fire?userId=${userId || 'test_user'}`,
			{
				method: 'DELETE',
				headers: {
					'x-telegram-init-data': initData || '',
				},
			},
		)

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to remove fire' },
				{ status: response.status },
			)
		}

		const data = await response.json()
		return NextResponse.json(data)
	} catch (error) {
		console.error('Error removing fire:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 },
		)
	}
}
