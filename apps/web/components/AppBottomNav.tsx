'use client'

import Link from 'next/link'
import { Home, Map as MapIcon, Ticket, UsersRound, User } from 'lucide-react'
import { T, bottomNav } from '../app/home.styles'

/**
 * Нижнее меню Луми (канон C2) — единый компонент для всех разделов.
 * Плавающая белая пилюля-стекло как на главной. active подсвечивает текущий раздел.
 */

export type NavKey = 'home' | 'map' | 'experiences' | 'community' | 'profile'

const ITEMS: { key: NavKey; label: string; Icon: typeof Home; href: string }[] = [
	{ key: 'home', label: 'Главная', Icon: Home, href: '/' },
	{ key: 'map', label: 'Карта', Icon: MapIcon, href: '/map' },
	{ key: 'experiences', label: 'Впечатления', Icon: Ticket, href: '/education' },
	{ key: 'community', label: 'Сообщество', Icon: UsersRound, href: '/coffee' },
	{ key: 'profile', label: 'Профиль', Icon: User, href: '/tracker/profile' },
]

export default function AppBottomNav({ active }: { active: NavKey }) {
	return (
		<nav style={bottomNav}>
			{ITEMS.map(({ key, label, Icon, href }) => {
				const on = key === active
				const c = on ? T.tealDeep : '#9aa0a6'
				const slot: React.CSSProperties = {
					flex: 1,
					minWidth: 0,
					display: 'flex',
					textDecoration: 'none',
				}
				return (
					<Link key={key} href={href} style={slot} aria-current={on ? 'page' : undefined}>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								gap: 4,
								minHeight: 52,
								width: '100%',
								minWidth: 0,
							}}
						>
							<Icon size={22} color={c} strokeWidth={2.5} />
							<span
								style={{
									fontSize: 9.5,
									fontWeight: 700,
									color: c,
									lineHeight: 1,
									whiteSpace: 'nowrap',
									maxWidth: '100%',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									fontFamily: T.body,
								}}
							>
								{label}
							</span>
						</div>
					</Link>
				)
			})}
		</nav>
	)
}
