'use client'

/**
 * Shader Background Component
 *
 * A full-bleed WebGL canvas that renders komorebi: round spots of sunlight
 * falling through swaying leaves onto a shaded wall. The wrapper's CSS
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
  /** Shade, mid shade, light and highlight colors. */
  colors: readonly [ShaderColor, ShaderColor, ShaderColor, ShaderColor]
  /** Offsets the canopy so two instances don't look alike. */
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
uniform vec2 u_pointer;
uniform vec3 u_colors[4];
uniform float u_seed;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i).x, hash2(i + vec2(1.0, 0.0)).x, u.x), mix(hash2(i + vec2(0.0, 1.0)).x, hash2(i + vec2(1.0, 1.0)).x, u.x), u.y);
}

mat2 rotate(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

// Coverage of one leaf in its own frame: x runs along the leaf, which tapers to a point at both ends.
float leaf(vec2 p, float blur) {
  float x = clamp(p.x, -1.0, 1.0);
  float halfWidth = 0.42 * (1.0 - x * x) * (1.0 + 0.3 * x);
  float d = max(abs(p.y) - halfWidth, (abs(p.x) - 1.0) * 0.5);
  return 1.0 - smoothstep(-blur, blur, d);
}

// One layer of leaves on a jittered grid. Every leaf flutters about its own stem.
float canopy(vec2 p, float t, float seed, float blur) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  float cover = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 offset = vec2(float(i), float(j));
      vec2 h = hash2(cell + offset + seed);
      vec2 center = offset + 0.5 + (h - 0.5) * 0.6;
      float angle = h.x * 6.2831 + 0.22 * sin(t * (0.6 + 0.5 * h.y) + h.x * 12.0);
      float size = 0.48 + 0.24 * h.y;
      vec2 q = rotate(angle) * (local - center) / size;
      cover = max(cover, leaf(q, blur / size));
    }
  }
  return cover;
}

// Round spots of sun on a jittered grid: each gap in the canopy projects a soft image of the sun.
// Spots drift as the branches sway, flicker as leaves pass and fade as gaps open and close.
float dapples(vec2 p, float t, float seed, float softness) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  float light = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 offset = vec2(float(i), float(j));
      vec2 id = cell + offset;
      vec2 h = hash2(id + seed);
      vec2 k = hash2(id + seed + 19.0);
      vec2 sway = 0.1 * vec2(sin(t * (0.45 + 0.5 * k.x) + h.y * 6.2831), cos(t * (0.35 + 0.5 * k.y) + h.x * 6.2831));
      vec2 d = local - (offset + 0.5 + (h - 0.5) * 0.7 + sway);
      d.x *= 0.82;
      float radius = 0.14 + 0.2 * k.x;
      float spot = 1.0 - smoothstep(radius - softness, radius + softness, length(d));
      float open = smoothstep(0.22, 0.6, noise(id * 0.41 + seed + vec2(t * 0.06, 0.0)));
      float flicker = 0.62 + 0.38 * sin(t * (0.7 + 1.3 * k.y) + h.x * 20.0);
      light += spot * open * flicker;
    }
  }
  return min(light, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time + u_seed * 7.0;

  // A slow breeze with gusts; the near leaves move furthest.
  float gust = noise(vec2(t * 0.12, u_seed)) - 0.5;
  vec2 wind = vec2(0.05 * sin(t * 0.31) + 0.14 * gust, 0.035 * cos(t * 0.23));
  vec2 c = rotate(0.42) * p;

  float wash = smoothstep(0.3, 0.95, noise(c * 1.3 + wind + vec2(t * 0.03, 17.0 + u_seed)));
  float large = dapples(c * 2.3 + wind * 1.4 + u_pointer * 0.05, t, 3.0 + u_seed, 0.16);
  float small = dapples(c * 4.6 + wind * 0.9 + u_pointer * 0.03, t * 1.2, 11.0 + u_seed, 0.06);
  float leaves = canopy(c * 1.8 + wind * 2.4 + u_pointer * 0.12 + 5.0, t, 29.0 + u_seed, 0.1);

  // The sun sits off the top right, away from the text column.
  float sun = smoothstep(1.85, 0.0, length(p - vec2(0.58, 0.3)));
  float light = (0.2 * wash + 1.15 * large + 0.75 * small) * (1.0 - 0.85 * leaves) * (0.14 + 1.35 * sun);

  vec3 color = mix(u_colors[0], u_colors[1], 0.55 * sun + 0.2 * uv.y);
  // Leaves in the shade read as darker silhouettes.
  color = mix(color, u_colors[0] * 0.7, leaves * 0.45);
  color = mix(color, u_colors[2], smoothstep(0.03, 0.5, light) * 0.9);
  color = mix(color, u_colors[3], smoothstep(0.38, 0.95, light));
  // Light scatters a little around each spot.
  color += u_colors[2] * smoothstep(0.0, 0.6, light) * 0.1 + u_colors[3] * pow(clamp(light, 0.0, 1.0), 4.0) * 0.16;
  gl_FragColor = vec4(color, 1.0);
}
`

/** Device pixels per CSS pixel. The light is soft, so one pass per CSS pixel keeps the leaf loops cheap. */
const MAX_PIXEL_RATIO = 1

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
 * @param props - Palette, seed and extra class names
 * @returns A canvas over a CSS gradient fallback
 */
export default function ShaderBackground({ colors, seed = 0, className = '' }: ShaderBackgroundProps) {
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
        ['u_resolution', 'u_time', 'u_pointer', 'u_colors', 'u_seed'].map((name) => [
          name,
          context.getUniformLocation(linked, name)
        ])
      )
      context.uniform3fv(uniforms.u_colors, colors.flat())
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
  }, [colors, seed])

  const [base, mid, highlight] = colors.map(([r, g, b]) => `rgb(${r * 255} ${g * 255} ${b * 255})`)

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: `radial-gradient(90% 80% at 80% 15%, ${highlight}, ${mid} 40%, ${base} 85%)` }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
