#!/usr/bin/env node
/**
 * generate-module-docs.mjs — Gera documentacao automatica dos modulos
 *
 * Le todos os manifests em apps/web/config/modules/*.manifest.ts
 * e gera:
 *   - docs/modules/INDEX.md  (catalogo com tabela de todos os modulos)
 *   - docs/modules/<id>.md   (documentacao individual de cada modulo)
 *
 * Usage:
 *   node scripts/generate-module-docs.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { globSync } from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MANIFESTS_DIR = path.join(ROOT, 'apps', 'web', 'config', 'modules')
const DOCS_DIR = path.join(ROOT, 'docs', 'modules')

// ── Helpers ─────────────────────────────────────────────────

function titleCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Extrai o objeto passado a defineManifest({...}) de um arquivo .manifest.ts
 * usando regex. Funciona porque os manifests seguem um padrao consistente
 * com valores literais (strings, arrays, booleans, numbers).
 */
function parseManifestFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // Extrair o bloco inteiro entre defineManifest({ ... })
  // Usamos uma abordagem de contagem de chaves para encontrar o bloco completo
  const startMarker = 'defineManifest('
  const startIdx = content.indexOf(startMarker)
  if (startIdx === -1) {
    console.warn(`  [WARN] defineManifest nao encontrado em ${path.basename(filePath)}`)
    return null
  }

  // Encontrar a abertura do objeto
  const objStart = content.indexOf('{', startIdx)
  if (objStart === -1) return null

  // Contar chaves para encontrar o fechamento correto
  let depth = 0
  let objEnd = -1
  for (let i = objStart; i < content.length; i++) {
    if (content[i] === '{') depth++
    if (content[i] === '}') {
      depth--
      if (depth === 0) {
        objEnd = i
        break
      }
    }
  }

  if (objEnd === -1) return null

  const objStr = content.slice(objStart, objEnd + 1)

  // Extrair campos com regex
  const manifest = {}

  // Campos string simples
  const stringFields = ['id', 'name', 'description', 'version', 'category', 'icon', 'path', 'group']
  for (const field of stringFields) {
    const match = objStr.match(new RegExp(`${field}:\\s*['"]([^'"]*?)['"]`))
    if (match) manifest[field] = match[1]
  }

  // Campos boolean
  const boolFields = ['enabled', 'showInSidebar']
  for (const field of boolFields) {
    const match = objStr.match(new RegExp(`${field}:\\s*(true|false)`))
    if (match) manifest[field] = match[1] === 'true'
  }

  // Campos numericos
  const numFields = ['order']
  for (const field of numFields) {
    const match = objStr.match(new RegExp(`${field}:\\s*(\\d+)`))
    if (match) manifest[field] = parseInt(match[1], 10)
  }

  // Campos array de strings simples (uma linha ou multilinha)
  const arrayFields = [
    'dependencies', 'routes', 'apiRoutes', 'requiredTables',
    'featureFlags', 'hooks', 'components', 'roles',
  ]
  for (const field of arrayFields) {
    // Encontrar o array inteiro: field: [...]
    const fieldRegex = new RegExp(`${field}:\\s*\\[([^\\]]*?)\\]`, 's')
    const match = objStr.match(fieldRegex)
    if (match) {
      const items = match[1]
        .match(/['"]([^'"]*?)['"]/g)
        ?.map(s => s.replace(/['"]/g, '')) || []
      manifest[field] = items
    } else {
      manifest[field] = []
    }
  }

  // envVars: array de objetos { key, required, description }
  manifest.envVars = []
  const envVarsMatch = objStr.match(/envVars:\s*\[([\s\S]*?)\](?=\s*,\s*\w)/)
  if (envVarsMatch && envVarsMatch[1].trim()) {
    const envBlock = envVarsMatch[1]
    const envItems = envBlock.match(/\{[^}]*?\}/gs) || []
    for (const item of envItems) {
      const keyMatch = item.match(/key:\s*['"]([^'"]*?)['"]/)
      const reqMatch = item.match(/required:\s*(true|false)/)
      const descMatch = item.match(/description:\s*['"]([^'"]*?)['"]/)
      if (keyMatch) {
        manifest.envVars.push({
          key: keyMatch[1],
          required: reqMatch ? reqMatch[1] === 'true' : false,
          description: descMatch ? descMatch[1] : '',
        })
      }
    }
  }

  // functions: array de objetos (extrair nome e path)
  manifest.functions = []
  // Match o bloco functions: [...]
  const functionsBlockMatch = objStr.match(/functions:\s*\[([\s\S]*)\]\s*,?\s*\}$/)
  if (functionsBlockMatch && functionsBlockMatch[1].trim()) {
    const funcBlock = functionsBlockMatch[1]
    const funcItems = funcBlock.match(/\{[^}]*?\}/gs) || []
    for (const item of funcItems) {
      const idMatch = item.match(/id:\s*['"]([^'"]*?)['"]/)
      const nameMatch = item.match(/name:\s*['"]([^'"]*?)['"]/)
      const subtitleMatch = item.match(/subtitle:\s*['"]([^'"]*?)['"]/)
      const pathMatch = item.match(/path:\s*['"]([^'"]*?)['"]/)
      const catMatch = item.match(/category:\s*['"]([^'"]*?)['"]/)
      if (idMatch) {
        manifest.functions.push({
          id: idMatch[1],
          name: nameMatch ? nameMatch[1] : idMatch[1],
          subtitle: subtitleMatch ? subtitleMatch[1] : '',
          path: pathMatch ? pathMatch[1] : '',
          category: catMatch ? catMatch[1] : '',
        })
      }
    }
  }

  return manifest
}

/**
 * Descobre todos os arquivos *.manifest.ts no diretorio de modulos.
 */
function findManifestFiles() {
  const files = fs.readdirSync(MANIFESTS_DIR)
    .filter(f => f.endsWith('.manifest.ts'))
    .sort()
  return files.map(f => path.join(MANIFESTS_DIR, f))
}

// ── Geracao de Markdown ─────────────────────────────────────

const CATEGORY_LABELS = {
  core: 'Core (sempre ativo)',
  default: 'Padrao',
  optional: 'Opcional',
}

function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat
}

function statusBadge(enabled) {
  return enabled ? 'Ativo' : 'Inativo'
}

function generateIndexMd(manifests) {
  const now = new Date().toISOString().slice(0, 10)
  const sorted = [...manifests].sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

  let md = `# Catalogo de Modulos\n\n`
  md += `> Documentacao gerada automaticamente em ${now}\n`
  md += `> Total: **${manifests.length} modulos** (${manifests.filter(m => m.enabled).length} ativos)\n\n`

  // Tabela principal
  md += `| # | ID | Nome | Categoria | Versao | Status | Dependencias | Rotas |\n`
  md += `|---|-----|------|-----------|--------|--------|--------------|-------|\n`

  for (const m of sorted) {
    const deps = m.dependencies?.length > 0 ? m.dependencies.join(', ') : '-'
    const routes = m.routes?.length > 0 ? m.routes.length.toString() : '0'
    const status = statusBadge(m.enabled)
    md += `| ${m.order ?? '-'} | [\`${m.id}\`](./${m.id}.md) | ${m.name} | ${categoryLabel(m.category)} | ${m.version} | ${status} | ${deps} | ${routes} |\n`
  }

  // Resumo por categoria
  md += `\n## Resumo por Categoria\n\n`
  const byCategory = {}
  for (const m of sorted) {
    const cat = m.category || 'outro'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(m)
  }

  for (const [cat, mods] of Object.entries(byCategory)) {
    const active = mods.filter(m => m.enabled).length
    md += `### ${categoryLabel(cat)}\n\n`
    md += `${active}/${mods.length} ativos: ${mods.map(m => `\`${m.id}\``).join(', ')}\n\n`
  }

  // Grafo de dependencias
  md += `## Grafo de Dependencias\n\n`
  md += '```\n'
  for (const m of sorted) {
    if (m.dependencies?.length > 0) {
      for (const dep of m.dependencies) {
        md += `${dep} --> ${m.id}\n`
      }
    }
  }
  md += '```\n\n'

  md += `---\n`
  md += `*Gerado por \`scripts/generate-module-docs.mjs\`*\n`

  return md
}

function generateModuleMd(m) {
  const now = new Date().toISOString().slice(0, 10)

  let md = `# Modulo: ${m.name}\n\n`
  md += `> **ID**: \`${m.id}\` | **Versao**: ${m.version} | **Categoria**: ${categoryLabel(m.category)} | **Status**: ${statusBadge(m.enabled)}\n\n`
  md += `${m.description}\n\n`

  // Metadados
  md += `## Metadados\n\n`
  md += `| Campo | Valor |\n`
  md += `|-------|-------|\n`
  md += `| Icone | \`${m.icon || '-'}\` |\n`
  md += `| Caminho | \`${m.path || '-'}\` |\n`
  md += `| Ordem | ${m.order ?? '-'} |\n`
  md += `| Grupo | ${m.group || '-'} |\n`
  md += `| Sidebar | ${m.showInSidebar ? 'Sim' : 'Nao'} |\n`
  md += `\n`

  // Dependencias
  md += `## Dependencias\n\n`
  if (m.dependencies?.length > 0) {
    for (const dep of m.dependencies) {
      md += `- [\`${dep}\`](./${dep}.md)\n`
    }
  } else {
    md += `Nenhuma dependencia.\n`
  }
  md += `\n`

  // Rotas
  md += `## Rotas\n\n`
  if (m.routes?.length > 0) {
    md += `### Paginas\n\n`
    for (const r of m.routes) {
      md += `- \`${r}\`\n`
    }
    md += `\n`
  }

  if (m.apiRoutes?.length > 0) {
    md += `### API\n\n`
    for (const r of m.apiRoutes) {
      md += `- \`${r}\`\n`
    }
    md += `\n`
  }

  // Tabelas
  md += `## Tabelas (Supabase)\n\n`
  if (m.requiredTables?.length > 0) {
    for (const t of m.requiredTables) {
      md += `- \`${t}\`\n`
    }
  } else {
    md += `Nenhuma tabela requerida.\n`
  }
  md += `\n`

  // Hooks
  md += `## Hooks\n\n`
  if (m.hooks?.length > 0) {
    for (const h of m.hooks) {
      md += `- \`${h}\`\n`
    }
  } else {
    md += `Nenhum hook.\n`
  }
  md += `\n`

  // Components
  md += `## Componentes\n\n`
  if (m.components?.length > 0) {
    for (const c of m.components) {
      md += `- \`${c}\`\n`
    }
  } else {
    md += `Nenhum componente exportado.\n`
  }
  md += `\n`

  // Feature Flags
  if (m.featureFlags?.length > 0) {
    md += `## Feature Flags\n\n`
    for (const f of m.featureFlags) {
      md += `- \`${f}\`\n`
    }
    md += `\n`
  }

  // Env Vars
  md += `## Variaveis de Ambiente\n\n`
  if (m.envVars?.length > 0) {
    md += `| Variavel | Obrigatoria | Descricao |\n`
    md += `|----------|-------------|----------|\n`
    for (const e of m.envVars) {
      md += `| \`${e.key}\` | ${e.required ? 'Sim' : 'Nao'} | ${e.description} |\n`
    }
  } else {
    md += `Nenhuma variavel de ambiente requerida.\n`
  }
  md += `\n`

  // Functions
  if (m.functions?.length > 0) {
    md += `## Funcoes (Navegacao)\n\n`
    md += `| ID | Nome | Subtitulo | Caminho | Categoria |\n`
    md += `|----|------|-----------|---------|----------|\n`
    for (const f of m.functions) {
      md += `| \`${f.id}\` | ${f.name} | ${f.subtitle || '-'} | \`${f.path}\` | ${f.category} |\n`
    }
    md += `\n`
  }

  md += `---\n`
  md += `*Gerado por \`scripts/generate-module-docs.mjs\` em ${now}*\n`

  return md
}

// ── Main ────────────────────────────────────────────────────

function main() {
  console.log('\n--- generate-module-docs ---\n')

  // 1. Encontrar manifests
  const files = findManifestFiles()
  if (files.length === 0) {
    console.error('Nenhum arquivo *.manifest.ts encontrado em:')
    console.error(`  ${MANIFESTS_DIR}`)
    process.exit(1)
  }
  console.log(`Encontrados ${files.length} manifests:\n`)

  // 2. Parsear manifests
  const manifests = []
  for (const file of files) {
    const basename = path.basename(file)
    const manifest = parseManifestFile(file)
    if (manifest) {
      manifests.push(manifest)
      console.log(`  OK  ${basename} -> ${manifest.id} (${manifest.name})`)
    } else {
      console.warn(`  FAIL  ${basename} -> nao foi possivel extrair manifest`)
    }
  }

  if (manifests.length === 0) {
    console.error('\nNenhum manifest valido encontrado.')
    process.exit(1)
  }

  // 3. Criar diretorio de saida
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true })
    console.log(`\nCriado diretorio: ${path.relative(ROOT, DOCS_DIR)}`)
  }

  // 4. Gerar INDEX.md
  const indexContent = generateIndexMd(manifests)
  const indexPath = path.join(DOCS_DIR, 'INDEX.md')
  fs.writeFileSync(indexPath, indexContent, 'utf-8')
  console.log(`\nGerado: ${path.relative(ROOT, indexPath)}`)

  // 5. Gerar <id>.md para cada modulo
  for (const m of manifests) {
    const modulePath = path.join(DOCS_DIR, `${m.id}.md`)
    const moduleContent = generateModuleMd(m)
    fs.writeFileSync(modulePath, moduleContent, 'utf-8')
    console.log(`Gerado: ${path.relative(ROOT, modulePath)}`)
  }

  console.log(`\nTotal: ${manifests.length} modulos documentados.`)
  console.log('Saida: docs/modules/\n')
}

main()
