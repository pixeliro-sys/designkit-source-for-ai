import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { streamText, PROVIDERS, stripCodeFences } from '../lib/providers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../')

// ─── Skill loaders ────────────────────────────────────────────────────────────

function loadSkill(name) {
  const skillPath = join(ROOT, 'skills', `${name}.md`)
  if (!existsSync(skillPath)) return ''
  return readFileSync(skillPath, 'utf8')
}

// ─── Phase 1: Generate design spec ───────────────────────────────────────────

function buildSpecPrompt(projectDesc, platform, screens, imageFolder) {
  const screenHint = screens?.length
    ? `Screens/pages to generate: ${screens.join(', ')}`
    : `Auto-determine the most important screens/pages for this type of app or site.`

  const imgHint = imageFolder
    ? `Images folder: ${imageFolder} — use real image filenames from this folder. Add onerror fallback to placehold.jp.`
    : `Images folder: null — use https://placehold.jp/{W}x{H}.png for all images.`

  return [
    `Project: ${projectDesc}`,
    `Platform: ${platform}`,
    screenHint,
    imgHint,
    '',
    'Generate the design-spec.json for this project.',
    'Output ONLY the raw JSON object — no markdown fences, no explanation, no commentary.',
    'The JSON must be valid and complete per the autogen-design.md Phase 1 spec.'
  ].join('\n')
}

async function generateSpec(prompt, options) {
  const provider = options.provider || 'anthropic'
  const skill = loadSkill('autogen-design')
  const systemPrompt = [
    skill,
    '---',
    '# Your task: Phase 1 — Generate Design Spec',
    'Output ONLY valid JSON. No markdown. No commentary.'
  ].join('\n\n')

  process.stderr.write('\n[Phase 1] Generating design spec...\n')

  let fullOutput = ''
  await streamText({
    provider,
    systemPrompt,
    userMessage: prompt,
    onText: (text) => {
      process.stderr.write('.')
      fullOutput += text
    }
  })
  process.stderr.write('\n')

  // Strip fences if AI wrapped it anyway
  const cleaned = stripCodeFences(fullOutput).trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract JSON object from the output
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        // ignore
      }
    }
    throw new Error(`Phase 1 output was not valid JSON.\n\nRaw output:\n${cleaned.slice(0, 500)}`)
  }
}

// ─── Phase 2: Generate HTML for each screen ───────────────────────────────────

function buildScreenPrompt(spec, screen) {
  const imageNote = spec.imageFolder
    ? `Use images from: ${spec.imageFolder}/. Use descriptive filenames (e.g. avatar-user.jpg). Add onerror="this.src='https://placehold.jp/{W}x{H}.png'" fallback on each <img>.`
    : `Use https://placehold.jp/{W}x{H}.png for all images (no external images needed).`

  return [
    '# Design Spec',
    '```json',
    JSON.stringify(spec, null, 2),
    '```',
    '',
    '# Screen to generate',
    '```json',
    JSON.stringify(screen, null, 2),
    '```',
    '',
    imageNote,
    '',
    `Generate the complete, self-contained HTML file for "${screen.name}".`,
    'Output ONLY the raw HTML — no markdown fences, no explanation.'
  ].join('\n')
}

async function generateScreen(spec, screen, options) {
  const provider = options.provider || 'anthropic'
  const skillDesign = loadSkill('design')
  const skillAutogen = loadSkill('autogen-design')

  const systemPrompt = [
    skillAutogen,
    '---',
    '# Active Skill: design (HTML output)',
    skillDesign,
    '---',
    '# Your task: Phase 2 — Generate HTML screen',
    'Output ONLY the raw HTML file content. No markdown fences. No explanation.'
  ].join('\n\n')

  const userMessage = buildScreenPrompt(spec, screen)

  let fullOutput = ''
  await streamText({
    provider,
    systemPrompt,
    userMessage,
    onText: (text) => {
      process.stderr.write('.')
      fullOutput += text
    }
  })
  process.stderr.write('\n')

  return stripCodeFences(fullOutput).trim()
}

// ─── Index gallery ─────────────────────────────────────────────────────────────

function generateIndexHtml(spec) {
  const isMobile = spec.platform === 'mobile'
  const frameW = isMobile ? 390 : 1280
  const frameH = isMobile ? 844 : 800

  const cards = spec.screens.map(s => `
    <a class="card" href="${s.file}" target="_blank">
      <div class="frame-wrap">
        <iframe src="${s.file}" width="${frameW}" height="${frameH}" scrolling="no" loading="lazy" title="${s.name}"></iframe>
        <div class="frame-overlay"></div>
      </div>
      <div class="card-label">
        <span class="card-name">${s.name}</span>
        <span class="card-file">${s.file}</span>
      </div>
    </a>`).join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${spec.project} — Design Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: #09090B;
      color: #F1F5F9;
      min-height: 100vh;
      padding: 40px 24px;
      -webkit-font-smoothing: antialiased;
    }
    header {
      max-width: 1200px;
      margin: 0 auto 40px;
    }
    header h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    header p {
      font-size: 14px;
      color: #64748B;
    }
    .meta {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 9999px;
      font-size: 12px;
      color: #94A3B8;
    }
    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${spec.colors?.primary || '#6366F1'};
      display: inline-block;
    }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(${isMobile ? '220px' : '380px'}, 1fr));
      gap: 24px;
    }
    .card {
      display: flex;
      flex-direction: column;
      border-radius: 12px;
      border: 1px solid #1E293B;
      overflow: hidden;
      background: #111827;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      border-color: #334155;
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    .frame-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: ${isMobile ? '390/844' : '16/10'};
      overflow: hidden;
      background: #0F172A;
    }
    .frame-wrap iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: ${frameW}px;
      height: ${frameH}px;
      border: none;
      transform-origin: top left;
    }
    .frame-overlay {
      position: absolute;
      inset: 0;
      cursor: pointer;
    }
    .card-label {
      padding: 12px 16px;
      border-top: 1px solid #1E293B;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .card-name {
      font-size: 13px;
      font-weight: 600;
      color: #F1F5F9;
    }
    .card-file {
      font-size: 11px;
      color: #475569;
      font-family: monospace;
    }
    footer {
      max-width: 1200px;
      margin: 48px auto 0;
      padding-top: 24px;
      border-top: 1px solid #1E293B;
      font-size: 12px;
      color: #334155;
    }
  </style>
</head>
<body>
  <header>
    <h1>${spec.project}</h1>
    <p>${spec.mood || ''}</p>
    <div class="meta">
      <span class="badge"><span class="color-dot"></span> Primary: ${spec.colors?.primary || 'N/A'}</span>
      <span class="badge">Platform: ${spec.platform}</span>
      <span class="badge">${spec.screens.length} screens</span>
      ${spec.typography?.fontFamily ? `<span class="badge">${spec.typography.fontFamily.split(',')[0]}</span>` : ''}
    </div>
  </header>
  <div class="grid">
    ${cards}
  </div>
  <footer>Generated by DesignKit AutoGen &middot; ${new Date().toLocaleDateString()}</footer>
  <script>
    function scaleFrames() {
      document.querySelectorAll('.frame-wrap').forEach(wrap => {
        const iframe = wrap.querySelector('iframe')
        const w = wrap.offsetWidth
        if (iframe && w > 0) iframe.style.transform = 'scale(' + (w / ${frameW}) + ')'
      })
    }
    window.addEventListener('resize', scaleFrames)
    window.addEventListener('load', scaleFrames)
    requestAnimationFrame(scaleFrames)
  </script>
</body>
</html>`
}

// ─── Main command ──────────────────────────────────────────────────────────────

export async function autogenCommand(projectDesc, options) {
  const provider = options.provider || 'anthropic'
  const platform = options.platform || 'mobile'
  const outputDir = resolve(options.output || `output/${projectDesc.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)
  const imageFolder = options.images || null
  const screens = options.screens
    ? options.screens.split(',').map(s => s.trim()).filter(Boolean)
    : []

  // Validate provider
  if (!Object.keys(PROVIDERS).includes(provider)) {
    console.error(`Error: Unknown provider "${provider}". Available: ${Object.keys(PROVIDERS).join(', ')}`)
    process.exit(1)
  }

  console.error(`\nDesignKit AutoGen`)
  console.error(`─────────────────────────────────────`)
  console.error(`Project:  ${projectDesc}`)
  console.error(`Platform: ${platform}`)
  console.error(`Provider: ${PROVIDERS[provider].label}`)
  console.error(`Output:   ${outputDir}`)
  if (screens.length) console.error(`Screens:  ${screens.join(', ')}`)
  if (imageFolder) console.error(`Images:   ${imageFolder}`)
  console.error(`─────────────────────────────────────\n`)

  // Ensure output dir exists
  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  // ── Phase 1: Design Spec ────────────────────────────────────────────────────
  const specPrompt = buildSpecPrompt(projectDesc, platform, screens, imageFolder)
  let spec

  try {
    spec = await generateSpec(specPrompt, options)
  } catch (err) {
    console.error(`\nError in Phase 1 (spec generation):\n${err.message}`)
    process.exit(1)
  }

  // Inject imageFolder into spec if provided
  if (imageFolder) spec.imageFolder = imageFolder

  // Save spec
  const specPath = join(outputDir, 'design-spec.json')
  writeFileSync(specPath, JSON.stringify(spec, null, 2), 'utf8')
  console.error(`✓ design-spec.json (${spec.screens?.length || 0} screens, primary: ${spec.colors?.primary || 'N/A'})`)

  if (!spec.screens?.length) {
    console.error('Error: Spec has no screens. Aborting.')
    process.exit(1)
  }

  // ── Phase 2: Generate HTML per screen ──────────────────────────────────────
  const generated = []
  let failed = 0

  for (let i = 0; i < spec.screens.length; i++) {
    const screen = spec.screens[i]
    const screenFile = screen.file || `${screen.id || `screen-${i + 1}`}.html`
    const screenPath = join(outputDir, screenFile)

    process.stderr.write(`[Phase 2 — ${i + 1}/${spec.screens.length}] ${screen.name}... `)

    try {
      const html = await generateScreen(spec, screen, options)
      writeFileSync(screenPath, html, 'utf8')
      console.error(`✓ ${screenFile}`)
      generated.push({ ...screen, file: screenFile })
    } catch (err) {
      console.error(`✗ FAILED: ${err.message}`)
      failed++
    }
  }

  // ── Index gallery ────────────────────────────────────────────────────────────
  // Update spec with actually-generated screens
  const finalSpec = { ...spec, screens: generated }
  const indexHtml = generateIndexHtml(finalSpec)
  const indexPath = join(outputDir, 'index.html')
  writeFileSync(indexPath, indexHtml, 'utf8')
  console.error(`✓ index.html (preview gallery)`)

  // ── Summary ──────────────────────────────────────────────────────────────────
  console.error(`\n─────────────────────────────────────`)
  console.error(`Done! ${generated.length} screens generated${failed ? `, ${failed} failed` : ''}.`)
  console.error(`Output: ${outputDir}`)
  console.error(`\nOpen in browser:`)
  console.error(`  open ${join(outputDir, 'index.html')}`)
  console.error(`─────────────────────────────────────\n`)
}
