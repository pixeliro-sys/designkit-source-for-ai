import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

const TOKENS = {
  'kit-primary':       '#6366F1',
  'kit-primary-text':  '#FFFFFF',
  'kit-secondary':     '#64748B',
  'kit-accent':        '#F59E0B',
  'kit-bg':            '#FFFFFF',
  'kit-surface':       '#F8FAFC',
  'kit-surface-2':     '#F1F5F9',
  'kit-surface-3':     '#E2E8F0',
  'kit-text':          '#0F172A',
  'kit-text-2':        '#475569',
  'kit-text-3':        '#94A3B8',
  'kit-text-inverse':  '#FFFFFF',
  'kit-border':        '#E2E8F0',
  'kit-border-strong': '#CBD5E1',
  'kit-success':       '#22C55E',
  'kit-success-bg':    '#F0FDF4',
  'kit-error':         '#EF4444',
  'kit-error-bg':      '#FEF2F2',
  'kit-warning':       '#F59E0B',
  'kit-warning-bg':    '#FFFBEB',
  'kit-info':          '#3B82F6',
  'kit-info-bg':       '#EFF6FF',
  'kit-font':          "'Inter', system-ui, -apple-system, sans-serif",
  'kit-text-xs':       '11px',
  'kit-text-sm':       '13px',
  'kit-text-md':       '15px',
  'kit-text-lg':       '17px',
  'kit-text-xl':       '20px',
  'kit-text-2xl':      '24px',
  'kit-text-3xl':      '32px',
  'kit-text-4xl':      '48px',
  'kit-space-1':       '4px',
  'kit-space-2':       '8px',
  'kit-space-3':       '12px',
  'kit-space-4':       '16px',
  'kit-space-5':       '20px',
  'kit-space-6':       '24px',
  'kit-space-8':       '32px',
  'kit-space-10':      '40px',
  'kit-space-12':      '48px',
  'kit-space-16':      '80px',
  'kit-radius-sm':     '6px',
  'kit-radius':        '10px',
  'kit-radius-lg':     '14px',
  'kit-radius-xl':     '20px',
  'kit-radius-full':   '9999px',
  'kit-shadow-sm':     '0 1px 3px rgba(0,0,0,0.08)',
  'kit-shadow':        '0 4px 12px rgba(0,0,0,0.10)',
  'kit-shadow-lg':     '0 8px 32px rgba(0,0,0,0.12)',
  'kit-shadow-xl':     '0 20px 60px rgba(0,0,0,0.15)',
}

function generateCSS() {
  const vars = Object.entries(TOKENS)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n')

  return `:root {\n${vars}\n}\n\n/* Dark mode */\n@media (prefers-color-scheme: dark) {\n  :root {\n    --kit-bg:            #0F172A;\n    --kit-surface:       #1E293B;\n    --kit-surface-2:     #334155;\n    --kit-surface-3:     #475569;\n    --kit-text:          #F1F5F9;\n    --kit-text-2:        #94A3B8;\n    --kit-text-3:        #64748B;\n    --kit-text-inverse:  #0F172A;\n    --kit-border:        #334155;\n    --kit-border-strong: #475569;\n  }\n}\n`
}

function generateJS() {
  const entries = Object.entries(TOKENS)
    .map(([k, v]) => {
      const key = k.replace('kit-', '').replace(/-([a-z])/g, (_, l) => l.toUpperCase())
      return `  '${key}': '${v}',`
    })
    .join('\n')
  return `// DesignKit tokens\nexport const tokens = {\n${entries}\n}\n`
}

function generateTS() {
  const entries = Object.entries(TOKENS)
    .map(([k, v]) => {
      const key = k.replace('kit-', '').replace(/-([a-z])/g, (_, l) => l.toUpperCase())
      return `  ${key}: '${v}',`
    })
    .join('\n')
  return `// DesignKit tokens\nexport const tokens = {\n${entries}\n} as const\n\nexport type Tokens = typeof tokens\n`
}

function generateJSON() {
  const obj = {}
  for (const [k, v] of Object.entries(TOKENS)) {
    const key = k.replace('kit-', '').replace(/-([a-z])/g, (_, l) => l.toUpperCase())
    obj[key] = v
  }
  return JSON.stringify(obj, null, 2) + '\n'
}

const FORMATS = {
  css:  { fn: generateCSS,  ext: 'css',  file: 'tokens.css' },
  js:   { fn: generateJS,   ext: 'js',   file: 'tokens.js' },
  ts:   { fn: generateTS,   ext: 'ts',   file: 'tokens.ts' },
  json: { fn: generateJSON, ext: 'json', file: 'tokens.json' },
}

export function initCommand(options) {
  const { output, format } = options

  const fmt = FORMATS[format]
  if (!fmt) {
    console.log(`\n  ✗ Unknown format "${format}". Use: css, js, ts, json\n`)
    process.exit(1)
  }

  if (!existsSync(output)) mkdirSync(output, { recursive: true })

  const dest = join(output, fmt.file)
  writeFileSync(dest, fmt.fn())

  console.log()
  console.log(`  ✓ DesignKit tokens written to: ${dest}`)
  console.log()

  if (format === 'css') {
    console.log('  Add to your HTML:')
    console.log(`    <link rel="stylesheet" href="${fmt.file}">`)
    console.log()
    console.log('  Or import in your CSS:')
    console.log(`    @import './${fmt.file}';`)
  } else if (format === 'js' || format === 'ts') {
    console.log('  Import in your project:')
    console.log(`    import { tokens } from './${fmt.file}'`)
  }

  console.log()
  console.log('  Override any token to retheme all components:')
  console.log('    --kit-primary: #EF4444;  /* red brand */')
  console.log('    --kit-radius:  4px;      /* sharper corners */')
  console.log('    --kit-bg:      #0F172A;  /* dark mode */')
  console.log()
}
