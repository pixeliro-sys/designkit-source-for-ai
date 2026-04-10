import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { glob } from 'fs/promises'

const CONFIG_FILE = 'designkit.config.json'

export function loadProjectConfig(cwd = process.cwd()) {
  const configPath = join(cwd, CONFIG_FILE)
  if (!existsSync(configPath)) return null
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'))
  } catch {
    return null
  }
}

export function buildProjectContext(config) {
  if (!config) return ''

  const lines = ['# Project Context (read this carefully before generating any code)']

  if (config.name) lines.push(`Project: ${config.name}`)
  if (config.framework) lines.push(`Framework: ${config.framework}`)
  if (config.language) lines.push(`Language: ${config.language}`)
  if (config.styling) lines.push(`Styling: ${config.styling}`)
  if (config.componentDir) lines.push(`Component directory: ${config.componentDir}`)
  if (config.pageDir) lines.push(`Page/route directory: ${config.pageDir}`)

  if (config.conventions?.length) {
    lines.push('\n## Conventions')
    config.conventions.forEach(c => lines.push(`- ${c}`))
  }

  if (config.dependencies?.length) {
    lines.push('\n## Key dependencies')
    config.dependencies.forEach(d => lines.push(`- ${d}`))
  }

  if (config.notes) {
    lines.push('\n## Notes')
    lines.push(config.notes)
  }

  if (config.context) {
    lines.push('\n## Additional context')
    lines.push(config.context)
  }

  lines.push('\nGenerate code that matches these conventions exactly. Do not introduce libraries not listed above.')

  return lines.join('\n')
}

export async function projectCommand(options) {
  const cwd = process.cwd()

  if (options.show) {
    const config = loadProjectConfig(cwd)
    if (!config) {
      console.log('No designkit.config.json found. Run: designkit project init')
    } else {
      console.log(JSON.stringify(config, null, 2))
    }
    return
  }

  console.log('Scanning project...\n')

  const config = {}

  // Read package.json
  const pkgPath = join(cwd, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    config.name = pkg.name
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }

    // Detect framework
    if (deps['next']) config.framework = 'nextjs'
    else if (deps['nuxt'] || deps['nuxt3']) config.framework = 'nuxt'
    else if (deps['@sveltejs/kit']) config.framework = 'sveltekit'
    else if (deps['react']) config.framework = 'react'
    else if (deps['vue']) config.framework = 'vue'
    else if (deps['svelte']) config.framework = 'svelte'
    else if (deps['expo']) config.framework = 'react-native (expo)'
    else if (deps['react-native']) config.framework = 'react-native'

    // Detect styling
    if (deps['tailwindcss']) config.styling = 'tailwind'
    else if (deps['styled-components']) config.styling = 'styled-components'
    else if (deps['@emotion/react']) config.styling = 'emotion'
    else if (deps['sass'] || deps['node-sass']) config.styling = 'scss modules'
    else config.styling = 'css modules'

    // Detect notable deps
    const notable = ['zustand', 'jotai', 'mobx', 'redux', 'react-query', '@tanstack/react-query',
      'axios', 'swr', 'zod', 'framer-motion', 'radix-ui', '@radix-ui/react-dialog',
      'shadcn', '@shadcn/ui', 'lucide-react', 'react-hook-form', 'prisma']
    config.dependencies = notable.filter(d => deps[d] || Object.keys(deps).some(k => k.includes(d)))
  }

  // Detect TypeScript
  if (existsSync(join(cwd, 'tsconfig.json'))) {
    config.language = 'TypeScript'
  } else {
    config.language = 'JavaScript'
  }

  // Detect component directory
  const componentDirs = ['src/components', 'components', 'app/components', 'src/ui', 'src/shared/components']
  for (const dir of componentDirs) {
    if (existsSync(join(cwd, dir))) {
      config.componentDir = dir
      break
    }
  }

  // Detect page/route directory
  const pageDirs = ['src/app', 'app', 'src/pages', 'pages', 'src/routes', 'routes']
  for (const dir of pageDirs) {
    if (existsSync(join(cwd, dir))) {
      config.pageDir = dir
      break
    }
  }

  // Detect naming convention from existing components
  if (config.componentDir && existsSync(join(cwd, config.componentDir))) {
    const conventions = []

    // Check for index barrel pattern
    if (existsSync(join(cwd, config.componentDir, 'index.ts')) ||
        existsSync(join(cwd, config.componentDir, 'index.js'))) {
      conventions.push('Uses barrel exports (index.ts)')
    }

    // Check for PascalCase components
    conventions.push('Component files use PascalCase (e.g. PricingCard.tsx)')

    if (config.language === 'TypeScript') {
      conventions.push('Use TypeScript interfaces for props, not type aliases')
      conventions.push(`File extension: .${config.framework === 'react' || config.framework === 'nextjs' ? 'tsx' : 'ts'}`)
    }

    if (config.styling === 'tailwind') {
      conventions.push('Use Tailwind utility classes, avoid inline styles')
      conventions.push('Use cn() or clsx() for conditional classes if available')
    } else if (config.styling === 'css modules') {
      conventions.push('Import styles from a co-located .module.css file')
    }

    if (config.framework === 'nextjs') {
      conventions.push(`Use '${config.pageDir?.startsWith('src/app') || config.pageDir === 'app' ? 'app router' : 'pages router'}' conventions`)
      conventions.push("Add 'use client' directive only when needed (event handlers, hooks)")
    }

    config.conventions = conventions
  }

  // Read existing DESIGNKIT.md or CLAUDE.md for extra context
  for (const file of ['DESIGNKIT.md', 'CLAUDE.md', '.cursorrules']) {
    if (existsSync(join(cwd, file))) {
      const content = readFileSync(join(cwd, file), 'utf8')
      config.context = `From ${file}:\n${content.slice(0, 2000)}`
      break
    }
  }

  // Print detected config
  console.log('Detected:')
  console.log(`  Framework:  ${config.framework || 'unknown'}`)
  console.log(`  Language:   ${config.language}`)
  console.log(`  Styling:    ${config.styling || 'unknown'}`)
  console.log(`  Components: ${config.componentDir || 'not found'}`)
  console.log(`  Pages:      ${config.pageDir || 'not found'}`)
  if (config.dependencies?.length) {
    console.log(`  Deps:       ${config.dependencies.join(', ')}`)
  }

  // Allow override via --notes
  if (options.notes) config.notes = options.notes

  const outputPath = join(cwd, CONFIG_FILE)
  writeFileSync(outputPath, JSON.stringify(config, null, 2), 'utf8')
  console.log(`\nSaved: ${CONFIG_FILE}`)
  console.log('\nNow run:')
  console.log(`  designkit design "your component" --skill ${config.framework || 'react'}`)
  console.log('  → AI will generate code matching your project conventions')
}
