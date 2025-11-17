'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatBRL, formatArea } from '@/lib/utils/brazilian-formatters'
import { Database } from '@/types/database'
import { Home, BedDouble, Bath, MapPin, Heart } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePreferencesStore } from '@/store/preferences-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyCardProps {
  property: Property
  viewMode?: 'grid' | 'list'
}

export function PropertyCard({ property, viewMode = 'grid' }: PropertyCardProps) {
  const t = useTranslations('properties')
  const { addFavorite, removeFavorite, isFavorite } = usePreferencesStore()
  const favorite = isFavorite(property.id)

  const getStatusVariant = (status: Property['status']): 'default' | 'destructive' | 'secondary' | 'outline' => {
    switch (status) {
      case 'available':
        return 'default'
      case 'sold':
        return 'destructive'
      case 'rented':
        return 'secondary'
      case 'pending':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (favorite) {
      removeFavorite(property.id)
      toast.success('Removido dos favoritos')
    } else {
      addFavorite(property.id)
      toast.success('Adicionado aos favoritos')
    }
  }

  const priceDisplay = property.price_total
    ? formatBRL(Number(property.price_total))
    : property.price_monthly
    ? `${formatBRL(Number(property.price_monthly))}/mês`
    : 'Sob consulta'

  if (viewMode === 'list') {
    return (
      <Link href={`/properties/${property.id}`} className="block">
        <Card className="hover:shadow-lg transition-shadow group overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0">
              {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
                <img
                  src={property.images[0] as string}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Home className="h-12 w-12 text-primary/40" />
                </div>
              )}
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleFavoriteClick}
                aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Heart className={cn('h-4 w-4', favorite && 'fill-current text-destructive')} />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {property.address_city}, {property.address_state}
                    </span>
                  </div>
                </div>
                <Badge variant={getStatusVariant(property.status)}>
                  {t(`statuses.${property.status}`)}
                </Badge>
              </div>

              <p className="text-2xl font-bold text-primary mb-4">{priceDisplay}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {property.bedrooms !== null && (
                  <div className="flex items-center">
                    <BedDouble className="h-4 w-4 mr-1.5" />
                    <span>{property.bedrooms} quartos</span>
                  </div>
                )}
                {property.bathrooms !== null && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1.5" />
                    <span>{property.bathrooms} banheiros</span>
                  </div>
                )}
                {property.area_total && (
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-1.5" />
                    <span>{formatArea(Number(property.area_total))}</span>
                  </div>
                )}
                <Badge variant="outline">{t(`types.${property.property_type || 'unknown'}`)}</Badge>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  // Grid view (default)
  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-48">
          {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
            <img
              src={property.images[0] as string}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Home className="h-12 w-12 text-primary/40" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-2">
            <Badge variant={getStatusVariant(property.status)}>
              {t(`statuses.${property.status}`)}
            </Badge>
          </div>
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleFavoriteClick}
            aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <Heart className={cn('h-4 w-4', favorite && 'fill-current text-destructive')} />
          </Button>
        </div>

        {/* Content */}
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {property.address_city}, {property.address_state}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className="text-2xl font-bold text-primary">{priceDisplay}</p>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {property.bedrooms !== null && (
              <div className="flex items-center">
                <BedDouble className="h-4 w-4 mr-1" />
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms !== null && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.area_total && (
              <div className="flex items-center">
                <Home className="h-4 w-4 mr-1" />
                <span>{formatArea(Number(property.area_total))}</span>
              </div>
            )}
          </div>

          <Badge variant="outline" className="text-xs">
            {t(`types.${property.property_type || 'unknown'}`)}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  )
}
