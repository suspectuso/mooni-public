'use client'

import { useEffect, useRef } from 'react'

/**
 * Live2D-сцена проводника «Муни». Грузит pixi + pixi-live2d-display + Cubism Core (client-only,
 * динамический импорт) и рендерит модель .moc3 на канвасе. Любая ошибка (нет WebGL, CDN недоступен)
 * → onError, и GuideAvatar показывает SVG-фолбэк. Модель — официальный бесплатный сэмпл Live2D.
 */

declare global {
	interface Window {
		PIXI?: unknown
	}
}

const CUBISM_CORE = 'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js'

function loadScript(src: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (document.querySelector(`script[src="${src}"]`)) return resolve()
		const s = document.createElement('script')
		s.src = src
		s.async = true
		s.onload = () => resolve()
		s.onerror = () => reject(new Error(`не загрузился ${src}`))
		document.head.appendChild(s)
	})
}

export default function Live2DStage({
	model,
	size = 96,
	talking = false,
	onError,
}: {
	model: string
	size?: number
	talking?: boolean
	onError?: () => void
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const modelRef = useRef<any>(null)
	const talkingRef = useRef(talking)
	talkingRef.current = talking

	useEffect(() => {
		let destroyed = false
		let app: any = null
		let raf = 0

		;(async () => {
			try {
				await loadScript(CUBISM_CORE)
				const PIXI = await import('pixi.js')
				window.PIXI = PIXI
				const { Live2DModel } = await import('pixi-live2d-display/cubism4')
				if (destroyed || !canvasRef.current) return

				app = new PIXI.Application({
					view: canvasRef.current,
					width: size,
					height: size,
					backgroundAlpha: 0,
					antialias: true,
					autoStart: true,
				})

				const m = await Live2DModel.from(model, { autoInteract: false })
				if (destroyed) {
					app.destroy(true)
					return
				}
				app.stage.addChild(m)

				// вписываем модель в квадрат канваса (модели Live2D крупные)
				const scale = (size / m.width) * 1.6
				m.scale.set(scale)
				m.anchor.set(0.5, 0.18)
				m.x = size / 2
				m.y = size / 2
				modelRef.current = m

				// липсинк: пока talking — открываем рот синусоидой
				let t = 0
				const tick = () => {
					if (destroyed) return
					raf = requestAnimationFrame(tick)
					try {
						const open = talkingRef.current ? (Math.sin((t += 0.4)) + 1) / 2 : 0
						const core = m.internalModel.coreModel as {
							setParameterValueById(id: string, value: number): void
						}
						core.setParameterValueById('ParamMouthOpenY', open)
					} catch {
						// у модели может не быть этого параметра — не критично
					}
				}
				raf = requestAnimationFrame(tick)
			} catch {
				onError?.()
			}
		})()

		return () => {
			destroyed = true
			if (raf) cancelAnimationFrame(raf)
			try {
				app?.destroy(true, { children: true })
			} catch {
				// уже уничтожен
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [model, size])

	// реакция модели на внешнее событие: window.dispatchEvent(
	//   new CustomEvent('lumi-react', { detail: { motion: 'Tap', expression: 3 } }))
	useEffect(() => {
		const onReact = (e: Event) => {
			const m = modelRef.current
			if (!m) return
			const d = (e as CustomEvent).detail || {}
			try {
				if (d.motion) m.motion(d.motion)
			} catch {
				// нет такой группы моушенов — не критично
			}
			try {
				if (d.expression != null) m.expression(d.expression)
			} catch {
				// нет такого выражения — не критично
			}
		}
		window.addEventListener('lumi-react', onReact as EventListener)
		return () =>
			window.removeEventListener('lumi-react', onReact as EventListener)
	}, [])

	return (
		<canvas
			ref={canvasRef}
			width={size}
			height={size}
			style={{ width: size, height: size }}
			aria-hidden
		/>
	)
}
