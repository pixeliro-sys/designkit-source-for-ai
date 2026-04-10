import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { streamText, PROVIDERS, stripCodeFences } from '../lib/providers.js'
import { loadProjectConfig, buildProjectContext } from './project.js'

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
  const skill = options.skill || 'design'
  const provider = options.provider || 'anthropic'
  const validSkills = ['design', 'react', 'nextjs', 'vue', 'svelte', 'tailwind', 'flutter', 'swiftui', 'react-native']
  const validProviders = Object.keys(PROVIDERS)

  if (!validProviders.includes(provider)) {
    console.error(`Error: Unknown provider "${provider}". Available: ${validProviders.join(', ')}`)
    process.exit(1)
  }

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

  const projectConfig = loadProjectConfig()
  const projectContext = buildProjectContext(projectConfig)

  const systemParts = [agentContext, '---', `# Active Skill: ${skill}`, skillContent]
  if (projectContext) systemParts.push('---', projectContext)
  const systemPrompt = systemParts.join('\n\n')

  console.error(`\nProvider: ${PROVIDERS[provider].label}`)
  console.error(`Skill: ${skill}`)
  if (projectConfig) console.error(`Project: ${projectConfig.name || projectConfig.framework || 'detected'}`)
  console.error(`Prompt: ${prompt}\n`)

  const outputFile = options.output
  if (outputFile) {
    const dir = resolve(dirname(outputFile))
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  }

  const fullOutput = await streamText({
    provider,
    systemPrompt,
    userMessage: prompt,
    onText: (text) => process.stdout.write(text)
  })

  if (outputFile) {
    writeFileSync(resolve(outputFile), stripCodeFences(fullOutput), 'utf8')
    console.error(`\n\nSaved to: ${outputFile}`)
  } else {
    process.stdout.write('\n')
  }
}
