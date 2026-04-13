import { redirect } from 'next/navigation'

export const metadata = { title: 'Administração' }

/** Admin root redirects to user management */
export default function AdminPage() {
  redirect('/admin/usuarios')
}
