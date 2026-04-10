import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const DALLE_MODEL = 'dall-e-3'

const PROVIDERS = {
  gemini: { envKey: 'GEMINI_API_KEY', label: 'Gemini (Google)' },
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

const GEMINI_MODELS = [
  { model: 'gemini-2.5-flash-image',          type: 'gemini', note: 'Default — fast, good quality' },
  { model: 'gemini-3.1-flash-image-preview',  type: 'gemini', note: 'Newer flash preview' },
  { model: 'gemini-3-pro-image-preview',      type: 'gemini', note: 'Pro quality' },
  { model: 'imagen-4.0-fast-generate-001',    type: 'imagen', note: 'Imagen 4 Fast' },
  { model: 'imagen-4.0-generate-001',         type: 'imagen', note: 'Imagen 4 — high quality' },
  { model: 'imagen-4.0-ultra-generate-001',   type: 'imagen', note: 'Imagen 4 Ultra — best quality' },
]

export async function imagineCommand(prompt = '', options) {
  const provider = options.provider || 'gemini'
  const validProviders = Object.keys(PROVIDERS)

  // --list-models: show available models and exit
  if (options.listModels) {
    console.log('\nGemini image models:\n')
    console.log('  ' + 'Model'.padEnd(42) + 'Notes')
    console.log('  ' + '─'.repeat(60))
    for (const m of GEMINI_MODELS) {
      console.log(`  ${m.model.padEnd(42)}${m.note}`)
    }
    console.log('\nOpenAI image models:\n')
    console.log('  dall-e-3                                  Standard or HD quality')
    console.log('\nUsage:')
    console.log('  designkit imagine "prompt" --model imagen-4.0-ultra-generate-001')
    console.log('')
    return
  }

  if (!prompt) {
    console.error('Error: prompt is required')
    console.error('Usage: designkit imagine "your prompt" [options]')
    console.error('       designkit imagine --list-models')
    process.exit(1)
  }

  if (!validProviders.includes(provider)) {
    console.error(`Error: Unknown provider "${provider}". Available: ${validProviders.join(', ')}`)
    process.exit(1)
  }

  const apiKey = checkApiKey(provider)
  const count = Math.min(Math.max(parseInt(options.count) || 1, 1), 4)
  const outputDir = resolve(options.output || '.')

  if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

  if (provider === 'gemini') {
    const model = options.model || 'gemini-2.5-flash-image'
    console.error(`\nModel: ${model}`)
    console.error(`Prompt: ${prompt}`)
    console.error(`Count: ${count}`)
    console.error(`Output: ${outputDir}\n`)

    // imagen-* models use generateImages API
    // gemini-* models use generateContent with responseModalities
    if (model.startsWith('imagen')) {
      await generateWithImagen({ apiKey, model, prompt, count, outputDir, options })
    } else {
      await generateWithGeminiFlash({ apiKey, model, prompt, count, outputDir, options })
    }
  } else if (provider === 'openai') {
    console.error(`\nModel: ${DALLE_MODEL}`)
    console.error(`Prompt: ${prompt}`)
    console.error(`Count: ${count}`)
    console.error(`Output: ${outputDir}\n`)
    await generateWithOpenAI({ apiKey, prompt, count, outputDir, options })
  }
}

// gemini-2.5-flash, gemini-2.0-flash-exp-image-generation, etc.
async function generateWithGeminiFlash({ apiKey, model, prompt, count, outputDir, options }) {
  const ai = new GoogleGenAI({ apiKey })
  console.error(`Generating images...`)

  const saved = []
  for (let i = 0; i < count; i++) {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ['image', 'text'],
      }
    })

    const parts = response.candidates?.[0]?.content?.parts || []
    const imagePart = parts.find(p => p.inlineData?.mimeType?.startsWith('image/'))

    if (!imagePart?.inlineData?.data) {
      console.error(`Warning: No image in response ${i + 1}`)
      continue
    }

    const ext = imagePart.inlineData.mimeType === 'image/jpeg' ? 'jpg' : 'png'
    const filename = count === 1
      ? `${options.name || 'image'}.${ext}`
      : `${options.name || 'image'}-${i + 1}.${ext}`

    const outputPath = resolve(outputDir, filename)
    const buffer = Buffer.from(imagePart.inlineData.data, 'base64')
    writeFileSync(outputPath, buffer)
    saved.push(outputPath)
    console.error(`Saved: ${outputPath}`)
  }

  console.error(`\nDone — ${saved.length} image(s) generated`)
}

// imagen-3.0-generate-002
async function generateWithImagen({ apiKey, model, prompt, count, outputDir, options }) {
  const ai = new GoogleGenAI({ apiKey })

  const config = {
    numberOfImages: count,
    outputMimeType: 'image/png'
  }

  if (options.aspect) config.aspectRatio = options.aspect

  console.error(`Generating images...`)

  const response = await ai.models.generateImages({ model, prompt, config })
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
      ? `${options.name || 'image'}.png`
      : `${options.name || 'image'}-${i + 1}.png`

    const outputPath = resolve(outputDir, filename)
    writeFileSync(outputPath, Buffer.from(imageData, 'base64'))
    saved.push(outputPath)
    console.error(`Saved: ${outputPath}`)
  }

  console.error(`\nDone — ${saved.length} image(s) generated`)
}

async function generateWithOpenAI({ apiKey, prompt, count, outputDir, options }) {
  const client = new OpenAI({ apiKey })
  const size = options.size || '1024x1024'
  const quality = options.quality || 'standard'

  console.error(`Generating images...`)

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
      ? `${options.name || 'image'}.png`
      : `${options.name || 'image'}-${i + 1}.png`

    const outputPath = resolve(outputDir, filename)
    writeFileSync(outputPath, Buffer.from(imageData, 'base64'))
    saved.push(outputPath)
    console.error(`Saved: ${outputPath}`)
  }

  console.error(`\nDone — ${saved.length} image(s) generated`)
}
