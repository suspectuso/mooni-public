import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL =
	process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: pathArray } = await params
	const path = pathArray.join('/')
	const searchParams = request.nextUrl.searchParams.toString()
	const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`

	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-telegram-user-id': request.headers.get('x-telegram-user-id') || '',
			},
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch from backend' },
			{ status: 500 },
		)
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: pathArray } = await params
	const path = pathArray.join('/')
	const searchParams = request.nextUrl.searchParams.toString()
	const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`

	let body = null
	try {
		const text = await request.text()
		if (text) {
			body = JSON.parse(text)
		}
	} catch (_e) {
		// No body or invalid JSON, that's ok for some endpoints
	}

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-telegram-user-id': request.headers.get('x-telegram-user-id') || '',
			},
			body: body ? JSON.stringify(body) : undefined,
		})

		// Check if response has content
		const text = await response.text()
		let data
		try {
			data = text ? JSON.parse(text) : {}
		} catch (_e) {
			data = { message: text || 'Success' }
		}

		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch from backend' },
			{ status: 500 },
		)
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: pathArray } = await params
	const path = pathArray.join('/')
	const searchParams = request.nextUrl.searchParams.toString()
	const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`
	const body = await request.json()

	try {
		const response = await fetch(url, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				'x-telegram-user-id': request.headers.get('x-telegram-user-id') || '',
			},
			body: JSON.stringify(body),
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch from backend' },
			{ status: 500 },
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	const { path: pathArray } = await params
	const path = pathArray.join('/')
	const searchParams = request.nextUrl.searchParams.toString()
	const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`

	try {
		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'x-telegram-user-id': request.headers.get('x-telegram-user-id') || '',
			},
		})

		const data = await response.json()
		return NextResponse.json(data, { status: response.status })
	} catch (error) {
		console.error('Proxy error:', error)
		return NextResponse.json(
			{ error: 'Failed to fetch from backend' },
			{ status: 500 },
		)
	}
}
