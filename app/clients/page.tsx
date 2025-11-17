import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import type { Database } from '@/types/database'
import { ClientList } from '@/components/clients/ClientList'

type Client = Database['public']['Tables']['clients']['Row']

export default async function ClientsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você precisa estar logado para ver seus clientes
          </p>
          <Button asChild>
            <Link href="/login">Fazer Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Fetch clients for the current user
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
  }

  const clients: Client[] = data || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Meus Clientes
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie seus clientes e suas preferências de imóveis
            </p>
          </div>
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </Link>
          </Button>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum cliente cadastrado</h2>
            <p className="text-muted-foreground mb-6">
              Adicione seu primeiro cliente para começar
            </p>
            <Button asChild>
              <Link href="/clients/new">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Link>
            </Button>
          </div>
        ) : (
          <ClientList initialClients={clients} />
        )}
      </div>
    </div>
  )
}
