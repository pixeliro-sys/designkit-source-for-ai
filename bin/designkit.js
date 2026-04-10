#!/usr/bin/env node
import { program } from 'commander'
import { listCommand } from '../src/commands/list.js'
import { addCommand } from '../src/commands/add.js'
import { initCommand } from '../src/commands/init.js'
import { searchCommand } from '../src/commands/search.js'
import { designCommand } from '../src/commands/design.js'
import { convertCommand } from '../src/commands/convert.js'
import { imagineCommand } from '../src/commands/imagine.js'
import { projectCommand } from '../src/commands/project.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'))

program
  .name('designkit')
  .description('502 HTML UI components + AI skills for designing and building apps')
  .version(pkg.version)

program
  .command('list')
  .description('Browse available components')
  .option('-k, --kit <kit>', 'Filter by kit: web, app-mobile, common')
  .option('-c, --category <category>', 'Filter by category (e.g. cards, buttons)')
  .action(listCommand)

program
  .command('add <component>')
  .description('Copy a component to your project')
  .option('-o, --output <dir>', 'Output directory', '.')
  .action(addCommand)

program
  .command('search <query>')
  .description('Search components by name or tag')
  .option('-k, --kit <kit>', 'Filter by kit: web, app-mobile, common')
  .action(searchCommand)

program
  .command('init')
  .description('Add DesignKit tokens to your project')
  .option('-o, --output <dir>', 'Output directory', '.')
  .option('--format <format>', 'Output format: css, js, ts, json', 'css')
  .action(initCommand)

program
  .command('design <prompt>')
  .description('Generate a UI component with AI')
  .option('-s, --skill <skill>', 'Skill: design, react, nextjs, vue, svelte, tailwind, flutter, swiftui, react-native', 'design')
  .option('-p, --provider <provider>', 'AI provider: anthropic, gemini, openai', 'anthropic')
  .option('-o, --output <file>', 'Save output to file')
  .action(designCommand)

program
  .command('convert <file>')
  .description('Convert an HTML component to another framework with AI')
  .requiredOption('--to <framework>', 'Target: react, nextjs, vue, svelte, tailwind, flutter, swiftui, react-native')
  .option('-p, --provider <provider>', 'AI provider: anthropic, gemini, openai', 'anthropic')
  .option('-o, --output <file>', 'Save output to file (default: same name, new extension)')
  .action(convertCommand)

program
  .command('project')
  .description('Scan your project and save conventions to designkit.config.json')
  .option('--notes <text>', 'Add custom notes to the config (e.g. "use Zustand for state")')
  .option('--show', 'Print current designkit.config.json')
  .action(projectCommand)

program
  .command('imagine <prompt>')
  .description('Generate an image with AI (Gemini Imagen 3 or DALL-E 3)')
  .option('-p, --provider <provider>', 'AI provider: gemini, openai', 'gemini')
  .option('-o, --output <dir>', 'Output directory', '.')
  .option('-n, --name <name>', 'Output filename (without extension)', 'image')
  .option('-c, --count <n>', 'Number of images to generate (1–4)', '1')
  .option('--aspect <ratio>', 'Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4', '1:1')
  .option('--size <size>', 'DALL-E size: 1024x1024, 1792x1024, 1024x1792', '1024x1024')
  .option('--quality <quality>', 'DALL-E quality: standard, hd', 'standard')
  .action(imagineCommand)

program.parse()
