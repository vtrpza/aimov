'use client'

import Link from 'next/link'
import { formatBRL } from '@/lib/utils/brazilian-formatters'
import { Database } from '@/types/database'
import { User, Phone, Mail, MapPin, Home, BedDouble, Star } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Client = Database['public']['Tables']['clients']['Row']

interface ClientCardProps {
  client: Client
}

export function ClientCard({ client }: ClientCardProps) {
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
    <Link href={`/clients/${client.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                  {client.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusVariant(client.status)}>
                    {getStatusLabel(client.status)}
                  </Badge>
                  {client.source && (
                    <Badge variant="outline" className="text-xs">
                      {client.source}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Contact Info */}
          <div className="space-y-2 text-sm">
            {client.phone && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{client.email}</span>
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-1">Orçamento</p>
            <p className="text-lg font-bold text-primary">{budgetDisplay}</p>
          </div>

          {/* Preferences */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-2">
            {client.min_bedrooms !== null && (
              <div className="flex items-center">
                <BedDouble className="h-4 w-4 mr-1" />
                <span>{client.min_bedrooms}+ quartos</span>
              </div>
            )}
            {client.preferred_neighborhoods && client.preferred_neighborhoods.length > 0 && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="truncate">
                  {client.preferred_neighborhoods.slice(0, 2).join(', ')}
                  {client.preferred_neighborhoods.length > 2 && ` +${client.preferred_neighborhoods.length - 2}`}
                </span>
              </div>
            )}
            {client.preferred_property_types && client.preferred_property_types.length > 0 && (
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-1" />
                <span className="truncate">
                  {client.preferred_property_types.slice(0, 2).join(', ')}
                </span>
              </div>
            )}
          </div>

          {/* Required Features */}
          {client.required_features && client.required_features.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-1.5">
              {client.required_features.slice(0, 3).map((feature) => (
                <Badge key={feature} variant="secondary" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  {feature}
                </Badge>
              ))}
              {client.required_features.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{client.required_features.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
