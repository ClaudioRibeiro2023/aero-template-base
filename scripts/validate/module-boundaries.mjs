#!/usr/bin/env node
/**
 * Module Boundary Lint — Sprint 8
 *
 * Verifica se arquivos em apps/web/ importam hooks/componentes de módulos desabilitados.
 * Lê modules.config.ts para overrides e manifests para mapear hooks/components por módulo.
 *
 * Exit code 0 sempre (warnings only, não bloqueia build).
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, relative, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '../..')
const WEB_DIR = join(ROOT, 'apps', 'web')
const MANIFESTS_DIR = join(WEB_DIR, 'config', 'modules')
const CONFIG_FILE = join(WEB_DIR, 'modules.config.ts')

// ═══════════════════════════════════════════════════════════════
// 1. Parse modules.config.ts para encontrar módulos desabilitados
// ═══════════════════════════════════════════════════════════════

function parseModuleOverrides() {
  const overrides = new Map()

  try {
    const content = readFileSync(CONFIG_FILE, 'utf-8')

    // Match lines like:  support: { enabled: false },
    // or:                'feature-flags': { enabled: true },
    const regex = /['"]?([a-zA-Z0-9_-]+)['"]?\s*:\s*\{\s*enabled\s*:\s*(true|false)\s*\}/g
    let match

    while ((match = regex.exec(content)) !== null) {
      overrides.set(match[1], match[2] === 'true')
    }
  } catch (err) {
    console.error(`[module-boundaries] Erro ao ler ${CONFIG_FILE}: ${err.message}`)
  }

  return overrides
}

// ═══════════════════════════════════════════════════════════════
// 2. Parse manifest files para extrair hooks/components por módulo
// ═══════════════════════════════════════════════════════════════

function parseManifests() {
  /** @type {Map<string, { id: string, category: string, hooks: string[], components: string[] }>} */
  const modules = new Map()

  try {
    const files = readdirSync(MANIFESTS_DIR).filter(f => f.endsWith('.manifest.ts'))

    for (const file of files) {
      const filePath = join(MANIFESTS_DIR, file)
      const content = readFileSync(filePath, 'utf-8')

      // Extract id
      const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/)
      if (!idMatch) continue
      const id = idMatch[1]

      // Extract category
      const catMatch = content.match(/category:\s*['"]([^'"]+)['"]/)
      const category = catMatch ? catMatch[1] : 'default'

      // Extract hooks array
      const hooks = extractStringArray(content, 'hooks')

      // Extract components array
      const components = extractStringArray(content, 'components')

      modules.set(id, { id, category, hooks, components })
    }
  } catch (err) {
    console.error(`[module-boundaries] Erro ao ler manifests: ${err.message}`)
  }

  return modules
}

/**
 * Extract a string array from TS source: `fieldName: ['a', 'b', 'c']`
 * @param {string} content
 * @param {string} fieldName
 * @returns {string[]}
 */
function extractStringArray(content, fieldName) {
  // Match fieldName: [...] allowing multiline
  const regex = new RegExp(`${fieldName}:\\s*\\[([^\\]]*?)\\]`, 's')
  const match = content.match(regex)
  if (!match) return []

  const items = []
  const strRegex = /['"]([^'"]+)['"]/g
  let strMatch
  while ((strMatch = strRegex.exec(match[1])) !== null) {
    items.push(strMatch[1])
  }
  return items
}

// ═══════════════════════════════════════════════════════════════
// 3. Scan source files recursivamente
// ═══════════════════════════════════════════════════════════════

function collectSourceFiles(dir, files = []) {
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)

      // Skip node_modules, .next, __tests__, dist
      if (['node_modules', '.next', '__tests__', 'dist', '.git'].includes(entry)) continue

      try {
        const stat = statSync(fullPath)
        if (stat.isDirectory()) {
          collectSourceFiles(fullPath, files)
        } else if (['.ts', '.tsx'].includes(extname(entry)) && !entry.endsWith('.test.ts') && !entry.endsWith('.test.tsx') && !entry.endsWith('.spec.ts')) {
          files.push(fullPath)
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    // Skip inaccessible directories
  }
  return files
}

// ═══════════════════════════════════════════════════════════════
// 4. Check imports against disabled module symbols
// ═══════════════════════════════════════════════════════════════

function checkImports(sourceFiles, disabledSymbols) {
  /** @type {{ file: string, line: number, symbol: string, moduleId: string }[]} */
  const violations = []

  for (const filePath of sourceFiles) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Skip comment lines
        if (line.trimStart().startsWith('//') || line.trimStart().startsWith('*')) continue

        for (const [symbol, moduleId] of disabledSymbols) {
          // Check for import of the symbol (import statement or dynamic usage)
          // Match: import { useSupportTickets } or from patterns or direct usage like <TicketCard
          if (
            line.includes(symbol) &&
            (line.includes('import') || line.includes(`<${symbol}`) || line.match(new RegExp(`\\b${symbol}\\b`)))
          ) {
            violations.push({
              file: relative(ROOT, filePath),
              line: i + 1,
              symbol,
              moduleId,
            })
            break // One violation per symbol per line is enough
          }
        }
      }
    } catch {
      // Skip unreadable files
    }
  }

  return violations
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║     Module Boundary Lint — Template.Base        ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log()

  // 1. Parse overrides
  const overrides = parseModuleOverrides()
  console.log(`[1/4] Overrides carregados: ${overrides.size} modulos configurados`)

  // 2. Parse manifests
  const manifests = parseManifests()
  console.log(`[2/4] Manifests carregados: ${manifests.size} modulos encontrados`)

  // 3. Determine disabled modules (applying core immunity)
  const disabledModuleIds = new Set()
  for (const [id, manifest] of manifests) {
    // Core modules are always enabled
    if (manifest.category === 'core') continue

    const override = overrides.get(id)
    if (override === false) {
      disabledModuleIds.add(id)
    } else if (override === undefined && manifest.category === 'optional') {
      // Optional modules disabled by default if no override
      disabledModuleIds.add(id)
    }
  }

  if (disabledModuleIds.size === 0) {
    console.log('\n✓ Nenhum modulo desabilitado — nada a verificar.')
    process.exit(0)
  }

  console.log(`   Modulos desabilitados: ${[...disabledModuleIds].join(', ')}`)

  // 4. Build symbol → module map for disabled modules
  /** @type {Map<string, string>} symbol → moduleId */
  const disabledSymbols = new Map()
  for (const moduleId of disabledModuleIds) {
    const manifest = manifests.get(moduleId)
    if (!manifest) continue

    for (const hook of manifest.hooks) {
      disabledSymbols.set(hook, moduleId)
    }
    for (const component of manifest.components) {
      disabledSymbols.set(component, moduleId)
    }
  }

  console.log(`   Simbolos monitorados: ${disabledSymbols.size} (hooks + components)`)

  // 5. Collect source files
  const sourceFiles = collectSourceFiles(join(WEB_DIR, 'app'))
    .concat(collectSourceFiles(join(WEB_DIR, 'components')))
    .concat(collectSourceFiles(join(WEB_DIR, 'lib')))
    .concat(collectSourceFiles(join(WEB_DIR, 'hooks')))

  console.log(`[3/4] Arquivos escaneados: ${sourceFiles.length} (.ts/.tsx)`)

  // 6. Check imports
  const violations = checkImports(sourceFiles, disabledSymbols)

  console.log(`[4/4] Verificacao concluida\n`)

  // 7. Report
  if (violations.length === 0) {
    console.log('╔══════════════════════════════════════════════════╗')
    console.log('║  ✓ ZERO violacoes de boundary detectadas        ║')
    console.log('╚══════════════════════════════════════════════════╝')
  } else {
    console.log('╔══════════════════════════════════════════════════╗')
    console.log(`║  ⚠ ${String(violations.length).padEnd(3)} violacao(oes) de boundary detectadas   ║`)
    console.log('╚══════════════════════════════════════════════════╝')
    console.log()

    // Group by module
    const byModule = new Map()
    for (const v of violations) {
      if (!byModule.has(v.moduleId)) byModule.set(v.moduleId, [])
      byModule.get(v.moduleId).push(v)
    }

    for (const [moduleId, items] of byModule) {
      console.log(`  Modulo '${moduleId}' (DESABILITADO):`)
      for (const item of items) {
        console.log(`    ⚠ ${item.file}:${item.line} — usa '${item.symbol}'`)
      }
      console.log()
    }

    console.log('  Nota: Estas sao warnings — o build NAO e bloqueado.')
    console.log('  Para resolver, habilite o modulo ou remova a importacao.')
  }

  // Always exit 0 (warnings only)
  process.exit(0)
}

main()
