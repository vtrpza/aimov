import { createClient } from '@/lib/supabase/server'
import { PropertyList } from '@/components/properties/PropertyList'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import type { Database } from '@/types/database'

type Property = Database['public']['Tables']['properties']['Row']

export default async function PropertiesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
  }

  const properties: Property[] = data || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Imóveis
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explore nossa seleção de propriedades disponíveis
            </p>
          </div>
          <Button asChild>
            <Link href="/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Buscar com IA
            </Link>
          </Button>
        </div>

        <PropertyList initialProperties={properties} />
      </div>
    </div>
  )
}
