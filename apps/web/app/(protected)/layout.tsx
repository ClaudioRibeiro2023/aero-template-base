import { ProtectedLayoutClient } from './layout-client'

// Force dynamic rendering for all protected pages (they need auth context)
export const dynamic = 'force-dynamic'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
}
