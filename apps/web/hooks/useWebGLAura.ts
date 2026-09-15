'use client'

import { useEffect, useRef, useCallback } from 'react'
import { vertexShader, fragmentShader } from '@/lib/auraShaders'

interface UseWebGLAuraProps {
	color: [number, number, number]
	opacity: number
}

function hexToRGB(hex: string): [number, number, number] {
	const r = parseInt(hex.slice(1, 3), 16) / 255
	const g = parseInt(hex.slice(3, 5), 16) / 255
	const b = parseInt(hex.slice(5, 7), 16) / 255
	return [r, g, b]
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
	const shader = gl.createShader(type)
	if (!shader) return null
	gl.shaderSource(shader, source)
	gl.compileShader(shader)
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('Shader compile error:', gl.getShaderInfoLog(shader))
		gl.deleteShader(shader)
		return null
	}
	return shader
}

export function useWebGLAura({ color, opacity }: UseWebGLAuraProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const rafRef = useRef<number>(0)
	const glRef = useRef<WebGLRenderingContext | null>(null)
	const programRef = useRef<WebGLProgram | null>(null)
	const startTimeRef = useRef(0)
	const uniformsRef = useRef<{
		time: WebGLUniformLocation | null
		color: WebGLUniformLocation | null
		resolution: WebGLUniformLocation | null
		opacity: WebGLUniformLocation | null
	}>({ time: null, color: null, resolution: null, opacity: null })
	const supportedRef = useRef(true)

	const resize = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const dpr = Math.min(window.devicePixelRatio || 1, 2)
		const rect = canvas.getBoundingClientRect()
		const w = Math.round(rect.width * dpr)
		const h = Math.round(rect.height * dpr)
		if (canvas.width !== w || canvas.height !== h) {
			canvas.width = w
			canvas.height = h
			glRef.current?.viewport(0, 0, w, h)
		}
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const gl = canvas.getContext('webgl', {
			alpha: true,
			premultipliedAlpha: true,
			antialias: false,
			powerPreference: 'low-power',
		})

		if (!gl) {
			supportedRef.current = false
			return
		}

		glRef.current = gl

		const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
		const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
		if (!vs || !fs) {
			supportedRef.current = false
			return
		}

		const program = gl.createProgram()!
		gl.attachShader(program, vs)
		gl.attachShader(program, fs)
		gl.linkProgram(program)

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Program link error:', gl.getProgramInfoLog(program))
			supportedRef.current = false
			return
		}

		programRef.current = program
		gl.useProgram(program)

		// Fullscreen quad
		const buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			-1, -1, 1, -1, -1, 1,
			-1, 1, 1, -1, 1, 1,
		]), gl.STATIC_DRAW)

		const posLoc = gl.getAttribLocation(program, 'a_position')
		gl.enableVertexAttribArray(posLoc)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

		uniformsRef.current = {
			time: gl.getUniformLocation(program, 'u_time'),
			color: gl.getUniformLocation(program, 'u_color'),
			resolution: gl.getUniformLocation(program, 'u_resolution'),
			opacity: gl.getUniformLocation(program, 'u_opacity'),
		}

		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

		resize()
		startTimeRef.current = performance.now() / 1000

		const render = () => {
			const g = glRef.current
			const p = programRef.current
			const c = canvasRef.current
			if (!g || !p || !c) return

			const now = performance.now() / 1000 - startTimeRef.current

			g.clearColor(0, 0, 0, 0)
			g.clear(g.COLOR_BUFFER_BIT)

			g.uniform1f(uniformsRef.current.time, now)
			g.uniform2f(uniformsRef.current.resolution, c.width, c.height)

			g.drawArrays(g.TRIANGLES, 0, 6)

			rafRef.current = requestAnimationFrame(render)
		}

		rafRef.current = requestAnimationFrame(render)

		const ro = new ResizeObserver(() => resize())
		ro.observe(canvas)

		return () => {
			cancelAnimationFrame(rafRef.current)
			ro.disconnect()
			gl.deleteProgram(program)
			gl.deleteShader(vs)
			gl.deleteShader(fs)
			gl.deleteBuffer(buffer)
			glRef.current = null
			programRef.current = null
		}
	}, [resize])

	useEffect(() => {
		const gl = glRef.current
		if (!gl || !programRef.current) return
		gl.useProgram(programRef.current)
		gl.uniform3f(uniformsRef.current.color, color[0], color[1], color[2])
		gl.uniform1f(uniformsRef.current.opacity, opacity)
	}, [color, opacity])

	return { canvasRef, supported: supportedRef.current }
}

export { hexToRGB }
