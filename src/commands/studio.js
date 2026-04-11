import { createServer } from 'http'
import { PROVIDERS } from '../lib/providers.js'
import { getDefaultProvider, getDefaultPlatform, readConfig, setConfigValue } from '../lib/config.js'
import { phase1_spec, phase3_shared, phase4_screen, readComponentFiles, formatComponentContext } from './autogen.js'

// ─── SSE clients ──────────────────────────────────────────────────────────────

let sseClients = []

function broadcast(event) {
  const msg = `data: ${JSON.stringify(event)}\n\n`
  sseClients = sseClients.filter(r => !r.destroyed)
  sseClients.forEach(r => r.write(msg))
}

// ─── State ────────────────────────────────────────────────────────────────────

let state = { running: false, spec: null, screens: {} }

function logMsg(text) {
  broadcast({ type: 'log', text })
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

async function runGeneration({ prompt, platform, provider, screens }) {
  if (state.running) return
  state = { running: true, spec: null, screens: {} }
  broadcast({ type: 'start' })

  try {
    // Phase 1: Spec
    logMsg('[1/4] Analyzing requirements...')
    const spec = await phase1_spec(prompt, platform, screens, null, provider,
      () => broadcast({ type: 'tick' }))
    state.spec = spec
    broadcast({ type: 'spec', data: spec })
    logMsg(`✓ Spec — ${spec.screens?.length || 0} screens, primary: ${spec.colors?.primary || 'N/A'}`)

    if (!spec.screens?.length) throw new Error('Spec has no screens')

    // Phase 2: Read DesignKit components
    broadcast({ type: 'phase', n: 2, label: '[2/4] Reading DesignKit components...' })
    logMsg('[2/4] Reading DesignKit component library...')
    const ctx = readComponentFiles(platform, spec.screens)
    const componentContext = formatComponentContext(ctx)
    const cats = [...new Set(ctx.components.map(c => c.category))].join(', ')
    broadcast({ type: 'stream_chunk', text: `Loaded ${ctx.components.length} components (${Math.round(ctx.totalChars / 1000)}KB)\nCategories: ${cats}\n` })
    logMsg(`✓ Loaded ${ctx.components.length} components (${Math.round(ctx.totalChars / 1000)}KB)`)

    // Phase 3: Shared components
    broadcast({ type: 'phase', n: 3, label: '[3/4] Generating shared components...' })
    logMsg('[3/4] Generating shared components (topbar, nav)...')
    let sharedComponents = {}
    try {
      sharedComponents = await phase3_shared(spec, componentContext, provider,
        t => broadcast({ type: 'stream_chunk', text: t }))
      const keys = Object.keys(sharedComponents)
      broadcast({ type: 'shared_done', keys })
      logMsg(keys.length ? `✓ Shared: ${keys.join(', ')}` : '⚠ No shared components')
    } catch (err) {
      logMsg(`⚠ Shared components skipped: ${err.message}`)
    }

    // Phase 4: Screens
    broadcast({ type: 'phase', n: 4, label: `[4/4] Generating ${spec.screens.length} screens...` })
    logMsg(`[4/4] Generating ${spec.screens.length} screens...`)
    const generated = []

    for (let i = 0; i < spec.screens.length; i++) {
      const screen = spec.screens[i]
      const file = screen.file || `${screen.id || `screen-${i + 1}`}.html`
      logMsg(`  [${i + 1}/${spec.screens.length}] ${screen.name}...`)
      broadcast({ type: 'screen_start', name: screen.name, file })

      try {
        const html = await phase4_screen(
          spec, { ...screen, file }, componentContext, sharedComponents,
          generated, null, provider,
          t => broadcast({ type: 'stream_chunk', text: t, file })
        )
        state.screens[file] = html
        broadcast({ type: 'screen_done', name: screen.name, file, html })
        logMsg(`  ✓ ${file}`)
        generated.push({ ...screen, file })
      } catch (err) {
        broadcast({ type: 'screen_error', name: screen.name, file, message: err.message })
        logMsg(`  ✗ ${file}: ${err.message}`)
      }
    }

    broadcast({ type: 'done' })
    logMsg(`✓ Done! ${generated.length} screens generated.`)
  } catch (err) {
    broadcast({ type: 'error', message: err.message })
    logMsg(`✗ ${err.message}`)
  } finally {
    state.running = false
  }
}

// ─── HTTP server ──────────────────────────────────────────────────────────────

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => { try { resolve(JSON.parse(body)) } catch { resolve({}) } })
    req.on('error', reject)
  })
}

function serveSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  })
  // Initial comment to flush headers immediately
  res.write(': connected\n\n')
  sseClients.push(res)

  // Heartbeat every 20s to prevent browser timeout
  const hb = setInterval(() => {
    if (res.destroyed) { clearInterval(hb); return }
    res.write(': ping\n\n')
  }, 20000)

  req.on('close', () => {
    clearInterval(hb)
    sseClients = sseClients.filter(r => r !== res)
  })
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function createRequestHandler(defaultProvider, defaultPlatform) {
  return async (req, res) => {
    const url = new URL(req.url, `http://localhost`)

    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return }

    // SSE
    if (req.method === 'GET' && url.pathname === '/events') return serveSSE(req, res)

    // Screen HTML
    if (req.method === 'GET' && url.pathname.startsWith('/screen/')) {
      const file = url.pathname.replace('/screen/', '')
      const html = state.screens[file]
      if (!html) { res.writeHead(404); res.end('Not found'); return }
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
      return
    }

    // Generate
    if (req.method === 'POST' && url.pathname === '/generate') {
      const body = await parseBody(req)
      const { prompt, platform, provider, screens } = body
      if (!prompt) return json(res, { error: 'prompt required' }, 400)
      runGeneration({
        prompt,
        platform: platform || defaultPlatform,
        provider: provider || defaultProvider,
        screens: screens ? screens.split(',').map(s => s.trim()).filter(Boolean) : []
      })
      return json(res, { ok: true })
    }

    // State
    if (req.method === 'GET' && url.pathname === '/state') {
      return json(res, { running: state.running, spec: state.spec, screenFiles: Object.keys(state.screens) })
    }

    // Config GET — return config with keys masked
    if (req.method === 'GET' && url.pathname === '/config') {
      const cfg = readConfig()
      const mask = k => k ? k.slice(0, 8) + '••••••••••••••••' : ''
      return json(res, {
        provider: cfg.provider,
        platform: cfg.platform,
        anthropicKey: mask(cfg.anthropicKey),
        geminiKey: mask(cfg.geminiKey),
        openaiKey: mask(cfg.openaiKey),
        anthropicKeySet: !!cfg.anthropicKey,
        geminiKeySet: !!cfg.geminiKey,
        openaiKeySet: !!cfg.openaiKey
      })
    }

    // Config POST — save values
    if (req.method === 'POST' && url.pathname === '/config') {
      const body = await parseBody(req)
      const allowed = ['provider', 'platform', 'anthropicKey', 'geminiKey', 'openaiKey']
      const errors = []
      for (const [k, v] of Object.entries(body)) {
        if (!allowed.includes(k)) continue
        try { setConfigValue(k, v) } catch (e) { errors.push(e.message) }
      }
      if (errors.length) return json(res, { ok: false, errors }, 400)
      return json(res, { ok: true })
    }

    // UI
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(getUI(defaultProvider, defaultPlatform))
      return
    }

    res.writeHead(404); res.end()
  }
}

// ─── Command entry ────────────────────────────────────────────────────────────

export async function studioCommand(options) {
  const port = options.port || 3333
  const defaultProvider = options.provider || getDefaultProvider()
  const defaultPlatform = options.platform || getDefaultPlatform()

  const server = createServer(createRequestHandler(defaultProvider, defaultPlatform))
  server.listen(port, () => {
    console.log(`\nDesignKit Studio`)
    console.log(`─────────────────────────────────────`)
    console.log(`Local:    http://localhost:${port}`)
    console.log(`Provider: ${PROVIDERS[defaultProvider]?.label || defaultProvider}`)
    console.log(`Platform: ${defaultPlatform}`)
    console.log(`─────────────────────────────────────`)
    console.log(`Press Ctrl+C to stop\n`)

    // Auto-open browser
    const open = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
    import('child_process').then(({ exec }) => exec(`${open} http://localhost:${port}`))
  })
}

// ─── UI HTML ──────────────────────────────────────────────────────────────────

function getUI(defaultProvider, defaultPlatform) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DesignKit Studio</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #09090B;
      --surface:  #111827;
      --surface2: #1C2235;
      --border:   #1E293B;
      --border2:  #334155;
      --text:     #F1F5F9;
      --text2:    #94A3B8;
      --text3:    #475569;
      --primary:  #818CF8;
      --success:  #34D399;
      --error:    #FB7185;
      --warning:  #FBBF24;
      --sidebar:  280px;
    }

    html, body { height: 100%; overflow: hidden; }

    body {
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
    }

    /* ── Topbar ── */
    .topbar {
      height: 44px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 12px;
      flex-shrink: 0;
      background: var(--surface);
    }
    .topbar-logo {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary);
      letter-spacing: -0.3px;
    }
    .topbar-sep { width: 1px; height: 16px; background: var(--border2); }
    .topbar-title { font-size: 12px; color: var(--text2); }
    .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }

    /* mode tabs */
    .mode-tabs { display: flex; gap: 2px; background: var(--bg); border-radius: 6px; padding: 2px; }
    .mode-tab {
      padding: 4px 12px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 4px;
      cursor: pointer;
      color: var(--text2);
      border: none;
      background: none;
    }
    .mode-tab.active { background: var(--surface2); color: var(--text); }
    .mode-tab:hover:not(.active) { color: var(--text); }

    /* ── Layout ── */
    .layout {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: var(--sidebar);
      flex-shrink: 0;
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .sidebar-section {
      padding: 14px 14px 0;
      flex-shrink: 0;
    }

    .field { margin-bottom: 10px; }
    .field label { display: block; font-size: 11px; color: var(--text2); margin-bottom: 4px; font-weight: 500; }

    .field textarea, .field input, .field select {
      width: 100%;
      background: var(--bg);
      border: 1px solid var(--border2);
      border-radius: 6px;
      color: var(--text);
      font-family: inherit;
      font-size: 12px;
      padding: 7px 9px;
      outline: none;
      transition: border-color 0.15s;
      resize: none;
    }
    .field textarea:focus, .field input:focus, .field select:focus { border-color: var(--primary); }
    .field select option { background: var(--surface); }
    .field textarea { height: 72px; line-height: 1.5; }

    .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

    .btn-generate {
      width: 100%;
      height: 34px;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
      margin-bottom: 14px;
    }
    .btn-generate:hover { opacity: 0.85; }
    .btn-generate:disabled { opacity: 0.4; cursor: not-allowed; }

    .section-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 10px 14px 6px;
      flex-shrink: 0;
    }

    /* Screen list */
    .screen-list { overflow-y: auto; flex-shrink: 0; max-height: 180px; }
    .screen-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 14px;
      cursor: pointer;
      border-left: 2px solid transparent;
      transition: background 0.1s;
    }
    .screen-item:hover { background: var(--surface2); }
    .screen-item.active { border-left-color: var(--primary); background: var(--surface2); }
    .screen-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--border2); flex-shrink: 0;
    }
    .screen-dot.done { background: var(--success); }
    .screen-dot.generating { background: var(--warning); animation: pulse 1s infinite; }
    .screen-dot.error { background: var(--error); }
    @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
    .screen-name { font-size: 12px; color: var(--text); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .screen-file { font-size: 10px; color: var(--text3); font-family: monospace; }

    /* Log */
    .log-wrap { flex: 1; overflow: hidden; display: flex; flex-direction: column; min-height: 0; max-height: 160px; }
    .log {
      flex: 1;
      overflow-y: auto;
      padding: 8px 14px 14px;
      font-size: 11px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--text2);
      line-height: 1.6;
    }
    .log-line.success { color: var(--success); }
    .log-line.error { color: var(--error); }

    /* ── Stream panel ── */
    .stream-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #020408;
    }
    .stream-header {
      height: 36px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 10px;
      flex-shrink: 0;
      background: var(--surface);
    }
    .stream-phase {
      font-size: 11px;
      color: var(--text3);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stream-phase.active { color: var(--warning); }
    .stream-cursor {
      display: inline-block;
      width: 7px; height: 13px;
      background: var(--primary);
      opacity: 0;
      animation: blink 1s steps(1) infinite;
      vertical-align: text-bottom;
      margin-left: 1px;
    }
    @keyframes blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
    .stream-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px 20px;
      font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.7;
      color: #94A3B8;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .stream-phase-header {
      color: var(--primary);
      font-weight: 700;
      margin: 12px 0 4px;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .stream-phase-header:first-child { margin-top: 0; }
    .stream-html { color: #67e8f9; }
    .stream-json { color: #a5f3fc; }
    .stream-info { color: #475569; font-style: italic; }

    /* ── Settings ── */
    .settings-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 11px;
      font-weight: 600;
      color: var(--text3);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      flex-shrink: 0;
      border-top: 1px solid var(--border);
      user-select: none;
    }
    .settings-toggle:hover { color: var(--text2); }
    .settings-toggle .arrow { transition: transform 0.2s; font-size: 9px; }
    .settings-toggle.open .arrow { transform: rotate(90deg); }

    .settings-panel {
      flex-shrink: 0;
      padding: 0 14px 14px;
      display: none;
    }
    .settings-panel.open { display: block; }

    .key-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
    }
    .key-row label {
      font-size: 11px;
      color: var(--text2);
      width: 68px;
      flex-shrink: 0;
      font-weight: 500;
    }
    .key-input {
      flex: 1;
      background: var(--bg);
      border: 1px solid var(--border2);
      border-radius: 6px;
      color: var(--text);
      font-family: 'SF Mono', monospace;
      font-size: 11px;
      padding: 5px 8px;
      outline: none;
    }
    .key-input:focus { border-color: var(--primary); }
    .key-status {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: var(--border2);
      flex-shrink: 0;
    }
    .key-status.set { background: var(--success); }
    .btn-save-keys {
      width: 100%;
      height: 30px;
      background: var(--surface2);
      border: 1px solid var(--border2);
      border-radius: 6px;
      color: var(--text);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 4px;
    }
    .btn-save-keys:hover { background: var(--border2); }
    .save-status { font-size: 11px; color: var(--success); text-align: center; margin-top: 6px; min-height: 16px; }

    /* ── Main panel ── */
    .main {
      flex: 1;
      display: flex;
      overflow: hidden;
      position: relative;
    }

    .panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .panel + .panel { border-left: 1px solid var(--border); }

    .panel-header {
      height: 36px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      flex-shrink: 0;
      background: var(--surface);
    }
    .panel-title { font-size: 11px; color: var(--text3); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .panel-badge {
      font-size: 10px;
      font-family: monospace;
      color: var(--text3);
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1px 6px;
    }

    /* Code editor */
    .code-editor {
      flex: 1;
      width: 100%;
      background: var(--bg);
      color: #e2e8f0;
      border: none;
      outline: none;
      resize: none;
      font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.65;
      padding: 16px;
      tab-size: 2;
    }

    /* Preview iframe */
    .preview-wrap {
      flex: 1;
      overflow: auto;
      background: #0F172A;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 24px;
    }
    .preview-frame {
      border: none;
      border-radius: 8px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5);
      background: #fff;
      flex-shrink: 0;
    }

    /* Empty state */
    .empty {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text3);
      gap: 8px;
    }
    .empty-icon { font-size: 32px; opacity: 0.4; }
    .empty-text { font-size: 13px; }

    /* Spinner */
    .spinner {
      display: inline-block;
      width: 12px; height: 12px;
      border: 2px solid var(--border2);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .hidden { display: none !important; }
  </style>
</head>
<body>

<!-- Topbar -->
<div class="topbar">
  <span class="topbar-logo">DesignKit Studio</span>
  <div class="topbar-sep"></div>
  <span class="topbar-title" id="topbar-screen">No screen selected</span>
  <div class="topbar-right">
    <div class="mode-tabs">
      <button class="mode-tab active" data-mode="stream">Stream</button>
      <button class="mode-tab" data-mode="code">Code</button>
      <button class="mode-tab" data-mode="both">Both</button>
      <button class="mode-tab" data-mode="preview">Preview</button>
    </div>
  </div>
</div>

<!-- Layout -->
<div class="layout">

  <!-- Sidebar -->
  <div class="sidebar">
    <div class="sidebar-section">
      <div class="field">
        <label>Prompt</label>
        <textarea id="prompt" placeholder="Personal finance app&#10;SaaS dashboard&#10;Food delivery app…"></textarea>
      </div>
      <div class="row-2">
        <div class="field">
          <label>Platform</label>
          <select id="platform">
            <option value="mobile" ${defaultPlatform === 'mobile' ? 'selected' : ''}>Mobile</option>
            <option value="web" ${defaultPlatform === 'web' ? 'selected' : ''}>Web</option>
          </select>
        </div>
        <div class="field">
          <label>Provider</label>
          <select id="provider">
            <option value="anthropic" ${defaultProvider === 'anthropic' ? 'selected' : ''}>Claude</option>
            <option value="gemini" ${defaultProvider === 'gemini' ? 'selected' : ''}>Gemini</option>
            <option value="openai" ${defaultProvider === 'openai' ? 'selected' : ''}>GPT-4o</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Screens <span style="color:var(--text3)">(optional, comma-separated)</span></label>
        <input id="screens" type="text" placeholder="home, dashboard, settings…">
      </div>
      <button class="btn-generate" id="btn-generate" onclick="generate()">Generate</button>
    </div>

    <div class="section-label" id="screens-label" style="display:none">Screens</div>
    <div class="screen-list" id="screen-list"></div>

    <div class="section-label">Log</div>
    <div class="log-wrap">
      <div class="log" id="log"><span style="color:var(--text3)">Waiting…</span></div>
    </div>

    <!-- Settings -->
    <div class="settings-toggle" id="settings-toggle" onclick="toggleSettings()">
      <span class="arrow">▶</span> API Keys
    </div>
    <div class="settings-panel" id="settings-panel">
      <div class="key-row">
        <label>Claude</label>
        <input class="key-input" id="key-anthropic" type="password" placeholder="sk-ant-…">
        <div class="key-status" id="status-anthropic"></div>
      </div>
      <div class="key-row">
        <label>Gemini</label>
        <input class="key-input" id="key-gemini" type="password" placeholder="AIza…">
        <div class="key-status" id="status-gemini"></div>
      </div>
      <div class="key-row">
        <label>OpenAI</label>
        <input class="key-input" id="key-openai" type="password" placeholder="sk-…">
        <div class="key-status" id="status-openai"></div>
      </div>
      <button class="btn-save-keys" onclick="saveKeys()">Save Keys</button>
      <div class="save-status" id="save-status"></div>
    </div>
  </div>

  <!-- Main -->
  <div class="main" id="main">

    <!-- Stream panel -->
    <div class="stream-panel" id="panel-stream">
      <div class="stream-header">
        <span class="stream-phase" id="stream-phase-label">Waiting for generation...</span>
        <span class="stream-cursor" id="stream-cursor" style="display:none"></span>
      </div>
      <div class="stream-body" id="stream-body"><span class="stream-info">Run a generation to see live output here.</span></div>
    </div>

    <!-- Code panel -->
    <div class="panel" id="panel-code">
      <div class="panel-header">
        <span class="panel-title">Code</span>
        <span class="panel-badge" id="code-filename">—</span>
      </div>
      <div id="code-empty" class="empty">
        <div class="empty-icon">⌨</div>
        <div class="empty-text">Generate a design to see code</div>
      </div>
      <textarea class="code-editor hidden" id="code-editor" spellcheck="false"></textarea>
    </div>

    <!-- Preview panel -->
    <div class="panel" id="panel-preview">
      <div class="panel-header">
        <span class="panel-title">Preview</span>
        <span id="preview-size-badge" class="panel-badge">—</span>
      </div>
      <div id="preview-empty" class="empty">
        <div class="empty-icon">✦</div>
        <div class="empty-text">Preview will appear here</div>
      </div>
      <div class="preview-wrap hidden" id="preview-wrap">
        <iframe class="preview-frame" id="preview-frame" sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    </div>

  </div>
</div>

<script>
  // ── State ──────────────────────────────────────────────────────────────────

  const screens = {}      // file → { name, html, status }
  let activeFile = null
  let mode = 'stream'
  let previewDebounce = null
  let streamCurrentFile = null  // which file is currently streaming

  // ── SSE ────────────────────────────────────────────────────────────────────

  let _es = null
  function connectSSE() {
    if (_es) { _es.close(); _es = null }
    _es = new EventSource('/events')
    _es.onmessage = e => {
      try {
        const ev = JSON.parse(e.data)
        handleEvent(ev)
      } catch {}
    }
    _es.onerror = () => {
      _es.close()
      _es = null
      setTimeout(connectSSE, 3000)
    }
  }

  function handleEvent(ev) {
    if (ev.type === 'start') {
      Object.keys(screens).forEach(k => delete screens[k])
      streamCurrentFile = null
      renderScreenList()
      setLog('')
      setGenerating(true)
      streamReset()
      // Auto-switch to stream mode when generation starts
      setMode('stream')
    }

    if (ev.type === 'log') {
      appendLog(ev.text)
    }

    if (ev.type === 'phase') {
      streamPhaseHeader(ev.label)
    }

    if (ev.type === 'spec') {
      const spec = ev.data
      spec.screens?.forEach(s => {
        screens[s.file] = { name: s.name, file: s.file, html: '', status: 'pending' }
      })
      document.getElementById('screens-label').style.display = ''
      renderScreenList()
    }

    // Phase 1 spec JSON streaming
    if (ev.type === 'phase1_chunk') {
      streamAppend(ev.text, 'json')
    }

    // Phase 2/3 generic stream
    if (ev.type === 'stream_chunk') {
      if (ev.file && ev.file !== streamCurrentFile) {
        // new screen started streaming
        streamCurrentFile = ev.file
        // also update code editor live if this screen is active
      }
      streamAppend(ev.text, ev.file ? 'html' : 'json')
      // Live update code editor if this screen is selected
      if (ev.file) {
        if (!screens[ev.file]) screens[ev.file] = { name: ev.file, file: ev.file, html: '', status: 'generating' }
        screens[ev.file].html += ev.text
        if (activeFile === ev.file) {
          document.getElementById('code-editor').value = screens[ev.file].html
          schedulePreviewUpdate()
        }
      }
    }

    if (ev.type === 'shared_done') {
      streamAppend('\\n✓ Shared components: ' + ev.keys.join(', ') + '\\n', 'info')
    }

    if (ev.type === 'screen_start') {
      streamCurrentFile = ev.file
      streamPhaseHeader(\`Screen: \${ev.name} (\${ev.file})\`)
      if (screens[ev.file]) screens[ev.file].status = 'generating'
      else screens[ev.file] = { name: ev.name, file: ev.file, html: '', status: 'generating' }
      renderScreenList()
    }

    if (ev.type === 'screen_chunk') {
      if (!screens[ev.file]) screens[ev.file] = { name: ev.file, file: ev.file, html: '', status: 'generating' }
      screens[ev.file].html += ev.text
      streamAppend(ev.text, 'html')
      if (activeFile === ev.file) {
        document.getElementById('code-editor').value = screens[ev.file].html
        schedulePreviewUpdate()
      }
    }

    if (ev.type === 'screen_done') {
      screens[ev.file] = { name: ev.name, file: ev.file, html: ev.html, status: 'done' }
      renderScreenList()
      // If in stream mode, auto-select this screen so preview tab works
      if (!activeFile || mode === 'stream') {
        selectScreen(ev.file)
      }
    }

    if (ev.type === 'error') {
      streamAppend('\\n✗ ' + ev.message + '\\n', 'error')
      appendLog('✗ ' + ev.message, 'error')
      setGenerating(false)
      streamSetCursor(false)
    }

    if (ev.type === 'done') {
      streamAppend('\\n✓ All done!\\n', 'success')
      setGenerating(false)
      streamSetCursor(false)
    }
  }

  // ── Generate ───────────────────────────────────────────────────────────────

  async function generate() {
    const prompt = document.getElementById('prompt').value.trim()
    if (!prompt) { document.getElementById('prompt').focus(); return }

    await fetch('/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        platform: document.getElementById('platform').value,
        provider: document.getElementById('provider').value,
        screens: document.getElementById('screens').value
      })
    })
  }

  // ── Screen selection ───────────────────────────────────────────────────────

  function selectScreen(file) {
    activeFile = file
    const screen = screens[file]
    if (!screen) return

    document.getElementById('topbar-screen').textContent = screen.name
    document.getElementById('code-filename').textContent = screen.file
    document.getElementById('panel-badge-preview')?.remove()

    const editor = document.getElementById('code-editor')
    editor.value = screen.html
    editor.classList.remove('hidden')
    document.getElementById('code-empty').classList.add('hidden')

    updatePreview()
    renderScreenList()
  }

  function renderScreenList() {
    const list = document.getElementById('screen-list')
    list.innerHTML = Object.values(screens).map(s => \`
      <div class="screen-item \${s.file === activeFile ? 'active' : ''}" onclick="selectScreen('\${s.file}')">
        <div class="screen-dot \${s.status}"></div>
        <span class="screen-name">\${s.name}</span>
        <span class="screen-file">\${s.file}</span>
      </div>
    \`).join('')
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  function updatePreview() {
    const screen = screens[activeFile]
    if (!screen || !screen.html) return

    const frame = document.getElementById('preview-frame')
    const wrap = document.getElementById('preview-wrap')
    const empty = document.getElementById('preview-empty')
    const badge = document.getElementById('preview-size-badge')

    const platform = document.getElementById('platform').value
    const isMobile = platform === 'mobile'
    const w = isMobile ? 390 : 1280
    const h = isMobile ? 844 : 900

    frame.width = w
    frame.height = h
    frame.srcdoc = screen.html
    badge.textContent = \`\${w} × \${h}\`

    wrap.classList.remove('hidden')
    empty.classList.add('hidden')
  }

  function schedulePreviewUpdate() {
    clearTimeout(previewDebounce)
    previewDebounce = setTimeout(updatePreview, 300)
  }

  // Live code editing → preview
  document.getElementById('code-editor').addEventListener('input', e => {
    if (activeFile && screens[activeFile]) {
      screens[activeFile].html = e.target.value
      schedulePreviewUpdate()
    }
  })

  // ── Mode toggle ────────────────────────────────────────────────────────────

  const panelStream  = document.getElementById('panel-stream')
  const panelCode    = document.getElementById('panel-code')
  const panelPreview = document.getElementById('panel-preview')

  document.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => setMode(btn.dataset.mode))
  })

  function setMode(m) {
    mode = m
    document.querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.mode === m))
    applyMode()
  }

  function applyMode() {
    panelStream.style.display  = mode === 'stream' ? '' : 'none'
    panelCode.style.display    = (mode === 'code' || mode === 'both') ? '' : 'none'
    panelPreview.style.display = (mode === 'preview' || mode === 'both') ? '' : 'none'
  }

  // ── Stream helpers ─────────────────────────────────────────────────────────

  function streamReset() {
    document.getElementById('stream-body').innerHTML = ''
    _streamNode = null  // detach from old DOM, force new node on next append
    document.getElementById('stream-phase-label').textContent = 'Generating...'
    document.getElementById('stream-phase-label').className = 'stream-phase active'
    streamSetCursor(true)
  }

  function streamSetCursor(on) {
    const c = document.getElementById('stream-cursor')
    c.style.display = on ? '' : 'none'
  }

  function streamPhaseHeader(label) {
    const body = document.getElementById('stream-body')
    const el = document.createElement('div')
    el.className = 'stream-phase-header'
    el.textContent = label
    body.appendChild(el)
    document.getElementById('stream-phase-label').textContent = label
    body.scrollTop = body.scrollHeight
  }

  // Accumulate text into a current text node for performance
  let _streamNode = null
  function streamAppend(text, cls = '') {
    const body = document.getElementById('stream-body')
    // Clear placeholder
    if (body.querySelector('.stream-info')) body.innerHTML = ''

    // If cls changed or no current node, create new span
    if (!_streamNode || _streamNode.dataset.cls !== cls) {
      const span = document.createElement('span')
      span.dataset.cls = cls
      if (cls === 'html') span.style.color = '#67e8f9'
      else if (cls === 'json') span.style.color = '#a5f3fc'
      else if (cls === 'info') span.style.cssText = 'color:#475569;font-style:italic'
      else if (cls === 'error') span.style.color = '#fb7185'
      else if (cls === 'success') span.style.color = '#34d399'
      body.appendChild(span)
      _streamNode = span
    }
    _streamNode.textContent += text
    body.scrollTop = body.scrollHeight
  }

  // ── Log ────────────────────────────────────────────────────────────────────

  function appendLog(text, cls = '') {
    const log = document.getElementById('log')
    if (log.querySelector('span[style]')) log.innerHTML = '' // clear placeholder
    const line = document.createElement('div')
    line.className = 'log-line' + (cls ? ' ' + cls : '')
    line.textContent = text
    log.appendChild(line)
    log.scrollTop = log.scrollHeight
  }

  function setLog(text) {
    document.getElementById('log').innerHTML = text
  }

  function setGenerating(on) {
    const btn = document.getElementById('btn-generate')
    btn.disabled = on
    btn.textContent = on ? 'Generating…' : 'Generate'
  }

  // ── Enter key to generate ──────────────────────────────────────────────────

  document.getElementById('prompt').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate()
  })

  // ── Settings ───────────────────────────────────────────────────────────────

  function toggleSettings() {
    const toggle = document.getElementById('settings-toggle')
    const panel = document.getElementById('settings-panel')
    const open = panel.classList.toggle('open')
    toggle.classList.toggle('open', open)
  }

  async function loadConfig() {
    try {
      const cfg = await fetch('/config').then(r => r.json())
      document.getElementById('status-anthropic').classList.toggle('set', cfg.anthropicKeySet)
      document.getElementById('status-gemini').classList.toggle('set', cfg.geminiKeySet)
      document.getElementById('status-openai').classList.toggle('set', cfg.openaiKeySet)
      // Sync provider/platform selects
      if (cfg.provider) document.getElementById('provider').value = cfg.provider
      if (cfg.platform) document.getElementById('platform').value = cfg.platform
    } catch {}
  }

  async function saveKeys() {
    const body = {}
    const anthropic = document.getElementById('key-anthropic').value.trim()
    const gemini = document.getElementById('key-gemini').value.trim()
    const openai = document.getElementById('key-openai').value.trim()
    const provider = document.getElementById('provider').value
    const platform = document.getElementById('platform').value

    if (anthropic) body.anthropicKey = anthropic
    if (gemini) body.geminiKey = gemini
    if (openai) body.openaiKey = openai
    body.provider = provider
    body.platform = platform

    const res = await fetch('/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const status = document.getElementById('save-status')
    if (res.ok) {
      // Clear inputs after save
      document.getElementById('key-anthropic').value = ''
      document.getElementById('key-gemini').value = ''
      document.getElementById('key-openai').value = ''
      status.textContent = '✓ Saved'
      setTimeout(() => { status.textContent = '' }, 2000)
      loadConfig()
    } else {
      status.style.color = 'var(--error)'
      status.textContent = '✗ Failed to save'
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  setMode('stream')
  connectSSE()
  loadConfig()
</script>
</body>
</html>`
}
