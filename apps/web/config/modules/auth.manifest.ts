import { defineManifest } from '@template/modules'

export default defineManifest({
  id: 'auth',
  name: 'Autenticacao',
  description: 'Login, registro, recuperacao de senha e OAuth',
  version: '1.0.0',
  category: 'core',
  enabled: true,
  order: 0,
  dependencies: [],
  routes: ['/login', '/register', '/login/forgot-password', '/auth/callback'],
  apiRoutes: ['/api/auth'],
  requiredTables: ['profiles', 'tenants'],
  envVars: [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'URL do projeto Supabase' },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      required: true,
      description: 'Chave anonima do Supabase',
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      required: true,
      description: 'Chave de servico do Supabase',
    },
  ],
  featureFlags: [],
  hooks: ['useAuth'],
  components: ['ProtectedRoute', 'PermissionGate'],
  icon: 'Lock',
  path: '/login',
  roles: [],
  showInSidebar: false,
  group: 'Sistema',
  functions: [],
})
