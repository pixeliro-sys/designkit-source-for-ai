import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../../')

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

export async function designCommand(prompt, options) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required')
    console.error('Set it with: export ANTHROPIC_API_KEY=your_key_here')
    process.exit(1)
  }

  const skill = options.skill || 'design'
  const validSkills = ['design', 'react', 'nextjs', 'vue', 'svelte', 'tailwind', 'flutter', 'swiftui', 'react-native']

  if (!validSkills.includes(skill)) {
    console.error(`Error: Unknown skill "${skill}". Available: ${validSkills.join(', ')}`)
    process.exit(1)
  }

  const agentContext = loadAgentContext()
  const skillContent = loadSkill(skill)

  if (!skillContent) {
    console.error(`Error: Skill file not found: skills/${skill}.md`)
    process.exit(1)
  }

  const systemPrompt = [
    agentContext,
    '---',
    `# Active Skill: ${skill}`,
    skillContent
  ].join('\n\n')

  const client = new Anthropic({ apiKey })

  console.error(`\nDesigning with skill: ${skill}`)
  console.error(`Prompt: ${prompt}\n`)

  const outputFile = options.output

  if (outputFile) {
    const dir = resolve(dirname(outputFile))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  let fullOutput = ''

  const stream = client.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 8000,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [
      { role: 'user', content: prompt }
    ]
  })

  stream.on('text', (text) => {
    process.stdout.write(text)
    fullOutput += text
  })

  await stream.finalMessage()

  if (outputFile) {
    writeFileSync(resolve(outputFile), fullOutput, 'utf8')
    console.error(`\n\nSaved to: ${outputFile}`)
  } else {
    process.stdout.write('\n')
  }
}
