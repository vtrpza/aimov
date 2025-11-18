'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronRight, Home, Bed, Maximize, Loader2 } from 'lucide-react'
import { formatBRL } from '@/lib/utils/brazilian-formatters'
import Link from 'next/link'
import type { PropertySample } from '@/lib/analytics/types'

interface PropertySimilarityExplorerProps {
  samples: PropertySample[]
}

interface SimilarProperty {
  id: string
  title: string
  similarity: number
  price: number
  propertyType: string
  neighborhood: string | null
  bedrooms: number | null
  area: number | null
}

export function PropertySimilarityExplorer({ samples }: PropertySimilarityExplorerProps) {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [similarProperties, setSimilarProperties] = useState<SimilarProperty[]>([])
  const [loading, setLoading] = useState(false)

  const findSimilar = async (propertyId: string) => {
    setLoading(true)
    setSelectedProperty(propertyId)

    try {
      const response = await fetch(`/api/properties/similar/${propertyId}`)
      if (!response.ok) throw new Error('Failed to fetch similar properties')

      const data = await response.json()
      setSimilarProperties(data.similar || [])
    } catch (error) {
      console.error('Error finding similar properties:', error)
      setSimilarProperties([])
    } finally {
      setLoading(false)
    }
  }

  if (!samples || samples.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold">Explorador de Similaridade</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">
          Sem dados disponíveis
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-md">
          <Sparkles className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold">Imóveis Similares</h3>
          <p className="text-sm text-muted-foreground">
            Clique em um imóvel para encontrar outros 5 imóveis parecidos
          </p>
        </div>
      </div>

      {/* Sample properties */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {samples.map((property) => (
          <button
            key={property.id}
            onClick={() => findSimilar(property.id)}
            disabled={loading}
            className={`group p-4 rounded-xl text-left transition-all duration-300 disabled:opacity-50 border-2 ${
              selectedProperty === property.id
                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg scale-[1.02]'
                : 'border-muted hover:border-purple-300 hover:shadow-md hover:scale-[1.02]'
            }`}
          >
            <div className="aspect-video bg-gradient-to-br from-purple-100 via-pink-100 to-violet-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <Home className="h-10 w-10 text-purple-400 relative z-10" />
            </div>
            
            <p className="font-bold text-sm truncate mb-2 text-foreground group-hover:text-purple-600 transition-colors">
              {property.title}
            </p>
            
            <p className="text-sm text-purple-600 font-bold mb-2">
              {formatBRL(property.price)}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {property.bedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  {property.bedrooms}
                </span>
              )}
              {property.area && (
                <span className="flex items-center gap-1">
                  <Maximize className="h-3 w-3" />
                  {property.area}m²
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Similar properties results */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-purple-50 border-2 border-purple-200">
            <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
            <p className="text-sm font-semibold text-purple-700">
              Analisando similaridade com IA...
            </p>
          </div>
        </div>
      )}

      {!loading && similarProperties.length > 0 && (
        <div className="border-t pt-8">
          <div className="flex items-center gap-2 mb-6">
            <ChevronRight className="h-5 w-5 text-purple-600" />
            <h4 className="font-bold text-lg">
              Imóveis Similares Encontrados ({similarProperties.length})
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarProperties.map((similar) => (
              <div
                key={similar.id}
                className="group p-5 rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-white hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="font-bold text-sm flex-1 truncate pr-2 text-foreground">
                    {similar.title}
                  </p>
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-md">
                    <span className="text-xs font-bold text-white">
                      {Math.round(similar.similarity * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-purple-600 font-bold mb-3 text-base">
                  {formatBRL(similar.price)}
                </p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {similar.bedrooms && (
                    <span className="flex items-center gap-1 font-medium">
                      <Bed className="h-3.5 w-3.5" />
                      {similar.bedrooms}
                    </span>
                  )}
                  {similar.area && (
                    <span className="flex items-center gap-1 font-medium">
                      <Maximize className="h-3.5 w-3.5" />
                      {similar.area}m²
                    </span>
                  )}
                </div>

                <Link href={`/properties/${similar.id}`}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full text-xs font-semibold border-purple-300 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-400"
                  >
                    Ver Detalhes
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && selectedProperty && similarProperties.length === 0 && (
        <div className="text-center py-16 border-t">
          <div className="inline-block p-6 rounded-xl bg-muted/30">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground font-medium">
              Nenhum imóvel similar encontrado.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}
