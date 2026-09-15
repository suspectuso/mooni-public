/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		unoptimized: true,
		remotePatterns: [{ protocol: 'https', hostname: '**' }],
	},
	// Прокси API на бэкенд Mooni (в проде /api всё равно перехватывает nginx → :8001).
	async rewrites() {
		const BACKEND_URL =
			process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'
		return [
			{
				source: '/api/:path*',
				destination: `${BACKEND_URL}/api/:path*`,
			},
		]
	},
}

module.exports = nextConfig
