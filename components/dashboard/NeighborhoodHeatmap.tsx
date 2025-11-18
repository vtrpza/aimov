'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Home, TrendingUp } from 'lucide-react'
import { formatBRL } from '@/lib/utils/brazilian-formatters'
import type { NeighborhoodStats } from '@/lib/analytics/types'

interface NeighborhoodHeatmapProps {
  data: NeighborhoodStats[]
}

export function NeighborhoodHeatmap({ data }: NeighborhoodHeatmapProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'rent' | 'sale'>('all')

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-pink-600" />
          </div>
          <h3 className="text-xl font-bold">Bairros Mais Populares</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">
          Sem dados disponíveis
        </p>
      </Card>
    )
  }

  const maxPrice = Math.max(...data.map((d) => d.avgPrice))
  const minPrice = Math.min(...data.map((d) => d.avgPrice))
  const priceRange = maxPrice - minPrice

  const getPriceCategory = (avgPrice: number): 'low' | 'medium' | 'high' => {
    if (priceRange === 0) return 'medium'
    const normalized = (avgPrice - minPrice) / priceRange
    if (normalized < 0.33) return 'low'
    if (normalized < 0.66) return 'medium'
    return 'high'
  }

  const getCategoryStyles = (category: 'low' | 'medium' | 'high', listingType?: 'rent' | 'sale') => {
    if (listingType === 'rent') {
      return {
        low: { bg: 'bg-blue-100 border-blue-400', bar: 'bg-blue-500', text: 'text-blue-900' },
        medium: { bg: 'bg-blue-200 border-blue-500', bar: 'bg-blue-600', text: 'text-blue-950' },
        high: { bg: 'bg-blue-300 border-blue-600', bar: 'bg-blue-700', text: 'text-blue-950' },
      }[category]
    } else if (listingType === 'sale') {
      return {
        low: { bg: 'bg-emerald-100 border-emerald-400', bar: 'bg-emerald-500', text: 'text-emerald-900' },
        medium: { bg: 'bg-emerald-200 border-emerald-500', bar: 'bg-emerald-600', text: 'text-emerald-950' },
        high: { bg: 'bg-emerald-300 border-emerald-600', bar: 'bg-emerald-700', text: 'text-emerald-950' },
      }[category]
    }
    return {
      low: { bg: 'bg-violet-100 border-violet-400', bar: 'bg-violet-500', text: 'text-violet-900' },
      medium: { bg: 'bg-pink-200 border-pink-500', bar: 'bg-pink-600', text: 'text-pink-950' },
      high: { bg: 'bg-rose-300 border-rose-600', bar: 'bg-rose-700', text: 'text-rose-950' },
    }[category]
  }

  return (
    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center shadow-md">
          <MapPin className="h-5 w-5 text-pink-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Bairros Mais Populares</h3>
          <p className="text-sm text-muted-foreground">Top 15 bairros com mais imóveis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all" className="text-sm font-semibold">
            Todos
          </TabsTrigger>
          <TabsTrigger value="rent" className="text-sm font-semibold">
            <Home className="h-4 w-4 mr-2" />
            Aluguel
          </TabsTrigger>
          <TabsTrigger value="sale" className="text-sm font-semibold">
            <TrendingUp className="h-4 w-4 mr-2" />
            Venda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {data.map((neighborhood, idx) => {
            const category = getPriceCategory(neighborhood.avgPrice)
            const styles = getCategoryStyles(category)
            
            return (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-xl ${styles.bg}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className={`h-5 w-5 ${styles.text} flex-shrink-0`} />
                    <span className={`font-bold truncate text-lg ${styles.text}`}>
                      {neighborhood.neighborhood}
                    </span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full bg-white shadow-md ${styles.text}`}>
                    {neighborhood.count}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${styles.text}`}>Preço médio:</span>
                    <span className={`font-bold ${styles.text} text-base`}>
                      {formatBRL(neighborhood.avgPrice)}
                    </span>
                  </div>

                  {neighborhood.pricePerSqm > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className={styles.text}>Por m²:</span>
                      <span className={`font-semibold ${styles.text}`}>{formatBRL(neighborhood.pricePerSqm)}</span>
                    </div>
                  )}

                  {/* Rent/Sale breakdown */}
                  {(neighborhood.rentCount > 0 || neighborhood.saleCount > 0) && (
                    <div className="flex gap-2 text-xs pt-2 border-t border-current/20">
                      {neighborhood.rentCount > 0 && (
                        <div className="flex-1 bg-white/80 rounded-lg px-3 py-2 border-2 border-blue-400 shadow-sm">
                          <div className="text-blue-700 font-bold text-center">{neighborhood.rentCount}</div>
                          <div className="text-blue-600 text-[10px] text-center">Aluguel</div>
                        </div>
                      )}
                      {neighborhood.saleCount > 0 && (
                        <div className="flex-1 bg-white/80 rounded-lg px-3 py-2 border-2 border-emerald-400 shadow-sm">
                          <div className="text-emerald-700 font-bold text-center">{neighborhood.saleCount}</div>
                          <div className="text-emerald-600 text-[10px] text-center">Venda</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Price indicator bar */}
                <div className="mt-4 w-full bg-white/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-2.5 rounded-full ${styles.bar} transition-all duration-500 shadow-sm`}
                    style={{
                      width: `${priceRange > 0 ? ((neighborhood.avgPrice - minPrice) / priceRange) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="rent" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {data.filter(n => n.rentCount > 0).map((neighborhood, idx) => {
            const category = getPriceCategory(neighborhood.avgRentPrice)
            const styles = getCategoryStyles(category, 'rent')
            
            return (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-xl ${styles.bg}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className={`h-5 w-5 ${styles.text} flex-shrink-0`} />
                    <span className={`font-bold truncate text-lg ${styles.text}`}>
                      {neighborhood.neighborhood}
                    </span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full bg-white shadow-md ${styles.text}`}>
                    {neighborhood.rentCount}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${styles.text}`}>Aluguel médio:</span>
                    <span className={`font-bold ${styles.text} text-base`}>
                      {formatBRL(neighborhood.avgRentPrice)}<span className="text-xs font-normal">/mês</span>
                    </span>
                  </div>
                </div>

                {/* Price indicator bar */}
                <div className="mt-4 w-full bg-white/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-2.5 rounded-full ${styles.bar} transition-all duration-500 shadow-sm`}
                    style={{
                      width: `${priceRange > 0 ? ((neighborhood.avgRentPrice - minPrice) / priceRange) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="sale" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
          {data.filter(n => n.saleCount > 0).map((neighborhood, idx) => {
            const category = getPriceCategory(neighborhood.avgSalePrice)
            const styles = getCategoryStyles(category, 'sale')
            
            return (
              <div
                key={idx}
                className={`p-6 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-xl ${styles.bg}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className={`h-5 w-5 ${styles.text} flex-shrink-0`} />
                    <span className={`font-bold truncate text-lg ${styles.text}`}>
                      {neighborhood.neighborhood}
                    </span>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1.5 rounded-full bg-white shadow-md ${styles.text}`}>
                    {neighborhood.saleCount}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${styles.text}`}>Preço médio:</span>
                    <span className={`font-bold ${styles.text} text-base`}>
                      {formatBRL(neighborhood.avgSalePrice)}
                    </span>
                  </div>
                </div>

                {/* Price indicator bar */}
                <div className="mt-4 w-full bg-white/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div
                    className={`h-2.5 rounded-full ${styles.bar} transition-all duration-500 shadow-sm`}
                    style={{
                      width: `${priceRange > 0 ? ((neighborhood.avgSalePrice - minPrice) / priceRange) * 100 : 50}%`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Legend */}
      {activeTab === 'all' && (
        <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t text-sm">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-violet-500 shadow-sm" />
            <span className="text-muted-foreground font-medium">Mais Acessível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-pink-600 shadow-sm" />
            <span className="text-muted-foreground font-medium">Preço Médio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-rose-700 shadow-sm" />
            <span className="text-muted-foreground font-medium">Mais Caro</span>
          </div>
        </div>
      )}
    </Card>
  )
}
