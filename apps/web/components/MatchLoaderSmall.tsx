'use client'

import { useEffect, useState } from 'react'

export default function MatchLoaderSmall() {
	const [rotation, setRotation] = useState(0)

	useEffect(() => {
		// Первый поворот через 100ms
		const firstTimeout = setTimeout(() => {
			setRotation(90)
		}, 100)

		// Затем каждые 600ms
		const interval = setInterval(() => {
			setRotation(prev => (prev + 90) % 360)
		}, 600)

		return () => {
			clearTimeout(firstTimeout)
			clearInterval(interval)
		}
	}, [])

	const getLetterPosition = (index: number) => {
		const positions = [
			{ top: 0, left: 0 },
			{ top: 0, left: 1 },
			{ top: 1, left: 1 },
			{ top: 1, left: 0 },
		]

		const rotationSteps = rotation / 90
		const newIndex = (index + rotationSteps) % 4
		return positions[newIndex]
	}

	const letters = [
		// М
		<svg
			width='54'
			height='47'
			viewBox='0 0 107 93'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M62.9944 89.8513L67.3629 76.439L82.2099 33.2651L51.4545 90.3477L29.1957 91.3053L47.1036 32.5936L23.713 78.7805L16.8524 91.8425L0 92.5665L48.5167 0L71.8955 1.00432L66.4246 20.4484L54.744 56.7965L74.2645 19.6951L84.5319 1.55319L106.404 2.49328L77.8121 89.2149L62.9944 89.8513Z'
				fill='#F23318'
			/>
		</svg>,
		// Э
		<svg
			width='51'
			height='43'
			viewBox='0 0 101 86'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M35.6707 85.8262C19.0454 86.5722 6.09711 80.3648 0.561186 68.6727L0 67.4895L13.7492 60.3554L14.4974 62.0398C18.1803 70.3339 27.171 74.8335 38.9736 74.4372C57.1597 73.831 74.8021 62.6227 83.1089 47.1304L38.6404 47.3694L43.0773 36.161L87.1133 36.435C88.5688 29.2542 87.1717 22.8253 83.1031 18.1916C79.128 13.657 72.8789 11.1099 64.9696 10.8476C53.7165 10.4746 41.3002 14.7469 30.9474 22.7029L29.6671 23.6879L21.5766 16.0351L22.9036 15.0675C36.9626 4.78012 53.4418 -0.599638 68.0795 0.0531603C79.9639 0.583559 89.4106 4.82092 94.853 11.9259C100.962 19.8936 101.862 30.7405 97.4252 42.6541C93.1987 54.0023 84.8393 64.5519 73.709 72.4263C62.4091 80.4231 48.923 85.2258 35.6649 85.8203L35.6707 85.8262Z'
				fill='#F23318'
			/>
		</svg>,
		// Т
		<svg
			width='27'
			height='40'
			viewBox='0 0 53 79'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M0 78.7292L25.2926 10.7547L12.5308 10.3509L16.4334 0L52.4861 1.54474L48.8797 11.492L36.7752 11.1116L12.1281 78.2085L0 78.7292Z'
				fill='#F23318'
			/>
		</svg>,
		// Ч
		<svg
			width='23'
			height='38'
			viewBox='0 0 46 75'
			fill='none'
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M9.44556 74.4233L14.9191 58.99C13.7773 59.3206 12.4942 59.5062 11.0758 59.541C7.21496 59.6396 3.97795 58.2882 1.98277 55.7189C-0.200745 52.9118 -0.600955 48.9389 0.882188 44.8442L17.132 0L27.8201 0.458186L11.5231 46.0042C11.1465 47.054 11.2112 48.0283 11.7056 48.6721C12.1235 49.2231 12.8297 49.5073 13.7361 49.4957C16.2668 49.4609 19.0095 47.4831 19.857 45.0936L35.5654 0.794576L45.8061 1.22956L20.3278 73.9709L9.45146 74.4349L9.44556 74.4233Z'
				fill='#F23318'
			/>
		</svg>,
	]

	return (
		<div
			style={{
				position: 'relative',
				width: '60px',
				height: '60px',
			}}
		>
			{letters.map((letter, index) => {
				const pos = getLetterPosition(index)
				return (
					<div
						key={index}
						style={{
							position: 'absolute',
							top: `${pos.top * 30}px`,
							left: `${pos.left * 30}px`,
							width: '30px',
							height: '30px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
						}}
					>
						{letter}
					</div>
				)
			})}
		</div>
	)
}
