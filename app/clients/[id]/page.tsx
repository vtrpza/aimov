import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, User, Phone, Mail, MapPin, Home, BedDouble, Bath, Star, MessageSquare } from 'lucide-react'
import type { Database } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatBRL } from '@/lib/utils/brazilian-formatters'
import { Separator } from '@/components/ui/separator'

type Client = Database['public']['Tables']['clients']['Row']

interface ClientDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch client
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !client) {
    notFound()
  }

  const getStatusVariant = (status: string | null): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'converted':
        return 'secondary'
      case 'inactive':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: string | null): string => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'converted':
        return 'Convertido'
      case 'inactive':
        return 'Inativo'
      default:
        return 'Desconhecido'
    }
  }

  const budgetDisplay = client.budget_min && client.budget_max
    ? `${formatBRL(client.budget_min)} - ${formatBRL(client.budget_max)}`
    : client.budget_min
    ? `A partir de ${formatBRL(client.budget_min)}`
    : client.budget_max
    ? `Até ${formatBRL(client.budget_max)}`
    : 'Não definido'

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/clients">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                {client.full_name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusVariant(client.status)}>
                  {getStatusLabel(client.status)}
                </Badge>
                {client.source && (
                  <Badge variant="outline">{client.source}</Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/chat?clientId=${client.id}`}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Iniciar Chat
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/clients/${client.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Nome Completo</p>
                    <p className="font-medium">{client.full_name}</p>
                  </div>
                  {client.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                      <p className="font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </p>
                    </div>
                  )}
                  {client.email && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">E-mail</p>
                      <p className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {client.email}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Preferências de Imóvel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Budget */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Orçamento</p>
                  <p className="text-2xl font-bold text-primary">{budgetDisplay}</p>
                </div>

                <Separator />

                {/* Basic Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {client.min_bedrooms !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Quartos</p>
                      <p className="font-medium flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        {client.min_bedrooms}+ quartos
                      </p>
                    </div>
                  )}
                  {client.min_bathrooms !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Banheiros</p>
                      <p className="font-medium flex items-center gap-2">
                        <Bath className="h-4 w-4" />
                        {client.min_bathrooms}+ banheiros
                      </p>
                    </div>
                  )}
                </div>

                {/* Property Types */}
                {client.preferred_property_types && client.preferred_property_types.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Tipos de Imóvel</p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferred_property_types.map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Neighborhoods */}
                {client.preferred_neighborhoods && client.preferred_neighborhoods.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bairros Preferidos</p>
                      <div className="flex flex-wrap gap-2">
                        {client.preferred_neighborhoods.map((neighborhood) => (
                          <Badge key={neighborhood} variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {neighborhood}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Required Features */}
                {client.required_features && client.required_features.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Características Essenciais</p>
                      <div className="flex flex-wrap gap-2">
                        {client.required_features.map((feature) => (
                          <Badge key={feature} variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" asChild>
                  <Link href={`/chat?clientId=${client.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Iniciar Conversa
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/properties?clientId=${client.id}`}>
                    <Home className="h-4 w-4 mr-2" />
                    Buscar Imóveis
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/clients/${client.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Cliente
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Cadastrado em</p>
                  <p className="font-medium">
                    {new Date(client.created_at!).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                {client.updated_at && client.updated_at !== client.created_at && (
                  <div>
                    <p className="text-muted-foreground">Última atualização</p>
                    <p className="font-medium">
                      {new Date(client.updated_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {client.converted_at && (
                  <div>
                    <p className="text-muted-foreground">Convertido em</p>
                    <p className="font-medium">
                      {new Date(client.converted_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
