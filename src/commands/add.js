import { buildIndex, searchComponents } from '../lib/index.js'
import { copyFileSync, mkdirSync, existsSync } from 'fs'
import { join, basename } from 'path'

export function addCommand(query, options) {
  const { output } = options
  const all = buildIndex()

  // Exact match first
  let component = all.find(c => c.id === query)

  // Fuzzy match if not found
  if (!component) {
    const results = searchComponents(all, query)
    if (results.length === 0) {
      console.log(`\n  ✗ No component found for "${query}"\n`)
      console.log('  Try: designkit search <query>')
      console.log('  Or:  designkit list\n')
      process.exit(1)
    }
    if (results.length === 1) {
      component = results[0]
    } else {
      console.log(`\n  Multiple matches for "${query}":\n`)
      for (const c of results.slice(0, 10)) {
        console.log(`    ${c.id}`)
      }
      console.log(`\n  Be more specific: designkit add ${results[0].id}\n`)
      process.exit(1)
    }
  }

  // Ensure output dir exists
  if (!existsSync(output)) {
    mkdirSync(output, { recursive: true })
  }

  const fileName = basename(component.file)
  const dest = join(output, fileName)
  copyFileSync(component.file, dest)

  console.log()
  console.log(`  ✓ Added: ${component.name}`)
  console.log(`    From:  ${component.relativePath}`)
  console.log(`    To:    ${dest}`)
  console.log()
  console.log(`  Open ${fileName} in a browser to preview.`)
  console.log(`  Make sure --kit-* tokens are defined in your CSS.`)
  console.log(`  Run "designkit init" to get a tokens.css file.`)
  console.log()
}
