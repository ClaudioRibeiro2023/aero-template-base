import { ProtectedLayoutClient } from './layout-client'

// Auth is handled by middleware.ts (getUser() validation) — no need for force-dynamic here.

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>
}
