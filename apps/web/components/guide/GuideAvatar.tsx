'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const Live2DStage = dynamic(() => import('./Live2DStage'), { ssr: false })

// Готовая модель — официальный бесплатный сэмпл Live2D «Haru» (Free Material License),
// грузится с CDN. Переопределяется своим .moc3 через NEXT_PUBLIC_LIVE2D_MODEL.
const LIVE2D_MODEL =
	process.env.NEXT_PUBLIC_LIVE2D_MODEL ||
	'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/test/assets/haru/haru_greeter_t03.model3.json'

/**
 * Аватар проводника «Муни». По умолчанию рендерит Live2D-модель (pixi-live2d-display); если
 * Live2D не завёлся (нет WebGL, CDN недоступен) — graceful-фолбэк на анимированный SVG.
 * Интерфейс (props talking/size) общий для обоих режимов.
 */
export default function GuideAvatar({
	talking = false,
	size = 96,
}: {
	talking?: boolean
	size?: number
}) {
	const [live2dFailed, setLive2dFailed] = useState(false)

	if (LIVE2D_MODEL && !live2dFailed) {
		return (
			<div className="mooni-guide" style={{ width: size, height: size }}>
				<Live2DStage
					model={LIVE2D_MODEL}
					size={size}
					talking={talking}
					onError={() => setLive2dFailed(true)}
				/>
				<style jsx>{`
					.mooni-guide {
						animation: mooni-bob 3.2s ease-in-out infinite;
					}
					@keyframes mooni-bob {
						0%,
						100% {
							transform: translateY(0);
						}
						50% {
							transform: translateY(-4px);
						}
					}
				`}</style>
			</div>
		)
	}

	return (
		<div
			className="mooni-guide"
			style={{ width: size, height: size }}
			aria-hidden
		>
			<svg viewBox="0 0 100 100" width={size} height={size}>
				{/* голова */}
				<circle cx="50" cy="52" r="34" fill="#272727" stroke="#65FFF7" strokeWidth="2" />
				{/* щёки-блики */}
				<circle cx="34" cy="60" r="5" fill="rgba(101,255,247,0.18)" />
				<circle cx="66" cy="60" r="5" fill="rgba(101,255,247,0.18)" />
				{/* глаза (моргают через scaleY) */}
				<g className="mooni-eyes" fill="#FCF9F7">
					<ellipse cx="40" cy="48" rx="4.5" ry="6" />
					<ellipse cx="60" cy="48" rx="4.5" ry="6" />
				</g>
				{/* рот: молчит — линия, говорит — открыт */}
				<g className={talking ? 'mooni-mouth talking' : 'mooni-mouth'}>
					<ellipse cx="50" cy="66" rx="7" ry="5" fill="#F7710B" />
				</g>
				{/* антенка-огонёк (как у тамагочи/витубера) */}
				<line x1="50" y1="18" x2="50" y2="9" stroke="#65FFF7" strokeWidth="2" />
				<circle cx="50" cy="7" r="3" fill="#65FFF7" className="mooni-spark" />
			</svg>

			<style jsx>{`
				.mooni-guide {
					animation: mooni-bob 3.2s ease-in-out infinite;
				}
				:global(.mooni-eyes) {
					transform-box: fill-box;
					transform-origin: center;
					animation: mooni-blink 4.5s infinite;
				}
				:global(.mooni-mouth) {
					transform-box: fill-box;
					transform-origin: center;
				}
				:global(.mooni-mouth.talking) {
					animation: mooni-talk 0.28s ease-in-out infinite;
				}
				:global(.mooni-spark) {
					animation: mooni-pulse 1.8s ease-in-out infinite;
				}
				@keyframes mooni-bob {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-4px); }
				}
				@keyframes mooni-blink {
					0%, 92%, 100% { transform: scaleY(1); }
					96% { transform: scaleY(0.1); }
				}
				@keyframes mooni-talk {
					0%, 100% { transform: scaleY(0.4); }
					50% { transform: scaleY(1.1); }
				}
				@keyframes mooni-pulse {
					0%, 100% { opacity: 0.5; }
					50% { opacity: 1; }
				}
			`}</style>
		</div>
	)
}
