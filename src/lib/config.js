import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

const CONFIG_DIR = join(homedir(), '.designkit')
const CONFIG_PATH = join(CONFIG_DIR, 'config.json')

const DEFAULTS = {
  provider: 'anthropic',
  platform: 'mobile',
  anthropicKey: '',
  geminiKey: '',
  openaiKey: ''
}

const VALID = {
  provider: ['anthropic', 'gemini', 'openai'],
  platform: ['mobile', 'web']
}

// Keys that can be set via setConfigValue (skip VALID check)
const KEY_FIELDS = ['anthropicKey', 'geminiKey', 'openaiKey']

export function readConfig() {
  if (!existsSync(CONFIG_PATH)) return { ...DEFAULTS }
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function writeConfig(config) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8')
}

export function getConfigValue(key) {
  return readConfig()[key]
}

export function setConfigValue(key, value) {
  if (!Object.keys(DEFAULTS).includes(key)) {
    throw new Error(`Unknown config key: "${key}". Valid keys: ${Object.keys(DEFAULTS).join(', ')}`)
  }
  if (!KEY_FIELDS.includes(key) && VALID[key] && !VALID[key].includes(value)) {
    throw new Error(`Invalid value "${value}" for "${key}". Valid values: ${VALID[key].join(', ')}`)
  }
  const config = readConfig()
  config[key] = value
  writeConfig(config)
}

export function getApiKey(provider) {
  const config = readConfig()
  const keyMap = { anthropic: 'anthropicKey', gemini: 'geminiKey', openai: 'openaiKey' }
  return config[keyMap[provider]] || null
}

export function getDefaultProvider() {
  return getConfigValue('provider') || 'anthropic'
}

export function getDefaultPlatform() {
  return getConfigValue('platform') || 'mobile'
}
