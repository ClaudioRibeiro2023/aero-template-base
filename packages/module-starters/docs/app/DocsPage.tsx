import { Link } from 'react-router-dom'
import {
  BookOpen,
  Rocket,
  FileText,
  Code,
  Layers,
  History,
  HelpCircle,
  ExternalLink,
  Search,
} from 'lucide-react'
import { PageHeader, Accordion } from '@template/design-system'

const FAQ_ITEMS = [
  {
    value: 'faq-1',
    title: 'Como criar um novo módulo?',
    content:
      'Use o CLI: pnpm create-module <nome>. Isso gera automaticamente páginas, serviços, hooks e testes para frontend e backend.',
  },
  {
    value: 'faq-2',
    title: 'Como configurar autenticação com Keycloak?',
    content:
      'O Keycloak já vem configurado no Docker Compose. Acesse http://localhost:8080 com admin/admin para gerenciar realms, usuários e roles.',
  },
  {
    value: 'faq-3',
    title: 'Como rodar os testes?',
    content:
      'Frontend: pnpm -C apps/web test. Backend: cd api-template && pytest. E2E: pnpm -C apps/web e2e.',
  },
  {
    value: 'faq-4',
    title: 'Como fazer deploy em produção?',
    content:
      'Use docker compose -f infra/docker-compose.yml up --build -d para subir todos os serviços. O frontend também pode ser deployado no Netlify.',
  },
  {
    value: 'faq-5',
    title: 'Como adicionar um novo idioma?',
    content:
      'Crie os arquivos JSON em apps/web/src/i18n/locales/<idioma>/ seguindo a estrutura de pt-BR e en-US. Registre o idioma em i18n/index.ts.',
  },
]

const SECTIONS = [
  {
    title: 'Início Rápido',
    description: 'Primeiros passos para começar a usar o sistema',
    icon: Rocket,
    path: '/docs',
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    title: 'Guias',
    description: 'Tutoriais detalhados para cada funcionalidade',
    icon: FileText,
    path: '/docs/guias',
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    title: 'API Reference',
    description: 'Documentação completa da API REST',
    icon: Code,
    path: '/docs/api',
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  },
  {
    title: 'Arquitetura',
    description: 'Decisões arquiteturais (ADRs) e estrutura do projeto',
    icon: Layers,
    path: '/docs/arquitetura',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  },
  {
    title: 'Changelog',
    description: 'Histórico de versões e atualizações',
    icon: History,
    path: '/docs/changelog',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  },
  {
    title: 'FAQ',
    description: 'Perguntas frequentes e respostas',
    icon: HelpCircle,
    path: '/docs/faq',
    color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  },
]

const QUICK_START_STEPS = [
  {
    step: 1,
    title: 'Configurar ambiente',
    description: 'Clone o repositório e instale as dependências com pnpm install',
  },
  {
    step: 2,
    title: 'Iniciar serviços',
    description: 'Execute docker-compose up para iniciar PostgreSQL, Redis e Keycloak',
  },
  {
    step: 3,
    title: 'Rodar aplicação',
    description: 'Execute pnpm dev para iniciar o servidor de desenvolvimento',
  },
  { step: 4, title: 'Acessar o sistema', description: 'Abra http://localhost:5173 no navegador' },
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader
            title="Documentação"
            description="Guias, tutoriais e referências do sistema"
            icon={<BookOpen size={32} />}
          >
            {/* Search */}
            <div className="mt-4 relative max-w-2xl">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Buscar na documentação..."
                className="form-input pl-12 py-3 text-lg rounded-xl focus-ring"
                aria-label="Buscar na documentação"
              />
            </div>
          </PageHeader>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {SECTIONS.map(section => {
            const Icon = section.icon
            return (
              <Link
                key={section.path}
                to={section.path}
                className="group bg-surface-elevated rounded-xl border border-border-default p-6 hover:shadow-lg hover:border-primary/50 transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-4`}
                >
                  <Icon size={24} />
                </div>
                <h2 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
                <p className="mt-2 text-text-secondary">{section.description}</p>
              </Link>
            )
          })}
        </div>

        {/* Quick Start */}
        <div className="bg-surface-elevated rounded-xl border border-border-default p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <Rocket size={24} className="text-green-500" />
            Início Rápido
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_START_STEPS.map(item => (
              <div key={item.step} className="relative p-4 bg-surface-muted rounded-lg">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="font-medium text-text-primary mt-2">{item.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-surface-elevated rounded-xl border border-border-default p-6 mb-8">
          <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
            <HelpCircle size={24} className="text-teal-500" />
            Perguntas Frequentes
          </h2>
          <Accordion items={FAQ_ITEMS} />
        </div>

        {/* External Links */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Links Úteis</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ExternalLink size={16} className="text-primary" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="https://docs.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ExternalLink size={16} className="text-primary" />
              <span>API Swagger</span>
            </a>
            <a
              href="https://storybook.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-surface-elevated rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ExternalLink size={16} className="text-primary" />
              <span>Storybook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
