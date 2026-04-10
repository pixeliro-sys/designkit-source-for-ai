#!/usr/bin/env node
import { program } from 'commander'
import { listCommand } from '../src/commands/list.js'
import { addCommand } from '../src/commands/add.js'
import { initCommand } from '../src/commands/init.js'
import { searchCommand } from '../src/commands/search.js'
import { designCommand } from '../src/commands/design.js'
import { convertCommand } from '../src/commands/convert.js'
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
  .description('Generate a UI component with AI (requires ANTHROPIC_API_KEY)')
  .option('-s, --skill <skill>', 'Skill to use: design, react, nextjs, vue, svelte, tailwind, flutter, swiftui, react-native', 'design')
  .option('-o, --output <file>', 'Save output to file')
  .action(designCommand)

program
  .command('convert <file>')
  .description('Convert an HTML component to another framework with AI (requires ANTHROPIC_API_KEY)')
  .requiredOption('--to <framework>', 'Target framework: react, nextjs, vue, svelte, tailwind, flutter, swiftui, react-native')
  .option('-o, --output <file>', 'Save output to file (default: same name, new extension)')
  .action(convertCommand)

program.parse()
