#!/usr/bin/env node
/**
 * Template Platform — Setup Wizard
 *
 * Initializes a new project from the template:
 *   1. Prompts for project identity, Supabase config, branding
 *   2. Renames @template namespace to @{org}
 *   3. Generates .env files from templates
 *   4. Cleans template artifacts
 *   5. Initializes git with clean history
 *
 * Usage:
 *   pnpm run setup                          # Interactive mode
 *   pnpm run setup --config setup.json      # Non-interactive mode
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'fs'
import { join, relative, extname } from 'path'
import { execSync } from 'child_process'
import { createInterface } from 'readline'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')

// ============================================================================
// CLI Args
// ============================================================================
const args = process.argv.slice(2)
const configFlag = args.indexOf('--config')
const configPath = configFlag !== -1 ? args[configFlag + 1] : null

// ============================================================================
// Prompt helpers (zero-dependency)
// ============================================================================
const rl = createInterface({ input: process.stdin, output: process.stdout })

function ask(question, defaultVal = '') {
  return new Promise(resolve => {
    const suffix = defaultVal ? ` (${defaultVal})` : ''
    rl.question(`  ${question}${suffix}: `, answer => {
      resolve(answer.trim() || defaultVal)
    })
  })
}

function askChoice(question, options) {
  return new Promise(resolve => {
    console.log(`  ${question}`)
    options.forEach((opt, i) => console.log(`    ${i + 1}. ${opt}`))
    rl.question(`  Escolha [1-${options.length}]: `, answer => {
      const idx = parseInt(answer) - 1
      resolve(options[Math.max(0, Math.min(idx, options.length - 1))])
    })
  })
}

// ============================================================================
// Config collection
// ============================================================================
async function collectConfig() {
  if (configPath) {
    console.log(`\n  Lendo configuracao de: ${configPath}`)
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  }

  console.log('\n  ╔══════════════════════════════════════════╗')
  console.log('  ║   Template Platform — Setup Wizard       ║')
  console.log('  ║   Factory H v2.0                         ║')
  console.log('  ╚══════════════════════════════════════════╝\n')

  const projectName = await ask('Nome do projeto (kebab-case)', 'meu-projeto')
  const namespace = await ask('Namespace da org (@org)', '@template')
  const appName = await ask('Nome de exibicao do app', 'Meu Projeto')

  console.log('\n  --- Supabase ---')
  const supabaseUrl = await ask('Supabase URL', '')
  const supabaseAnonKey = await ask('Supabase Anon Key', '')
  const supabaseServiceKey = await ask('Supabase Service Role Key (server only)', '')

  console.log('\n  --- Autenticacao ---')
  const authProvider = await askChoice('Provedor de auth:', ['supabase', 'keycloak'])

  console.log('\n  --- Branding ---')
  const primaryColor = await ask('Cor primaria (hex)', '#14b8a6')
  const secondaryColor = await ask('Cor secundaria (hex)', '#0e7490')
  const logoUrl = await ask('URL/path do logo', '/logo.svg')

  console.log('\n  --- Git ---')
  const gitRemote = await ask('Git remote URL (deixe vazio para pular)', '')

  rl.close()

  return {
    projectName,
    namespace,
    appName,
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    authProvider,
    primaryColor,
    secondaryColor,
    logoUrl,
    gitRemote,
  }
}

// ============================================================================
// File transformation
// ============================================================================
const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.yaml', '.yml', '.toml', '.md',
  '.css', '.html', '.env', '.example', '.template',
  '.sh', '.ps1', '.py', '.ini', '.cfg', '.conf',
])

function isTextFile(filePath) {
  const ext = extname(filePath).toLowerCase()
  const basename = filePath.split(/[\\/]/).pop()
  return TEXT_EXTENSIONS.has(ext) ||
    basename === 'Dockerfile' ||
    basename === '.gitignore' ||
    basename === '.dockerignore' ||
    basename === '.prettierrc' ||
    basename === '.eslintrc.cjs'
}

function walkDir(dir, callback) {
  const skipDirs = new Set(['node_modules', '.git', 'dist', '.next', '.venv', 'htmlcov', '.pytest_cache'])
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      if (!skipDirs.has(entry)) walkDir(fullPath, callback)
    } else {
      callback(fullPath)
    }
  }
}

function replaceInFile(filePath, replacements) {
  if (!isTextFile(filePath)) return false
  let content
  try {
    content = readFileSync(filePath, 'utf-8')
  } catch { return false }

  let changed = false
  for (const [search, replace] of replacements) {
    if (content.includes(search)) {
      content = content.replaceAll(search, replace)
      changed = true
    }
  }
  if (changed) writeFileSync(filePath, content, 'utf-8')
  return changed
}

// ============================================================================
// Generate .env from template
// ============================================================================
function generateEnvFile(templatePath, outputPath, vars) {
  if (!existsSync(templatePath)) return
  let content = readFileSync(templatePath, 'utf-8')
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value || '')
  }
  writeFileSync(outputPath, content, 'utf-8')
  console.log(`  ✓ Gerado: ${relative(ROOT, outputPath)}`)
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  const config = await collectConfig()
  const { projectName, namespace, appName, supabaseUrl, supabaseAnonKey,
    supabaseServiceKey, authProvider, primaryColor, secondaryColor,
    logoUrl, gitRemote } = config

  console.log('\n  ── Aplicando configuracao... ──\n')

  // 1. Global namespace replace
  if (namespace !== '@template') {
    console.log(`  Renomeando @template → ${namespace}`)
    let fileCount = 0
    walkDir(ROOT, (filePath) => {
      const replaced = replaceInFile(filePath, [
        ['@template/', `${namespace}/`],
        ['@template/platform', `${namespace}/${projectName}`],
        ['"@template/web"', `"${namespace}/web"`],
        ['"@template/shared"', `"${namespace}/shared"`],
        ['"@template/types"', `"${namespace}/types"`],
        ['"@template/design-system"', `"${namespace}/design-system"`],
      ])
      if (replaced) fileCount++
    })
    console.log(`  ✓ ${fileCount} arquivos atualizados`)
  }

  // 2. Replace app identity
  console.log(`  Configurando identidade: ${appName}`)
  walkDir(ROOT, (filePath) => {
    replaceInFile(filePath, [
      ['Template Platform', appName],
      ['template-platform', projectName],
    ])
  })

  // 3. Generate .env files
  console.log('\n  Gerando .env files...')
  const envVars = {
    projectName, namespace, appName,
    supabaseUrl, supabaseAnonKey, supabaseServiceKey,
    authProvider: authProvider || 'supabase',
    primaryColor, secondaryColor, logoUrl,
  }

  generateEnvFile(
    join(ROOT, 'apps/web-next/.env.template'),
    join(ROOT, 'apps/web-next/.env.local'),
    envVars
  )
  generateEnvFile(
    join(ROOT, '.env.template'),
    join(ROOT, '.env'),
    envVars
  )

  // 4. Update Supabase config
  const supabaseConfig = join(ROOT, 'supabase/config.toml')
  if (existsSync(supabaseConfig) && supabaseUrl) {
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0] || ''
    replaceInFile(supabaseConfig, [
      ['id = ""', `id = "${projectId}"`],
    ])
    console.log(`  ✓ Supabase config atualizado (project: ${projectId})`)
  }

  // 5. Run pnpm install
  console.log('\n  Instalando dependencias...')
  try {
    execSync('pnpm install --frozen-lockfile', { cwd: ROOT, stdio: 'inherit' })
    console.log('  ✓ Dependencias instaladas')
  } catch {
    console.log('  ⚠ pnpm install falhou (pnpm-lock.yaml pode precisar de update)')
    try {
      execSync('pnpm install', { cwd: ROOT, stdio: 'inherit' })
    } catch (e) {
      console.log(`  ✗ Erro: ${e.message}`)
    }
  }

  // 6. Initialize git
  console.log('\n  Inicializando git...')
  try {
    execSync('git init', { cwd: ROOT, stdio: 'pipe' })
    execSync('git add -A', { cwd: ROOT, stdio: 'pipe' })
    execSync(`git commit -m "chore: init ${appName} from Factory H template v2.0"`, { cwd: ROOT, stdio: 'pipe' })
    console.log('  ✓ Repositorio inicializado com commit inicial')

    if (gitRemote) {
      execSync(`git remote add origin ${gitRemote}`, { cwd: ROOT, stdio: 'pipe' })
      console.log(`  ✓ Remote configurado: ${gitRemote}`)
    }
  } catch (e) {
    console.log(`  ⚠ Git: ${e.message?.split('\n')[0] || 'ja inicializado'}`)
  }

  // Done
  console.log('\n  ╔══════════════════════════════════════════╗')
  console.log(`  ║   ${appName} configurado com sucesso!`)
  console.log('  ╠══════════════════════════════════════════╣')
  console.log('  ║   Proximos passos:                       ║')
  console.log('  ║   1. cd apps/web-next && pnpm dev        ║')
  console.log('  ║   2. Acesse http://localhost:3000         ║')
  console.log('  ╚══════════════════════════════════════════╝\n')
}

main().catch(err => {
  console.error('\n  ✗ Setup falhou:', err.message)
  process.exit(1)
})
