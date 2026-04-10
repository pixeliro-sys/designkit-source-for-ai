import { buildIndex, filterComponents, KITS } from '../lib/index.js'

const KIT_LABELS = {
  'web':        '🌐 Web',
  'app-mobile': '📱 Mobile',
  'common':     '⚙️  Common',
}

export function listCommand(options) {
  const { kit, category } = options
  const all = buildIndex()
  const components = filterComponents(all, { kit, category })

  if (components.length === 0) {
    console.log('\n  No components found.\n')
    console.log('  Available kits:', KITS.join(', '))
    return
  }

  // Group by kit → category
  const grouped = {}
  for (const c of components) {
    if (!grouped[c.kit]) grouped[c.kit] = {}
    if (!grouped[c.kit][c.category]) grouped[c.kit][c.category] = []
    grouped[c.kit][c.category].push(c)
  }

  console.log()
  console.log(`  DesignKit — ${components.length} component${components.length !== 1 ? 's' : ''}`)
  if (kit) console.log(`  Kit: ${kit}`)
  if (category) console.log(`  Category: ${category}`)
  console.log()

  for (const [k, categories] of Object.entries(grouped)) {
    const kitTotal = Object.values(categories).flat().length
    console.log(`  ${KIT_LABELS[k] || k}  (${kitTotal})`)
    console.log()

    for (const [cat, items] of Object.entries(categories)) {
      console.log(`    ${cat}/  (${items.length})`)
      for (const c of items) {
        const size = c.width && c.height ? `  ${c.width}×${c.height}` : ''
        console.log(`      ${c.id.padEnd(55)} ${size}`)
      }
      console.log()
    }
  }

  console.log(`  Usage: designkit add <id>`)
  console.log(`  Example: designkit add web/cards/card-basic`)
  console.log()
}
