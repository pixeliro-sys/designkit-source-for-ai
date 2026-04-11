import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { getApiKey } from './config.js'

/**
 * Strip markdown code fences from AI output.
 * Handles: ```html ... ```, ```jsx ... ```, ``` ... ```, etc.
 */
export function stripCodeFences(text) {
  const match = text.match(/^```[\w-]*\n([\s\S]*?)```\s*$/m)
  if (match) return match[1]
  // Multiple blocks — take the largest one
  const blocks = [...text.matchAll(/```[\w-]*\n([\s\S]*?)```/g)]
  if (blocks.length) {
    return blocks.reduce((a, b) => a[1].length > b[1].length ? a : b)[1]
  }
  return text
}

export const PROVIDERS = {
  anthropic: {
    envKey: 'ANTHROPIC_API_KEY',
    model: 'claude-opus-4-6',
    label: 'Claude (Anthropic)'
  },
  gemini: {
    envKey: 'GEMINI_API_KEY',
    model: 'gemini-2.5-pro-preview-03-25',
    label: 'Gemini (Google)'
  },
  openai: {
    envKey: 'OPENAI_API_KEY',
    model: 'gpt-4o',
    label: 'GPT-4o (OpenAI)'
  }
}

export function checkApiKey(provider) {
  const { envKey, label } = PROVIDERS[provider]
  const key = process.env[envKey] || getApiKey(provider)
  if (!key) {
    console.error(`Error: ${envKey} is required for ${label}`)
    console.error(`Set it with: export ${envKey}=your_key_here`)
    console.error(`Or: designkit config set ${provider === 'anthropic' ? 'anthropicKey' : provider === 'gemini' ? 'geminiKey' : 'openaiKey'} your_key_here`)
    process.exit(1)
  }
  return key
}

/**
 * Stream text generation — calls onText(chunk) for each token
 * Returns full output string
 */
export async function streamText({ provider, systemPrompt, userMessage, onText }) {
  const apiKey = checkApiKey(provider)
  let fullOutput = ''

  if (provider === 'anthropic') {
    const client = new Anthropic({ apiKey })
    const stream = client.messages.stream({
      model: PROVIDERS.anthropic.model,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
    stream.on('text', (text) => {
      onText(text)
      fullOutput += text
    })
    await stream.finalMessage()

  } else if (provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey })
    const result = await ai.models.generateContentStream({
      model: PROVIDERS.gemini.model,
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      config: { systemInstruction: systemPrompt }
    })
    for await (const chunk of result) {
      const text = chunk.text()
      if (text) {
        onText(text)
        fullOutput += text
      }
    }

  } else if (provider === 'openai') {
    const client = new OpenAI({ apiKey })
    const stream = await client.chat.completions.create({
      model: PROVIDERS.openai.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      stream: true
    })
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      if (text) {
        onText(text)
        fullOutput += text
      }
    }
  }

  return fullOutput
}
