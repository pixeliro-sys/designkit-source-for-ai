import { buildIndex, searchComponents, filterComponents } from '../lib/index.js'

export function searchCommand(query, options) {
  const { kit } = options
  const all = buildIndex()
  const filtered = filterComponents(all, { kit })
  const results = searchComponents(filtered, query)

  console.log()

  if (results.length === 0) {
    console.log(`  No components found for "${query}"`)
    console.log()
    console.log('  Try broader terms: card, button, nav, chart, form, list')
    console.log()
    return
  }

  console.log(`  ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`)
  console.log()

  // Group by kit
  const grouped = {}
  for (const c of results) {
    if (!grouped[c.kit]) grouped[c.kit] = []
    grouped[c.kit].push(c)
  }

  for (const [k, items] of Object.entries(grouped)) {
    console.log(`  ${k}/`)
    for (const c of items) {
      const tags = c.tags.length ? `  [${c.tags.slice(0, 3).join(', ')}]` : ''
      console.log(`    ${c.id.padEnd(50)} ${tags}`)
    }
    console.log()
  }

  console.log(`  Add a component: designkit add ${results[0].id}`)
  console.log()
}
