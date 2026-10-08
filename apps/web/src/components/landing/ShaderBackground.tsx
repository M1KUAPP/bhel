'use client'

/**
 * Shader Background Component
 *
 * A full-bleed WebGL canvas that renders a domain-warped noise gradient
 * ("mesh drift"), optionally as a halftone dot grid. The wrapper's CSS
 * gradient shows until WebGL draws, and stays when WebGL is unavailable.
 *
 * The context is created when the section nears the viewport and the main
 * thread is idle, and the shader compiles in parallel where supported. The loop
 * pauses offscreen, in hidden tabs and while `<html data-motion="paused">`,
 * and draws one still frame when the user prefers reduced motion.
 */
import { useEffect, useRef } from 'react'

/** An RGB color with channels from 0 to 1. */
export type ShaderColor = readonly [number, number, number]

interface ShaderBackgroundProps {
  /** Base, mid, highlight and glint colors. */
  colors: readonly [ShaderColor, ShaderColor, ShaderColor, ShaderColor]
  /** Render as a halftone dot grid instead of a smooth gradient. */
  dots?: boolean
  /** Offsets the noise field so two instances don't look alike. */
  seed?: number
  className?: string
}

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scale;
uniform vec2 u_pointer;
uniform vec3 u_colors[4];
uniform float u_dots;
uniform float u_seed;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotate * p;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y) * 1.4;
  p += u_pointer * 0.12;
  float t = u_time * 0.05 + u_seed;

  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 2.8 * q + vec2(1.7, 9.2) + 0.6 * t), fbm(p + 2.8 * q + vec2(8.3, 2.8) - 0.5 * t));
  float f = fbm(p + 2.2 * r);

  vec3 color = mix(u_colors[0], u_colors[1], smoothstep(0.1, 0.6, f));
  color = mix(color, u_colors[2], smoothstep(0.4, 0.85, length(q)));
  color = mix(color, u_colors[3], smoothstep(0.55, 0.85, r.y) * 0.85);
  // A soft light drifting on the right, away from the text column.
  vec2 light = vec2(0.55 + 0.12 * sin(t * 2.0), 0.2 + 0.1 * cos(t * 1.6));
  color += mix(u_colors[2], u_colors[3], 0.5) * exp(-2.2 * length(p - light)) * 0.45 * (0.6 + 0.8 * f);
  // Thin bright folds along the warped field, like light on silk.
  color += u_colors[3] * pow(0.5 + 0.5 * sin(f * 14.0 - t * 6.0), 12.0) * 0.18;

  if (u_dots > 0.5) {
    vec2 cell = fract(gl_FragCoord.xy / (9.0 * u_scale)) - 0.5;
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    float radius = 0.06 + 0.4 * smoothstep(0.08, 0.55, luminance);
    float dotMask = 1.0 - smoothstep(radius - 0.1, radius, length(cell));
    color = mix(u_colors[0], color * 1.2, dotMask);
  }

  color += (hash(gl_FragCoord.xy + fract(u_time) * 97.0) - 0.5) * 0.035;
  gl_FragColor = vec4(color, 1.0);
}
`

/** Device pixels per CSS pixel, capped to keep the noise passes cheap on high-DPI screens. */
const MAX_PIXEL_RATIO = 1.5

/** Minimum milliseconds between frames on touch devices (about 30 fps). */
const COARSE_FRAME_INTERVAL = 33

/** Starts compiling a shader without waiting for the result; the link status reports failures. */
function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return shader
}

/** Runs a callback once the main thread is idle, or soon where idle callbacks don't exist. */
function whenIdle(callback: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1000 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 50)
  return () => clearTimeout(id)
}

/** Whether the device asked to save data or is too weak for continuous WebGL. */
function prefersLightweight(): boolean {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return Boolean(connection?.saveData) || navigator.hardwareConcurrency <= 2
}

/**
 * Animated WebGL background that fills its positioned parent.
 *
 * @param props - Palette, halftone toggle, seed and extra class names
 * @returns A canvas over a CSS gradient fallback
 */
export default function ShaderBackground({ colors, dots = false, seed = 0, className = '' }: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersLightweight()) return

    const root = document.documentElement
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 }
    const startedAt = performance.now()
    let gl: WebGLRenderingContext | null = null
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let uniforms: Record<string, WebGLUniformLocation | null> = {}
    let ready = false
    let frame = 0
    let linkCheck = 0
    let cancelIdle: (() => void) | null = null
    let lastDrawn = 0
    let inView = false

    const seconds = () => (performance.now() - startedAt) / 1000
    const paused = () => !inView || document.hidden || reducedMotion.matches || root.dataset.motion === 'paused'

    /** Uses the linked program: geometry, uniform locations and the fixed uniforms. */
    const finishSetup = (context: WebGLRenderingContext, linked: WebGLProgram) => {
      context.useProgram(linked)

      // One triangle that covers the whole viewport.
      buffer = context.createBuffer()
      context.bindBuffer(context.ARRAY_BUFFER, buffer)
      context.bufferData(context.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), context.STATIC_DRAW)
      const position = context.getAttribLocation(linked, 'a_position')
      context.enableVertexAttribArray(position)
      context.vertexAttribPointer(position, 2, context.FLOAT, false, 0, 0)

      uniforms = Object.fromEntries(
        ['u_resolution', 'u_time', 'u_scale', 'u_pointer', 'u_colors', 'u_dots', 'u_seed'].map((name) => [
          name,
          context.getUniformLocation(linked, name)
        ])
      )
      context.uniform3fv(uniforms.u_colors, colors.flat())
      context.uniform1f(uniforms.u_dots, dots ? 1 : 0)
      context.uniform1f(uniforms.u_seed, seed)
    }

    /** Compiles and links off the critical path, then draws the first frame. */
    const setup = () => {
      cancelIdle = null
      gl ??= canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
      if (!gl) return
      const context = gl
      const parallel = context.getExtension('KHR_parallel_shader_compile')
      const vertex = compile(context, context.VERTEX_SHADER, VERTEX_SHADER)
      const fragment = compile(context, context.FRAGMENT_SHADER, FRAGMENT_SHADER)
      const linked = context.createProgram()
      if (!vertex || !fragment || !linked) return
      context.attachShader(linked, vertex)
      context.attachShader(linked, fragment)
      context.linkProgram(linked)
      context.deleteShader(vertex)
      context.deleteShader(fragment)
      program = linked

      // Reading LINK_STATUS blocks until compilation ends, so poll for completion first.
      const awaitLink = () => {
        linkCheck = 0
        if (program !== linked) return
        if (parallel && !context.getProgramParameter(linked, parallel.COMPLETION_STATUS_KHR)) {
          linkCheck = requestAnimationFrame(awaitLink)
          return
        }
        if (!context.getProgramParameter(linked, context.LINK_STATUS)) return
        finishSetup(context, linked)
        ready = true
        resize()
        draw()
        update()
      }
      awaitLink()
    }

    const requestSetup = () => {
      if (program || cancelIdle) return
      cancelIdle = whenIdle(setup)
    }

    const resize = () => {
      if (!gl || !ready) return
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uniforms.u_resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.u_scale, ratio)
    }

    const draw = () => {
      if (!gl || !ready) return
      pointer.x += (pointer.targetX - pointer.x) * 0.04
      pointer.y += (pointer.targetY - pointer.y) * 0.04
      gl.uniform1f(uniforms.u_time, seconds())
      gl.uniform2f(uniforms.u_pointer, pointer.x, pointer.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = (timestamp: number) => {
      if (paused()) {
        frame = 0
        return
      }
      frame = requestAnimationFrame(loop)
      if (coarsePointer.matches && timestamp - lastDrawn < COARSE_FRAME_INTERVAL) return
      lastDrawn = timestamp
      draw()
    }

    /** Starts the loop, or leaves one still frame when motion is off. */
    const update = () => {
      if (!ready) return
      if (!paused()) {
        if (!frame) frame = requestAnimationFrame(loop)
        return
      }
      cancelAnimationFrame(frame)
      frame = 0
      draw()
    }

    const onResize = () => {
      resize()
      if (!frame) draw()
    }

    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = (event.clientX / window.innerWidth) * 2 - 1
      pointer.targetY = 1 - (event.clientY / window.innerHeight) * 2
    }

    const onContextLost = (event: Event) => {
      event.preventDefault()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(linkCheck)
      frame = 0
      ready = false
      program = null
    }

    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        if (inView) requestSetup()
        update()
      },
      { rootMargin: '200px 0px' }
    )
    const resizeObserver = new ResizeObserver(onResize)
    const motionObserver = new MutationObserver(update)

    viewObserver.observe(canvas)
    resizeObserver.observe(canvas)
    motionObserver.observe(root, { attributes: true, attributeFilter: ['data-motion'] })
    document.addEventListener('visibilitychange', update)
    reducedMotion.addEventListener('change', update)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', requestSetup)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(linkCheck)
      cancelIdle?.()
      viewObserver.disconnect()
      resizeObserver.disconnect()
      motionObserver.disconnect()
      document.removeEventListener('visibilitychange', update)
      reducedMotion.removeEventListener('change', update)
      window.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', requestSetup)
      // Free the program but keep the context: React's development remount reuses this canvas.
      gl?.deleteBuffer(buffer)
      gl?.deleteProgram(program)
    }
  }, [colors, dots, seed])

  const [base, mid, highlight] = colors.map(([r, g, b]) => `rgb(${r * 255} ${g * 255} ${b * 255})`)

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: `radial-gradient(120% 90% at 70% 20%, ${highlight}, ${mid} 45%, ${base} 85%)` }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
