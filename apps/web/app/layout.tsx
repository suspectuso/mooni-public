import BanChecker from '@/components/BanChecker'
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import TelegramInit from './telegram-init'

export const metadata: Metadata = {
	title: 'МЭТЧ - Экосистема совместного развития',
	description: 'Трекер привычек, спринты, мероприятия и нетворкинг в Telegram',
	appleWebApp: {
		capable: true,
		statusBarStyle: 'black-translucent',
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='ru' suppressHydrationWarning>
			<head>
				<meta name='theme-color' content='#121212' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta
					name='apple-mobile-web-app-status-bar-style'
					content='black-translucent'
				/>
				<meta name='mobile-web-app-capable' content='yes' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
				/>
				<style
					dangerouslySetInnerHTML={{
						__html: `
							html, body {
								touch-action: pan-y pan-x;
								-ms-touch-action: pan-y pan-x;
							}
							img, video, canvas, svg {
								touch-action: none !important;
								-webkit-user-drag: none !important;
								-webkit-touch-callout: none !important;
							}
						`,
					}}
				/>

				{/* Google Fonts */}
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin='anonymous'
				/>
				<link
					href='https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@300;400;500;700;900&display=swap'
					rel='stylesheet'
				/>
				{/* Луми (канон C2): Fredoka — заголовки, Nunito — текст (с кириллицей) */}
				<link
					href='https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap'
					rel='stylesheet'
				/>

				{/* Предзагрузка изображений для модалки мэтча */}
				<link
					rel='preload'
					href='/netw_fire.webp'
					as='image'
					type='image/webp'
				/>
				<link
					rel='preload'
					href='/netw_fire_match.webp'
					as='image'
					type='image/webp'
				/>

				<Script
					src='https://telegram.org/js/telegram-web-app.js'
					strategy='beforeInteractive'
				/>
			</head>
			<body className='antialiased' suppressHydrationWarning>
				<TelegramInit />
				<BanChecker />
				<div style={{ paddingTop: 'var(--tg-safe-top, 0px)' }}>
					{children}
				</div>
			</body>
		</html>
	)
}
