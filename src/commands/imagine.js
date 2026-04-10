import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'

const IMAGEN_MODEL = 'imagen-3.0-generate-002'
const DALLE_MODEL = 'dall-e-3'

const PROVIDERS = {
  gemini: { envKey: 'GEMINI_API_KEY', label: 'Imagen 3 (Google Gemini)' },
  openai: { envKey: 'OPENAI_API_KEY', label: 'DALL-E 3 (OpenAI)' }
}

function checkApiKey(provider) {
  const { envKey, label } = PROVIDERS[provider]
  const key = process.env[envKey]
  if (!key) {
    console.error(`Error: ${envKey} is required for ${label}`)
    console.error(`Set it with: export ${envKey}=your_key_here`)
    process.exit(1)
  }
  return key
}

export async function imagineCommand(prompt, options) {
  const provider = options.provider || 'gemini'
  const validProviders = Object.keys(PROVIDERS)

  if (!validProviders.includes(provider)) {
    console.error(`Error: Unknown provider "${provider}". Available: ${validProviders.join(', ')}`)
    process.exit(1)
  }

  const apiKey = checkApiKey(provider)
  const count = Math.min(Math.max(parseInt(options.count) || 1, 1), 4)
  const outputDir = resolve(options.output || '.')

  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  console.error(`\nProvider: ${PROVIDERS[provider].label}`)
  console.error(`Prompt: ${prompt}`)
  console.error(`Count: ${count}`)
  console.error(`Output: ${outputDir}\n`)

  if (provider === 'gemini') {
    await generateWithGemini({ apiKey, prompt, count, outputDir, options })
  } else if (provider === 'openai') {
    await generateWithOpenAI({ apiKey, prompt, count, outputDir, options })
  }
}

async function generateWithGemini({ apiKey, prompt, count, outputDir, options }) {
  const ai = new GoogleGenAI({ apiKey })

  const config = {
    numberOfImages: count,
    outputMimeType: 'image/png'
  }

  if (options.width && options.height) {
    config.aspectRatio = getAspectRatio(parseInt(options.width), parseInt(options.height))
  } else if (options.aspect) {
    config.aspectRatio = options.aspect
  }

  console.error(`Generating with Imagen 3...`)

  const response = await ai.models.generateImages({
    model: IMAGEN_MODEL,
    prompt,
    config
  })

  const images = response.generatedImages || []
  if (!images.length) {
    console.error('Error: No images generated')
    process.exit(1)
  }

  const saved = []
  for (let i = 0; i < images.length; i++) {
    const imageData = images[i].image?.imageBytes
    if (!imageData) continue

    const filename = count === 1
      ? (options.name || 'image') + '.png'
      : `${options.name || 'image'}-${i + 1}.png`

    const outputPath = resolve(outputDir, filename)
    const buffer = Buffer.from(imageData, 'base64')
    writeFileSync(outputPath, buffer)
    saved.push(outputPath)
    console.error(`Saved: ${outputPath}`)
  }

  console.error(`\nDone — ${saved.length} image(s) generated`)
}

async function generateWithOpenAI({ apiKey, prompt, count, outputDir, options }) {
  const client = new OpenAI({ apiKey })

  const size = options.size || '1024x1024'
  const quality = options.quality || 'standard'

  console.error(`Generating with DALL-E 3...`)

  // DALL-E 3 only supports n=1 at a time
  const saved = []
  for (let i = 0; i < count; i++) {
    const response = await client.images.generate({
      model: DALLE_MODEL,
      prompt,
      n: 1,
      size,
      quality,
      response_format: 'b64_json'
    })

    const imageData = response.data[0]?.b64_json
    if (!imageData) continue

    const filename = count === 1
      ? (options.name || 'image') + '.png'
      : `${options.name || 'image'}-${i + 1}.png`

    const outputPath = resolve(outputDir, filename)
    const buffer = Buffer.from(imageData, 'base64')
    writeFileSync(outputPath, buffer)
    saved.push(outputPath)
    console.error(`Saved: ${outputPath}`)
  }

  console.error(`\nDone — ${saved.length} image(s) generated`)
}

function getAspectRatio(width, height) {
  const ratio = width / height
  if (ratio >= 1.7) return '16:9'
  if (ratio >= 1.3) return '4:3'
  if (ratio >= 0.95) return '1:1'
  if (ratio >= 0.7) return '3:4'
  return '9:16'
}
