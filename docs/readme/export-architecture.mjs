#!/usr/bin/env node
/**
 * Exports the README architecture diagram in the bhel colour tokens.
 *
 * Archify (https://github.com/tt-a1i/archify) renders architecture.json into a
 * standalone HTML viewer. This script copies architecture.json to a temporary
 * directory with the `meta.output` field that `archify deliver` requires, runs
 * `deliver`, restyles the viewer with the apps/web/src/app/globals.css tokens,
 * and saves the viewer's own SVG export once per colour scheme.
 *
 * Archify's export resolves every theme variable with getComputedStyle and
 * copies page rules whose selector starts with `svg` or `[data-theme`, so the
 * token overrides below reach the SVG. GitHub's <picture> needs one file per
 * theme, so each export gets data-theme on its root <svg>. The web app has no
 * dark theme; the dark export swaps its background and foreground tokens.
 *
 * Inputs:
 *   - docs/readme/architecture.json, the archify source (committed without meta.output)
 *   - the archify CLI, bin/archify.mjs from an archify checkout or skill install (v3.0)
 *   - Playwright: `bun add --no-save playwright-core`, or set PLAYWRIGHT to an installed copy
 *
 * Re-run, from the repository root:
 *   node docs/readme/export-architecture.mjs <archify>/bin/archify.mjs
 *
 * Uses the installed Google Chrome.
 *
 * Writes: architecture-light.svg and architecture-dark.svg beside this file.
 */

import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const README_DIR = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(path.join(process.cwd(), 'package.json'))
const { chromium } = require(process.env.PLAYWRIGHT ?? 'playwright-core')

// apps/web/src/app/globals.css tokens mapped onto Archify's theme variables.
const THEMES = {
  light: {
    '--bg': '#F5F5F7', // --background
    '--mask': '#F5F5F7', // --background
    '--panel': '#FFFFFF', // --surface
    '--text': '#1D1D1F', // --foreground
    '--text-muted': '#86868B', // --foreground-secondary
    '--arrow-emphasis': '#1D1D1F', // --foreground
    '--frontend-fill': 'rgba(0, 102, 204, 0.08)', // --accent
    '--frontend-stroke': '#0066CC' // --accent
  },
  dark: {
    '--bg': '#1D1D1F', // --foreground
    '--mask': '#1D1D1F', // --foreground
    '--text': '#F5F5F7', // --background
    '--text-muted': '#86868B', // --foreground-secondary
    '--arrow-emphasis': '#F5F5F7', // --background
    '--frontend-fill': 'rgba(0, 113, 227, 0.16)', // --accent-hover
    '--frontend-stroke': '#0071E3' // --accent-hover
  }
}

const declarations = (vars) =>
  Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join(' ')

const tokenCss = [
  `[data-theme="dark"] { ${declarations(THEMES.dark)} }`,
  `[data-theme="light"] { ${declarations(THEMES.light)} }`
].join('\n')

function restyle(html) {
  if (!html.includes('id="archify-fonts"'))
    throw new Error('No #archify-fonts style element: is this an Archify HTML file?')
  return html.replace('</head>', `<style id="bhel-tokens">\n${tokenCss}\n</style>\n</head>`)
}

async function exportSvg(browser, pageUrl, colorScheme, outFile) {
  const context = await browser.newContext({
    colorScheme,
    acceptDownloads: true,
    viewport: { width: 1440, height: 900 }
  })
  const page = await context.newPage()
  await page.goto(pageUrl)
  await page.evaluate(() => document.fonts.ready)
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  if (theme !== colorScheme) throw new Error(`Viewer opened in ${theme} theme, expected ${colorScheme}`)

  await page.click('#btn-export')
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#export-menu [data-format="svg"]')])
  const svg = fs.readFileSync(await download.path(), 'utf8')
  const locked = svg.replace(/<svg\b/, `<svg data-theme="${colorScheme}"`)
  if (locked === svg) throw new Error('No <svg> root element in the export')
  fs.writeFileSync(outFile, locked.replace(/[ \t]+$/gm, '').replace(/\n*$/, '\n'))
  await context.close()
}

const archify = process.argv[2]
if (!archify || !fs.existsSync(archify)) {
  console.error('Usage: node docs/readme/export-architecture.mjs <archify>/bin/archify.mjs')
  process.exit(2)
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bhel-architecture-'))
try {
  const source = JSON.parse(fs.readFileSync(path.join(README_DIR, 'architecture.json'), 'utf8'))
  source.meta.output = 'architecture.html'
  const input = path.join(workDir, 'architecture.json')
  const delivered = path.join(workDir, 'architecture.html')
  fs.writeFileSync(input, JSON.stringify(source, null, 2))
  execFileSync(
    process.execPath,
    [archify, 'deliver', 'architecture', input, delivered, '--quality', source.meta.quality_profile ?? 'standard'],
    { stdio: 'inherit' }
  )

  const styled = path.join(workDir, 'architecture-styled.html')
  fs.writeFileSync(styled, restyle(fs.readFileSync(delivered, 'utf8')))

  const browser = await chromium.launch({ channel: 'chrome' })
  try {
    for (const scheme of ['light', 'dark']) {
      const outFile = path.join(README_DIR, `architecture-${scheme}.svg`)
      await exportSvg(browser, `file://${styled}`, scheme, outFile)
      console.log(`wrote ${path.relative(process.cwd(), outFile)}`)
    }
  } finally {
    await browser.close()
  }
} finally {
  fs.rmSync(workDir, { recursive: true, force: true })
}
