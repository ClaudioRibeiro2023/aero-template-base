import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'Template Platform',
  tagline: 'Plataforma base para produtos corporativos — multi-tenant, white-label, extensível',
  favicon: 'img/favicon.ico',
  url: 'https://template-platform.github.io',
  baseUrl: '/docs/',
  organizationName: 'template-platform',
  projectName: 'docs',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'Template Platform',
      items: [
        { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Documentação' },
        { href: '/storybook/', label: 'Storybook', position: 'left' },
        { href: 'https://github.com/seu-org/template-platform', label: 'GitHub', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Início Rápido', to: '/getting-started' },
            { label: 'Arquitetura', to: '/architecture' },
            { label: 'API Reference', to: '/api' },
          ],
        },
        {
          title: 'Ferramentas',
          items: [
            { label: 'Storybook', href: '/storybook/' },
            { label: 'GitHub', href: 'https://github.com/seu-org/template-platform' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Template Platform. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'json', 'typescript'],
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
