/**
 * Internationalization (i18n) Configuration
 *
 * Para habilitar i18n completo:
 * 1. Instalar: pnpm --filter @template/web add i18next react-i18next
 * 2. Descomentar o código abaixo
 * 3. Importar e chamar initI18n() no main.tsx
 */

// import i18n from 'i18next'
// import { initReactI18next } from 'react-i18next'

/**
 * Traduções em português (padrão)
 */
export const ptBR = {
  common: {
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    save: 'Salvar',
    delete: 'Excluir',
    edit: 'Editar',
    create: 'Criar',
    search: 'Buscar',
    filter: 'Filtrar',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    yes: 'Sim',
    no: 'Não',
    close: 'Fechar',
    open: 'Abrir',
    actions: 'Ações',
    noResults: 'Nenhum resultado encontrado',
    required: 'Campo obrigatório',
  },
  auth: {
    login: 'Entrar',
    logout: 'Sair',
    username: 'Usuário',
    password: 'Senha',
    email: 'E-mail',
    forgotPassword: 'Esqueceu a senha?',
    rememberMe: 'Lembrar-me',
    sessionExpired: 'Sua sessão expirou. Por favor, faça login novamente.',
  },
  nav: {
    home: 'Início',
    profile: 'Perfil',
    settings: 'Configurações',
    users: 'Usuários',
    docs: 'Documentação',
    example: 'Exemplo',
  },
  errors: {
    generic: 'Ocorreu um erro inesperado.',
    notFound: 'Página não encontrada.',
    unauthorized: 'Você não tem permissão para acessar este recurso.',
    forbidden: 'Acesso negado.',
    serverError: 'Erro no servidor. Tente novamente mais tarde.',
    networkError: 'Erro de conexão. Verifique sua internet.',
  },
  validation: {
    required: 'Este campo é obrigatório',
    email: 'E-mail inválido',
    minLength: 'Mínimo de {{min}} caracteres',
    maxLength: 'Máximo de {{max}} caracteres',
    pattern: 'Formato inválido',
  },
}

/**
 * Traduções em inglês
 */
export const enUS = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    filter: 'Filter',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    open: 'Open',
    actions: 'Actions',
    noResults: 'No results found',
    required: 'Required field',
  },
  auth: {
    login: 'Sign In',
    logout: 'Sign Out',
    username: 'Username',
    password: 'Password',
    email: 'Email',
    forgotPassword: 'Forgot password?',
    rememberMe: 'Remember me',
    sessionExpired: 'Your session has expired. Please sign in again.',
  },
  nav: {
    home: 'Home',
    profile: 'Profile',
    settings: 'Settings',
    users: 'Users',
    docs: 'Documentation',
    example: 'Example',
  },
  errors: {
    generic: 'An unexpected error occurred.',
    notFound: 'Page not found.',
    unauthorized: 'You are not authorized to access this resource.',
    forbidden: 'Access denied.',
    serverError: 'Server error. Please try again later.',
    networkError: 'Connection error. Check your internet.',
  },
  validation: {
    required: 'This field is required',
    email: 'Invalid email',
    minLength: 'Minimum {{min}} characters',
    maxLength: 'Maximum {{max}} characters',
    pattern: 'Invalid format',
  },
}

export type TranslationKeys = typeof ptBR

/**
 * Idiomas suportados
 */
export const supportedLanguages = [
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]['code']

/**
 * Recursos de tradução
 */
export const resources = {
  'pt-BR': { translation: ptBR },
  'en-US': { translation: enUS },
}

/**
 * Inicializa i18n (descomentar quando react-i18next estiver instalado)
 */
export function initI18n(_defaultLanguage: LanguageCode = 'pt-BR') {
  // Descomentar quando i18next estiver instalado:
  /*
  return i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLanguage,
      fallbackLng: 'pt-BR',
      interpolation: {
        escapeValue: false,
      },
    })
  */

  // Placeholder - retorna Promise resolvida
  return Promise.resolve()
}

/**
 * Helper para tradução simples (sem i18next)
 */
export function t(key: string, lang: LanguageCode = 'pt-BR'): string {
  const translations = lang === 'en-US' ? enUS : ptBR
  const keys = key.split('.')

  let value: unknown = translations

  for (const k of keys) {
    if (typeof value !== 'object' || value === null) return key
    value = (value as Record<string, unknown>)[k]
    if (value === undefined) return key
  }

  return typeof value === 'string' ? value : key
}

/**
 * Detecta idioma do navegador
 */
export function detectBrowserLanguage(): LanguageCode {
  const browserLang = navigator.language || 'pt-BR'

  if (browserLang.startsWith('en')) return 'en-US'
  return 'pt-BR'
}
