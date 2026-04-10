import { readConfig, setConfigValue } from '../lib/config.js'

export function configCommand(action, args, options) {
  // designkit config list  (or just: designkit config)
  if (!action || action === 'list') {
    const config = readConfig()
    console.log('\nDesignKit config  (~/.designkit/config.json)\n')
    console.log(`  provider  ${config.provider}`)
    console.log(`  platform  ${config.platform}`)
    console.log()
    return
  }

  // designkit config get <key>
  if (action === 'get') {
    const key = args[0]
    if (!key) {
      console.error('Usage: designkit config get <key>')
      process.exit(1)
    }
    const config = readConfig()
    if (!(key in config)) {
      console.error(`Unknown key: "${key}"`)
      process.exit(1)
    }
    console.log(config[key])
    return
  }

  // designkit config set <key> <value>
  if (action === 'set') {
    const key = args[0]
    const value = args[1]
    if (!key || !value) {
      console.error('Usage: designkit config set <key> <value>')
      console.error('  Keys:  provider, platform')
      console.error('  Examples:')
      console.error('    designkit config set provider gemini')
      console.error('    designkit config set provider anthropic')
      console.error('    designkit config set platform web')
      process.exit(1)
    }
    try {
      setConfigValue(key, value)
      console.log(`✓ Set ${key} = ${value}`)
    } catch (err) {
      console.error(`Error: ${err.message}`)
      process.exit(1)
    }
    return
  }

  console.error(`Unknown subcommand: "${action}". Use: list, get, set`)
  process.exit(1)
}
