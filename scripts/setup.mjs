#!/usr/bin/env node
/**
 * Template Platform — Setup Wizard v3.0
 *
 * Initializes a new project from the template:
 *   1. Prompts for project identity, Supabase config, branding
 *   2. Renames @template namespace to @{org}
 *   3. [NOVO] Seleção interativa de módulos starter
 *   4. [NOVO] Copia módulos selecionados (manifests + pages + API routes)
 *   5. [NOVO] Copia migrations SQL dos módulos
 *   6. Gera .env files completos
 *   7. Inicializa git com commit inicial limpo
 *
 * Usage:
 *   pnpm run setup                          # Interactive mode
 *   pnpm run setup --config setup.json      # Non-interactive mode
 */
import {
  readFileSync, writeFileSync, readdirSync, statSync,
  existsSync, mkdirSync, cpSync,
} from 'fs'
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

/**
 * Seleção múltipla — retorna array de opções escolhidas.
 * Entrada: "1,3,5" ou "1-4" ou "all" ou "none"
 */
function askMulti(question, options) {
  return new Promise(resolve => {
    console.log(`\n  ${question}`)
    options.forEach((opt, i) => console.log(`    ${i + 1}. ${opt.label}${opt.note ? `  (${opt.note})` : ''}`))
    console.log(`\n    Dicas: "all" = todos | "none" = nenhum | "1,3" = específicos | "1-4" = faixa`)
    rl.question(`  Escolha: `, answer => {
      const input = answer.trim().toLowerCase()
      if (input === 'none' || input === '') { resolve([]); return }
      if (input === 'all') { resolve(options.map(o => o.id)); return }

      const selected = new Set()
      for (const part of input.split(',')) {
        const range = part.trim().split('-').map(Number)
        if (range.length === 2 && !isNaN(range[0]) && !isNaN(range[1])) {
          for (let i = range[0]; i <= range[1]; i++) {
            if (options[i - 1]) selected.add(options[i - 1].id)
          }
        } else {
          const idx = parseInt(part.trim()) - 1
          if (options[idx]) selected.add(options[idx].id)
        }
      }
      resolve([...selected])
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
  const primaryColor = await ask('Cor primaria (hex)', '#0087A8')
  const secondaryColor = await ask('Cor secundaria (hex)', '#005F73')
  const logoUrl = await ask('URL/path do logo', '/logo.svg')

  console.log('\n  --- Módulos Starter ---')
  const AVAILABLE_STARTERS = [
    { id: 'exemplo',       label: 'Exemplo',        note: 'CRUD de referência com hooks, services e tipos — remova após criar seus módulos' },
    { id: 'etl',           label: 'ETL',             note: 'Pipeline de importação — catálogo, jobs, qualidade, logs' },
    { id: 'lgpd',          label: 'LGPD',            note: 'Consentimento, portabilidade e exclusão de dados (Lei 13.709)' },
    { id: 'observability', label: 'Observabilidade', note: 'Métricas, logs, health check (requer roles ADMIN/GESTOR)' },
    { id: 'docs',          label: 'Documentação',    note: 'Docs internos, referência de API e changelog' },
  ]
  const selectedStarters = await askMulti(
    'Quais módulos starter deseja incluir?',
    AVAILABLE_STARTERS
  )

  console.log('\n  --- OpenAI (Agente) ---')
  const openAiKey = await ask('OpenAI API Key (deixe vazio para pular)', '')

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
    openAiKey,
    gitRemote,
    selectedStarters,
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
// ============================================================================
// Module starters installation
// ============================================================================

const STARTERS_ROOT = join(ROOT, 'packages', 'module-starters')
const WEB_ROOT = join(ROOT, 'apps', 'web')

/**
 * Copia um módulo starter para dentro da app web.
 * - manifest → apps/web/config/modules/<id>.manifest.ts
 * - api/      → apps/web/app/api/<id>/
 * - app/      → apps/web/app/(protected)/<path>/  (baseado no manifest.path)
 * - migrations → supabase/migrations/ (numeradas sequencialmente)
 * Atualiza modules.config.ts e config/modules/index.ts automaticamente.
 */
function installStarter(starterId, namespace) {
  const starterDir = join(STARTERS_ROOT, starterId)
  if (!existsSync(starterDir)) {
    console.log(`  ⚠️  Starter '${starterId}' não encontrado em packages/module-starters/`)
    return
  }

  // Ler manifest para obter id e path
  const manifestSrc = join(starterDir, 'manifest.ts')
  if (!existsSync(manifestSrc)) {
    console.log(`  ⚠️  manifest.ts não encontrado em ${starterId}/`)
    return
  }

  // Copiar manifest para config/modules/
  const manifestDst = join(WEB_ROOT, 'config', 'modules', `${starterId}.manifest.ts`)
  if (!existsSync(manifestDst)) {
    let content = readFileSync(manifestSrc, 'utf-8')
    // Ajustar namespace se necessário
    if (namespace !== '@template') {
      content = content.replaceAll('@template/', `${namespace}/`)
    }
    writeFileSync(manifestDst, content, 'utf-8')
    console.log(`  ✓ Manifest: config/modules/${starterId}.manifest.ts`)
  }

  // Copiar API route
  const apiSrc = join(starterDir, 'api', 'route.ts')
  const apiDst = join(WEB_ROOT, 'app', 'api', starterId)
  if (existsSync(apiSrc) && !existsSync(join(apiDst, 'route.ts'))) {
    mkdirSync(apiDst, { recursive: true })
    let content = readFileSync(apiSrc, 'utf-8')
    if (namespace !== '@template') content = content.replaceAll('@template/', `${namespace}/`)
    writeFileSync(join(apiDst, 'route.ts'), content, 'utf-8')
    console.log(`  ✓ API route: app/api/${starterId}/route.ts`)
  }

  // Copiar páginas (app/)
  const appPagesSrc = join(starterDir, 'app')
  if (existsSync(appPagesSrc)) {
    // Derivar rota do diretório (remover leading /)
    const routePath = starterId === 'observability' ? 'admin/observability'
      : starterId === 'etl' ? 'admin/etl'
      : starterId === 'docs' ? 'docs-interno'
      : starterId

    const appPagesDst = join(WEB_ROOT, 'app', '(protected)', routePath)
    if (!existsSync(appPagesDst)) {
      mkdirSync(appPagesDst, { recursive: true })
      for (const file of readdirSync(appPagesSrc)) {
        const src = join(appPagesSrc, file)
        const dst = join(appPagesDst, file)
        if (!existsSync(dst)) {
          let content = readFileSync(src, 'utf-8')
          if (namespace !== '@template') content = content.replaceAll('@template/', `${namespace}/`)
          writeFileSync(dst, content, 'utf-8')
        }
      }
      console.log(`  ✓ Páginas: app/(protected)/${routePath}/`)
    }
  }

  // Copiar migrations
  const migrationsSrc = join(starterDir, 'migrations')
  if (existsSync(migrationsSrc)) {
    const migrationsDst = join(ROOT, 'supabase', 'migrations')
    mkdirSync(migrationsDst, { recursive: true })

    // Calcular próximo número disponível
    const existing = existsSync(migrationsDst)
      ? readdirSync(migrationsDst).filter(f => f.endsWith('.sql'))
      : []
    const maxNum = existing.reduce((max, f) => {
      const match = f.match(/^(\d+)/)
      return match ? Math.max(max, parseInt(match[1])) : max
    }, 0)

    let counter = maxNum + 1
    for (const file of readdirSync(migrationsSrc).sort()) {
      if (!file.endsWith('.sql')) continue
      const dst = join(migrationsDst, `${String(counter).padStart(5, '0')}_${starterId}_${file}`)
      if (!existsSync(dst)) {
        cpSync(join(migrationsSrc, file), dst)
        console.log(`  ✓ Migration: supabase/migrations/${String(counter).padStart(5, '0')}_${starterId}_${file}`)
        counter++
      }
    }
  }

  // Registrar no modules.config.ts
  addStarterToModulesConfig(starterId)

  // Registrar no config/modules/index.ts
  addStarterToModulesIndex(starterId, namespace)
}

function addStarterToModulesConfig(moduleId) {
  const configPath = join(WEB_ROOT, 'modules.config.ts')
  if (!existsSync(configPath)) return

  let content = readFileSync(configPath, 'utf-8')
  if (content.includes(`'${moduleId}'`) || content.includes(`"${moduleId}"`)) return

  const lastBrace = content.lastIndexOf('}')
  if (lastBrace === -1) return

  const beforeBrace = content.slice(0, lastBrace).trimEnd()
  const needsComma = !beforeBrace.endsWith(',')
  const entry = `${needsComma ? ',' : ''}\n\n  // Starter: ${moduleId}\n  '${moduleId}': { enabled: true },`
  content = content.slice(0, lastBrace) + entry + '\n' + content.slice(lastBrace)
  writeFileSync(configPath, content, 'utf-8')
  console.log(`  ✓ modules.config.ts: '${moduleId}' enabled: true`)
}

function addStarterToModulesIndex(moduleId, namespace) {
  const indexPath = join(WEB_ROOT, 'config', 'modules', 'index.ts')
  if (!existsSync(indexPath)) return

  let content = readFileSync(indexPath, 'utf-8')
  if (content.includes(`'${moduleId}.manifest'`) || content.includes(`"${moduleId}.manifest"`)) return

  const camel = moduleId.replace(/-([a-z])/g, (_, c) => c.toUpperCase()) + 'Manifest'
  const importLine = `import ${camel} from './${moduleId}.manifest'\n`
  const allManifestsLine = 'const ALL_MANIFESTS: ModuleManifest[] = ['
  const allIdx = content.indexOf(allManifestsLine)
  if (allIdx === -1) return

  content = content.slice(0, allIdx) + importLine + content.slice(allIdx)

  const closingBracket = content.indexOf(']', content.indexOf(allManifestsLine))
  if (closingBracket === -1) return

  const beforeClose = content.slice(0, closingBracket).trimEnd()
  const needsComma = !beforeClose.endsWith(',')
  content = content.slice(0, closingBracket) + `${needsComma ? ',' : ''}\n  ${camel},\n` + content.slice(closingBracket)

  writeFileSync(indexPath, content, 'utf-8')
  console.log(`  ✓ config/modules/index.ts: import ${camel}`)
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const config = await collectConfig()
  const {
    projectName, namespace, appName, supabaseUrl, supabaseAnonKey,
    supabaseServiceKey, authProvider, primaryColor, secondaryColor,
    logoUrl, openAiKey, gitRemote, selectedStarters = [],
  } = config

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

  // 3. Instalar módulos starter selecionados
  if (selectedStarters.length > 0) {
    console.log(`\n  Instalando ${selectedStarters.length} módulo(s) starter...\n`)
    for (const starterId of selectedStarters) {
      console.log(`  → ${starterId}`)
      installStarter(starterId, namespace)
    }
    console.log()
  }

  // 4. Generate .env files
  console.log('\n  Gerando .env files...')
  const envVars = {
    projectName, namespace, appName,
    supabaseUrl, supabaseAnonKey, supabaseServiceKey,
    authProvider: authProvider || 'supabase',
    primaryColor, secondaryColor, logoUrl,
    openAiKey: openAiKey || '',
  }

  generateEnvFile(
    join(ROOT, 'apps/web/.env.template'),
    join(ROOT, 'apps/web/.env.local'),
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
  const hasMigrations = selectedStarters.some(id =>
    existsSync(join(STARTERS_ROOT, id, 'migrations'))
  )
  console.log('\n  ╔══════════════════════════════════════════════════════╗')
  console.log(`  ║   ${appName} configurado com sucesso!`)
  console.log('  ╠══════════════════════════════════════════════════════╣')
  console.log('  ║   Proximos passos:                                   ║')
  console.log('  ║   1. pnpm install                                    ║')
  if (hasMigrations) {
    console.log('  ║   2. pnpm run db:migrate  (aplicar migrations)      ║')
    console.log('  ║   3. pnpm dev                                        ║')
    console.log('  ║   4. Acesse http://localhost:3000                    ║')
  } else {
    console.log('  ║   2. pnpm dev                                        ║')
    console.log('  ║   3. Acesse http://localhost:3000                    ║')
  }
  if (selectedStarters.length > 0) {
    console.log('  ╠══════════════════════════════════════════════════════╣')
    console.log(`  ║   Módulos instalados: ${selectedStarters.join(', ')}`)
  }
  console.log('  ╚══════════════════════════════════════════════════════╝\n')
}

main().catch(err => {
  console.error('\n  ✗ Setup falhou:', err.message)
  process.exit(1)
})
