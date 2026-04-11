import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { streamText, PROVIDERS, stripCodeFences } from '../lib/providers.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../')

function loadSkill(name) {
  const p = join(ROOT, 'skills', `${name}.md`)
  if (!existsSync(p)) return ''
  return readFileSync(p, 'utf8')
}

function readFile(p) {
  if (!existsSync(p)) return null
  return readFileSync(p, 'utf8')
}

// ─── Phase 1: Spec ───────────────────────────────────────────────────────────

export async function phase1_spec(projectDesc, platform, screens, imageFolder, provider, onText) {
  const screenHint = screens?.length
    ? `Screens/pages to generate: ${screens.join(', ')}`
    : `Auto-determine the most important screens/pages for this type of app or site.`
  const imgHint = imageFolder
    ? `Images folder: ${imageFolder} — use real filenames, add onerror fallback to placehold.jp.`
    : `Images folder: null — use https://placehold.jp/{W}x{H}.png for all images.`

  const userMessage = [
    `Project: ${projectDesc}`,
    `Platform: ${platform}`,
    screenHint, imgHint, '',
    'Generate the design-spec.json for this project.',
    'Output ONLY the raw JSON object — no markdown fences, no explanation.',
    'The JSON must be valid and complete per the autogen-design.md Phase 1 spec.'
  ].join('\n')

  const systemPrompt = [
    loadSkill('autogen-design'), '---',
    '# Your task: Phase 1 — Generate Design Spec',
    'Output ONLY valid JSON. No markdown. No commentary.'
  ].join('\n\n')

  let out = ''
  await streamText({ provider, systemPrompt, userMessage, onText: t => { out += t; onText?.(t) } })
  const cleaned = stripCodeFences(out).trim()
  try { return JSON.parse(cleaned) } catch {
    const m = cleaned.match(/\{[\s\S]*\}/)
    if (m) return JSON.parse(m[0])
    throw new Error('Phase 1 output was not valid JSON')
  }
}

// ─── Phase 2: Read DesignKit component context ────────────────────────────────

const CHAR_LIMIT = 60000 // max chars of component HTML to inject

// Priority categories to always read
const MOBILE_PRIORITY = ['navbars', 'cards', 'buttons', 'patterns', 'native', 'inputs']
const WEB_PRIORITY    = ['navbars', 'cards', 'buttons', 'layout', 'widgets', 'patterns']

export function readComponentFiles(platform, specScreens) {
  const kit     = platform === 'mobile' ? 'app-mobile' : 'web'
  const compDir = join(ROOT, 'components', kit)
  const priority = platform === 'mobile' ? MOBILE_PRIORITY : WEB_PRIORITY

  // Collect all component mentions from spec screens
  const mentioned = new Set(
    (specScreens || []).flatMap(s => (s.components || []).map(c => c.toLowerCase()))
  )

  const loaded = [] // { category, file, html }
  let totalChars = 0

  // Read component map for reference
  const mapPath = join(ROOT, 'components', `componentmap-${kit}.md`)
  const compMap = readFile(mapPath) || ''

  // Helper: read all html files in a category dir
  function readCategory(cat, maxFiles = 999) {
    const dir = join(compDir, cat)
    if (!existsSync(dir)) return
    const files = readdirSync(dir).filter(f => f.endsWith('.html'))
    let count = 0
    for (const f of files) {
      if (count >= maxFiles) break
      if (totalChars >= CHAR_LIMIT) break
      const html = readFile(join(dir, f))
      if (!html) continue
      loaded.push({ category: cat, file: f, html })
      totalChars += html.length
      count++
    }
  }

  // 1. Always read priority categories fully
  for (const cat of priority) {
    if (totalChars >= CHAR_LIMIT) break
    readCategory(cat, 6) // max 6 per priority category
  }

  // 2. Read any other categories hinted at by spec component names
  if (existsSync(compDir)) {
    const allCats = readdirSync(compDir).filter(f => {
      try { return readdirSync(join(compDir, f)).length > 0 } catch { return false }
    })
    for (const cat of allCats) {
      if (priority.includes(cat)) continue
      if (totalChars >= CHAR_LIMIT) break
      // Only read this category if a spec component mentions its name
      const relevant = [...mentioned].some(m => m.includes(cat) || cat.includes(m.split(' ')[0]))
      if (relevant) readCategory(cat, 3)
    }
  }

  return { compMap, components: loaded, totalChars }
}

export function formatComponentContext(ctx) {
  const parts = [
    `# DesignKit Component Reference (${ctx.components.length} components loaded, ${Math.round(ctx.totalChars / 1000)}KB)`,
    '',
    '## Component Map (available components)',
    ctx.compMap.slice(0, 3000), // first 3K of map for awareness
    '',
    '## Loaded Component HTML (use these as reference and building blocks)',
  ]
  for (const c of ctx.components) {
    parts.push(`\n### ${c.category}/${c.file}`)
    parts.push(c.html)
  }
  return parts.join('\n')
}

// ─── Phase 3: Generate shared components ─────────────────────────────────────

export async function phase3_shared(spec, componentContext, provider, onText) {
  const isMobile = spec.platform === 'mobile'

  const sharedList = isMobile
    ? ['Top App Bar (with back button variant and title)', 'Bottom Navigation Bar (matching all screens\' tabs)', 'iOS Status Bar']
    : ['Top Navigation Bar (logo + nav links + CTA)', 'Page Footer (links + copyright)']

  const userMessage = [
    '# Design Spec',
    '```json', JSON.stringify({
      project: spec.project,
      platform: spec.platform,
      mood: spec.mood,
      colors: spec.colors,
      typography: spec.typography,
      radius: spec.radius,
      screens: spec.screens.map(s => ({ id: s.id, name: s.name }))
    }, null, 2), '```', '',
    '# DesignKit Component Reference',
    componentContext, '',
    '# Task: Generate Shared Components',
    'Generate these shared components that will be used across ALL screens:',
    sharedList.map((s, i) => `${i + 1}. ${s}`).join('\n'), '',
    'Output a single JSON object with keys matching component names (camelCase), each value is the complete self-contained HTML snippet.',
    'Apply the exact colors, fonts, and radius from the design spec.',
    'Output ONLY valid JSON. No markdown fences. No explanation.',
    'Example format: { "topBar": "<div ...>...</div>", "bottomNav": "<div ...>...</div>" }'
  ].join('\n')

  const systemPrompt = [
    loadSkill('autogen-design'), '---',
    loadSkill('design'), '---',
    '# Your task: Phase 3 — Generate Shared Components',
    'Output ONLY a valid JSON object mapping component names to HTML strings. No markdown. No commentary.'
  ].join('\n\n')

  let out = ''
  await streamText({ provider, systemPrompt, userMessage, onText: t => { out += t; onText?.(t) } })
  const cleaned = stripCodeFences(out).trim()
  try { return JSON.parse(cleaned) } catch {
    const m = cleaned.match(/\{[\s\S]*\}/)
    if (m) { try { return JSON.parse(m[0]) } catch {} }
    return {} // non-fatal — screens will still generate
  }
}

// ─── Phase 4: Generate each screen ───────────────────────────────────────────

export async function phase4_screen(spec, screen, componentContext, sharedComponents, prevScreens, imageFolder, provider, onText) {
  const imgNote = imageFolder
    ? `Use images from: ${imageFolder}/. Add onerror="this.src='https://placehold.jp/{W}x{H}.png'" on each <img>.`
    : `Use https://placehold.jp/{W}x{H}.png for all images.`

  // Build shared component hint
  const sharedHint = Object.keys(sharedComponents).length > 0
    ? [
        '# Shared Components (use these EXACTLY — copy and paste, do not recreate)',
        '```json', JSON.stringify(sharedComponents, null, 2), '```'
      ].join('\n')
    : ''

  // Build previous screens hint (just names + brief summary to guide consistency)
  const prevHint = prevScreens.length > 0
    ? [
        '# Previously Generated Screens (for style consistency reference)',
        prevScreens.map(p => `- ${p.name} (${p.file}): ${p.description || ''}`).join('\n')
      ].join('\n')
    : ''

  const userMessage = [
    '# Design Spec',
    '```json', JSON.stringify(spec, null, 2), '```', '',
    sharedHint, '',
    prevHint, '',
    '# DesignKit Component Reference',
    componentContext, '',
    '# Screen to Generate',
    '```json', JSON.stringify(screen, null, 2), '```', '',
    imgNote, '',
    `Generate the complete, self-contained HTML file for "${screen.name}".`,
    'Rules:',
    '- Include the full <!DOCTYPE html> ... </html> wrapper',
    '- Use the exact tokens from the design spec (colors, fonts, radius)',
    '- Use the shared components provided above verbatim for navbar/footer/topbar',
    '- Use DesignKit component HTML as building blocks — adapt to fit the design spec colors',
    '- Inline all styles — no external CSS, no class dependencies outside the file',
    '- Output ONLY the raw HTML. No markdown fences. No explanation.',
  ].join('\n')

  const systemPrompt = [
    loadSkill('autogen-design'), '---',
    '# Active Skill: design (HTML output)',
    loadSkill('design'), '---',
    '# Your task: Phase 4 — Generate Screen HTML',
    'Output ONLY the complete raw HTML file. No markdown. No explanation.'
  ].join('\n\n')

  let out = ''
  await streamText({ provider, systemPrompt, userMessage, onText: t => { out += t; onText?.(t) } })
  return stripCodeFences(out).trim()
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
    body { font-family: Inter, system-ui, sans-serif; background: #09090B; color: #F1F5F9; min-height: 100vh; padding: 40px 24px; -webkit-font-smoothing: antialiased; }
    header { max-width: 1200px; margin: 0 auto 40px; }
    header h1 { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; margin-bottom: 8px; }
    header p { font-size: 14px; color: #64748B; }
    .meta { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: #1E293B; border: 1px solid #334155; border-radius: 9999px; font-size: 12px; color: #94A3B8; }
    .color-dot { width: 10px; height: 10px; border-radius: 50%; background: ${spec.colors?.primary || '#6366F1'}; display: inline-block; }
    .grid { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(${isMobile ? '220px' : '380px'}, 1fr)); gap: 24px; }
    .card { display: flex; flex-direction: column; border-radius: 12px; border: 1px solid #1E293B; overflow: hidden; background: #111827; text-decoration: none; color: inherit; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; }
    .card:hover { border-color: #334155; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    .frame-wrap { position: relative; width: 100%; aspect-ratio: ${isMobile ? '390/844' : '16/10'}; overflow: hidden; background: #0F172A; }
    .frame-wrap iframe { position: absolute; top: 0; left: 0; width: ${frameW}px; height: ${frameH}px; border: none; transform-origin: top left; }
    .frame-overlay { position: absolute; inset: 0; cursor: pointer; }
    .card-label { padding: 12px 16px; border-top: 1px solid #1E293B; display: flex; justify-content: space-between; align-items: center; }
    .card-name { font-size: 13px; font-weight: 600; color: #F1F5F9; }
    .card-file { font-size: 11px; color: #475569; font-family: monospace; }
    footer { max-width: 1200px; margin: 48px auto 0; padding-top: 24px; border-top: 1px solid #1E293B; font-size: 12px; color: #334155; }
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
  <div class="grid">${cards}</div>
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
  const provider  = options.provider || 'anthropic'
  const platform  = options.platform || 'mobile'
  const outputDir = resolve(options.output || `output/${projectDesc.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`)
  const imageFolder = options.images || null
  const screens   = options.screens ? options.screens.split(',').map(s => s.trim()).filter(Boolean) : []

  if (!Object.keys(PROVIDERS).includes(provider)) {
    console.error(`Error: Unknown provider "${provider}". Available: ${Object.keys(PROVIDERS).join(', ')}`)
    process.exit(1)
  }

  const log = t => process.stderr.write(t + '\n')
  log(`\nDesignKit AutoGen`)
  log(`─────────────────────────────────────`)
  log(`Project:  ${projectDesc}`)
  log(`Platform: ${platform}`)
  log(`Provider: ${PROVIDERS[provider].label}`)
  log(`Output:   ${outputDir}`)
  if (screens.length) log(`Screens:  ${screens.join(', ')}`)
  log(`─────────────────────────────────────\n`)

  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  // ── Phase 1: Spec ──────────────────────────────────────────────────────────
  log('[Phase 1/4] Analyzing requirements & generating design spec...')
  let spec
  try {
    spec = await phase1_spec(projectDesc, platform, screens, imageFolder, provider,
      () => process.stderr.write('.'))
    process.stderr.write('\n')
  } catch (err) {
    log(`\nPhase 1 failed: ${err.message}`)
    process.exit(1)
  }

  if (imageFolder) spec.imageFolder = imageFolder
  writeFileSync(join(outputDir, 'design-spec.json'), JSON.stringify(spec, null, 2), 'utf8')
  log(`✓ design-spec.json — ${spec.screens?.length || 0} screens, primary: ${spec.colors?.primary}`)

  // Create index.html skeleton immediately so user can open it
  writeFileSync(join(outputDir, 'index.html'), generateIndexHtml({ ...spec, screens: [] }), 'utf8')
  log(`✓ index.html (preview gallery — opens now, updates as screens complete)`)
  log(`  open ${join(outputDir, 'index.html')}\n`)

  if (!spec.screens?.length) { log('No screens in spec. Aborting.'); process.exit(1) }

  // ── Phase 2: Read DesignKit component context ──────────────────────────────
  log('[Phase 2/4] Reading DesignKit component library...')
  const ctx = readComponentFiles(platform, spec.screens)
  const componentContext = formatComponentContext(ctx)
  log(`✓ Loaded ${ctx.components.length} components (${Math.round(ctx.totalChars / 1000)}KB) from ${[...new Set(ctx.components.map(c => c.category))].join(', ')}`)
  log('')

  // ── Phase 3: Shared components ────────────────────────────────────────────
  log('[Phase 3/4] Generating shared components (topbar, nav, footer)...')
  let sharedComponents = {}
  try {
    sharedComponents = await phase3_shared(spec, componentContext, provider,
      () => process.stderr.write('.'))
    process.stderr.write('\n')
    const keys = Object.keys(sharedComponents)
    if (keys.length) {
      log(`✓ Shared: ${keys.join(', ')}`)
      writeFileSync(join(outputDir, 'shared-components.json'), JSON.stringify(sharedComponents, null, 2), 'utf8')
    } else {
      log('⚠ No shared components generated (screens will be self-contained)')
    }
  } catch (err) {
    log(`⚠ Phase 3 failed (${err.message}) — continuing without shared components`)
  }
  log('')

  // ── Phase 4: Generate screens ─────────────────────────────────────────────
  log('[Phase 4/4] Generating screens...')
  const generated = []
  let failed = 0

  for (let i = 0; i < spec.screens.length; i++) {
    const screen = spec.screens[i]
    const screenFile = screen.file || `${screen.id || `screen-${i + 1}`}.html`
    process.stderr.write(`  [${i + 1}/${spec.screens.length}] ${screen.name}... `)

    try {
      const html = await phase4_screen(
        spec, screen, componentContext, sharedComponents,
        generated, imageFolder, provider,
        () => process.stderr.write('.')
      )
      process.stderr.write('\n')
      writeFileSync(join(outputDir, screenFile), html, 'utf8')
      log(`  ✓ ${screenFile}`)
      generated.push({ ...screen, file: screenFile })

      // Update index.html after each screen
      writeFileSync(join(outputDir, 'index.html'), generateIndexHtml({ ...spec, screens: generated }), 'utf8')
    } catch (err) {
      process.stderr.write('\n')
      log(`  ✗ ${screenFile} FAILED: ${err.message}`)
      failed++
    }
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  log(`\n─────────────────────────────────────`)
  log(`Done! ${generated.length} screens generated${failed ? `, ${failed} failed` : ''}.`)
  log(`Output: ${outputDir}`)
  log(`\nOpen preview:`)
  log(`  open ${join(outputDir, 'index.html')}`)
  log(`─────────────────────────────────────\n`)
}
