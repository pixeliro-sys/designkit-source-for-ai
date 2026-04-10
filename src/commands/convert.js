import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve, extname, basename } from 'path'

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
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required')
    console.error('Set it with: export ANTHROPIC_API_KEY=your_key_here')
    process.exit(1)
  }

  const framework = options.to
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

  const systemPrompt = [
    agentContext,
    '---',
    `# Active Skill: ${framework} (Convert mode)`,
    skillContent
  ].join('\n\n')

  const userMessage = `Convert the following HTML component to ${framework}.\n\nFollow the Convert mode instructions in the skill above.\n\n\`\`\`html\n${htmlContent}\n\`\`\``

  const client = new Anthropic({ apiKey })

  console.error(`\nConverting: ${file}`)
  console.error(`Framework: ${framework}\n`)

  // Determine output path
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

  let fullOutput = ''

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ]
  })

  stream.on('text', (text) => {
    process.stdout.write(text)
    fullOutput += text
  })

  await stream.finalMessage()

  // Extract code block if present
  const codeMatch = fullOutput.match(/```(?:\w+)?\n([\s\S]*?)```/)
  const codeToWrite = codeMatch ? codeMatch[1] : fullOutput

  writeFileSync(outputPath, codeToWrite, 'utf8')
  console.error(`\n\nSaved to: ${outputPath}`)
}
