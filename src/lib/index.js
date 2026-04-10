import { readdirSync, readFileSync, existsSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../')
const COMPONENTS_DIR = join(ROOT, 'components')

const KITS = ['web', 'app-mobile', 'common']

/**
 * Parse @metadata from HTML comment header
 */
function parseMeta(html) {
  const meta = {}
  const match = html.match(/<!--([\s\S]*?)-->/)
  if (!match) return meta
  const block = match[1]
  for (const line of block.split('\n')) {
    const m = line.match(/@(\w+):\s*(.+)/)
    if (m) meta[m[1].trim()] = m[2].trim()
  }
  return meta
}

/**
 * Build full component index from components/ directory
 */
export function buildIndex() {
  const components = []

  for (const kit of KITS) {
    const kitDir = join(COMPONENTS_DIR, kit)
    if (!existsSync(kitDir)) continue

    const categories = readdirSync(kitDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const category of categories) {
      const catDir = join(kitDir, category)
      const files = readdirSync(catDir).filter(f => f.endsWith('.html'))

      for (const file of files) {
        const filePath = join(catDir, file)
        const html = readFileSync(filePath, 'utf8')
        const meta = parseMeta(html)
        const name = meta.name || basename(file, '.html')
        const tags = meta.tags ? meta.tags.split(',').map(t => t.trim()) : []

        components.push({
          id: `${kit}/${category}/${basename(file, '.html')}`,
          name,
          kit: meta.kit || kit,
          category: meta.category || category,
          width: meta.width ? parseInt(meta.width) : null,
          height: meta.height ? parseInt(meta.height) : null,
          tags,
          file: filePath,
          relativePath: `components/${kit}/${category}/${file}`,
        })
      }
    }
  }

  return components
}

/**
 * Get component by id (kit/category/name)
 */
export function getComponent(id) {
  const index = buildIndex()
  return index.find(c => c.id === id || c.id.endsWith(`/${id}`) || c.name.toLowerCase() === id.toLowerCase())
}

/**
 * Filter components
 */
export function filterComponents(components, { kit, category } = {}) {
  return components.filter(c => {
    if (kit && c.kit !== kit) return false
    if (category && c.category !== category) return false
    return true
  })
}

/**
 * Search components by query (name + tags)
 */
export function searchComponents(components, query) {
  const q = query.toLowerCase()
  return components.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    c.tags.some(t => t.includes(q))
  )
}

export { ROOT, COMPONENTS_DIR, KITS }
