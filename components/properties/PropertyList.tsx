'use client'

import { useState, useMemo } from 'react'
import { PropertyCard } from './PropertyCard'
import { PropertyFilters } from './PropertyFilters'
import { PropertyListSkeleton } from './PropertyCardSkeleton'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid3x3, List, Heart } from 'lucide-react'
import { usePreferencesStore, PropertyFilters as FiltersType } from '@/store/preferences-store'
import type { Database } from '@/types/database'
import Link from 'next/link'

type Property = Database['public']['Tables']['properties']['Row']

interface PropertyListProps {
  initialProperties: Property[]
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'area_desc'

// Helper function to check if listing is for sale (handles both 'sale' and legacy 'buy')
const isForSale = (listingType: string | null): boolean => {
  return listingType === 'sale' || listingType === 'buy'
}

export function PropertyList({ initialProperties }: PropertyListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const { propertyViewMode, setPropertyViewMode, propertyFilters, favoritePropertyIds } = usePreferencesStore()

  // Apply filters and sorting
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = [...initialProperties]

    // Apply favorites filter
    if (showOnlyFavorites) {
      filtered = filtered.filter((p) => favoritePropertyIds.includes(p.id))
    }

    // Apply filters
    if (propertyFilters.listingType && propertyFilters.listingType !== 'all') {
      filtered = filtered.filter((p) => p.listing_type === propertyFilters.listingType)
    }

    if (propertyFilters.minPrice !== undefined || propertyFilters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => {
        const price = isForSale(p.listing_type) ? p.price_total : p.price_monthly
        if (!price) return false

        const minOk = propertyFilters.minPrice === undefined || price >= propertyFilters.minPrice
        const maxOk = propertyFilters.maxPrice === undefined || price <= propertyFilters.maxPrice
        return minOk && maxOk
      })
    }

    if (propertyFilters.bedrooms) {
      filtered = filtered.filter((p) => (p.bedrooms || 0) >= propertyFilters.bedrooms!)
    }

    if (propertyFilters.bathrooms) {
      filtered = filtered.filter((p) => (p.bathrooms || 0) >= propertyFilters.bathrooms!)
    }

    if (propertyFilters.propertyType && propertyFilters.propertyType.length > 0) {
      filtered = filtered.filter((p) => p.property_type && propertyFilters.propertyType!.includes(p.property_type))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()

        case 'price_asc': {
          const priceA = isForSale(a.listing_type) ? a.price_total : a.price_monthly
          const priceB = isForSale(b.listing_type) ? b.price_total : b.price_monthly
          return (priceA || 0) - (priceB || 0)
        }

        case 'price_desc': {
          const priceA = isForSale(a.listing_type) ? a.price_total : a.price_monthly
          const priceB = isForSale(b.listing_type) ? b.price_total : b.price_monthly
          return (priceB || 0) - (priceA || 0)
        }

        case 'area_desc':
          return (b.area_sqm || 0) - (a.area_sqm || 0)

        default:
          return 0
      }
    })

    return filtered
  }, [initialProperties, propertyFilters, sortBy, showOnlyFavorites, favoritePropertyIds])

  const activeFiltersCount = Object.keys(propertyFilters).filter(
    (key) => propertyFilters[key as keyof FiltersType] !== undefined
  ).length

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <PropertyFilters onFiltersChange={() => {}} />

          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais Recentes</SelectItem>
              <SelectItem value="price_asc">Menor Preço</SelectItem>
              <SelectItem value="price_desc">Maior Preço</SelectItem>
              <SelectItem value="area_desc">Maior Área</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showOnlyFavorites ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            aria-label="Filtrar favoritos"
          >
            <Heart className={showOnlyFavorites ? 'fill-current' : ''} />
          </Button>
        </div>

        {/* View Mode Toggle (Hidden on mobile) */}
        <div className="hidden sm:flex items-center gap-2 border rounded-lg p-1">
          <Button
            variant={propertyViewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setPropertyViewMode('grid')}
            aria-label="Visualização em grade"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={propertyViewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setPropertyViewMode('list')}
            aria-label="Visualização em lista"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          {filteredAndSortedProperties.length} {filteredAndSortedProperties.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          {activeFiltersCount > 0 && ` (${activeFiltersCount} ${activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'})`}
        </p>
        {showOnlyFavorites && favoritePropertyIds.length === 0 && (
          <Link href="/chat" className="text-primary hover:underline">
            Começar busca →
          </Link>
        )}
      </div>

      {/* Property Grid/List */}
      {filteredAndSortedProperties.length > 0 ? (
        <div className={propertyViewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
          {filteredAndSortedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} viewMode={propertyViewMode} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground text-lg mb-4">
            {showOnlyFavorites
              ? 'Você ainda não tem imóveis favoritos'
              : 'Nenhum imóvel encontrado com os filtros selecionados'}
          </p>
          {(activeFiltersCount > 0 || showOnlyFavorites) && (
            <Button
              variant="outline"
              onClick={() => {
                setShowOnlyFavorites(false)
                usePreferencesStore.getState().clearPropertyFilters()
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
