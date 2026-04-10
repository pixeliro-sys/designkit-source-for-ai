import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve, extname, basename } from 'path'
import { streamText, PROVIDERS, stripCodeFences } from '../lib/providers.js'
import { loadProjectConfig, buildProjectContext } from './project.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../')

const FRAMEWORK_EXTENSIONS = {
  react: '.jsx',
  nextjs: '.jsx',
  vue: '.vue',
  svelte: '.svelte',
  tailwind: '.html',
  flutter: '.dart',
  swiftui: '.swift',
  'react-native': '.jsx'
}

function loadSkill(name) {
  const skillPath = join(ROOT, 'skills', `${name}.md`)
  if (!existsSync(skillPath)) return ''
  return readFileSync(skillPath, 'utf8')
}

function loadAgentContext() {
  const agentPath = join(ROOT, 'AI-AGENT.md')
  if (!existsSync(agentPath)) return ''
  return readFileSync(agentPath, 'utf8')
}

export async function convertCommand(file, options) {
  const framework = options.to
  const provider = options.provider || 'anthropic'
  const validProviders = Object.keys(PROVIDERS)

  if (!validProviders.includes(provider)) {
    console.error(`Error: Unknown provider "${provider}". Available: ${validProviders.join(', ')}`)
    process.exit(1)
  }

  if (!framework) {
    console.error('Error: --to <framework> is required')
    console.error('Available: react, nextjs, vue, svelte, tailwind, flutter, swiftui, react-native')
    process.exit(1)
  }

  if (!FRAMEWORK_EXTENSIONS[framework]) {
    console.error(`Error: Unknown framework "${framework}"`)
    console.error(`Available: ${Object.keys(FRAMEWORK_EXTENSIONS).join(', ')}`)
    process.exit(1)
  }

  const inputPath = resolve(file)
  if (!existsSync(inputPath)) {
    console.error(`Error: File not found: ${file}`)
    process.exit(1)
  }

  const htmlContent = readFileSync(inputPath, 'utf8')
  const agentContext = loadAgentContext()
  const skillContent = loadSkill(framework)

  if (!skillContent) {
    console.error(`Error: Skill file not found: skills/${framework}.md`)
    process.exit(1)
  }

  const projectConfig = loadProjectConfig()
  const projectContext = buildProjectContext(projectConfig)

  const systemParts = [agentContext, '---', `# Active Skill: ${framework} (Convert mode)`, skillContent]
  if (projectContext) systemParts.push('---', projectContext)
  const systemPrompt = systemParts.join('\n\n')
  const userMessage = `Convert the following HTML component to ${framework}.\n\nFollow the Convert mode instructions in the skill above.\n\n\`\`\`html\n${htmlContent}\n\`\`\``

  console.error(`\nProvider: ${PROVIDERS[provider].label}`)
  console.error(`Converting: ${file}`)
  console.error(`Framework: ${framework}\n`)

  let outputPath = options.output
  if (!outputPath) {
    const name = basename(inputPath, extname(inputPath))
    const ext = FRAMEWORK_EXTENSIONS[framework]
    outputPath = resolve(dirname(inputPath), `${name}${ext}`)
  } else {
    outputPath = resolve(outputPath)
  }

  const dir = dirname(outputPath)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

  const fullOutput = await streamText({
    provider,
    systemPrompt,
    userMessage,
    onText: (text) => process.stdout.write(text)
  })

  writeFileSync(outputPath, stripCodeFences(fullOutput), 'utf8')
  console.error(`\n\nSaved to: ${outputPath}`)
}
