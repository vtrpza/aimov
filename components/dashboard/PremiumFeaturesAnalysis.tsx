'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp, TrendingDown, Sparkles, Home } from 'lucide-react'
import { formatBRL } from '@/lib/utils/brazilian-formatters'
import type { FeatureAnalysis } from '@/lib/analytics/types'

interface PremiumFeaturesAnalysisProps {
  data: FeatureAnalysis[]
}

const FEATURE_ICONS: Record<string, string> = {
  piscina: '🏊',
  academia: '💪',
  churrasqueira: '🔥',
  'salão de festas': '🎉',
  playground: '🎪',
  elevador: '🛗',
  sauna: '🧖',
  'varanda gourmet': '🍴',
  'quadra poliesportiva': '⚽',
  'portaria 24 horas': '🔐',
}

export function PremiumFeaturesAnalysis({ data }: PremiumFeaturesAnalysisProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'rent' | 'sale'>('all')

  if (!data || data.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold">Análise de Features Premium</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">
          Sem dados disponíveis
        </p>
      </Card>
    )
  }

  const maxPercentage = Math.max(...data.map((d) => Math.abs(d.premiumPercentage)))
  const maxRentPercentage = Math.max(...data.map((d) => Math.abs(d.rentData.premiumPercentage)))
  const maxSalePercentage = Math.max(...data.map((d) => Math.abs(d.saleData.premiumPercentage)))

  return (
    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-md">
          <Sparkles className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Features Premium</h3>
          <p className="text-sm text-muted-foreground">Impacto no preço médio dos imóveis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all" className="text-sm font-semibold">
            Geral
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

        <TabsContent value="all" className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {data.map((feature, idx) => {
            const barWidth = maxPercentage > 0 ? (Math.abs(feature.premiumPercentage) / maxPercentage) * 100 : 0
            const isPositive = feature.premiumPercentage > 0
            const icon = FEATURE_ICONS[feature.feature.toLowerCase()] || '✨'

            return (
              <div key={idx} className="group p-4 rounded-xl hover:bg-muted/30 transition-all duration-200">
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold truncate capitalize block">
                        {feature.feature}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {feature.count} {feature.count === 1 ? 'imóvel' : 'imóveis'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-600" />
                    )}
                    <span
                      className={`font-bold text-base ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {feature.premiumPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar with gradient */}
                <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isPositive 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                        : 'bg-gradient-to-r from-rose-400 to-rose-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Tooltip on hover - with rent/sale breakdown */}
                <div className="hidden group-hover:block mt-3 p-3 bg-muted rounded-lg text-xs space-y-1 border">
                  <div className="font-semibold mb-2">Detalhes:</div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Com feature:</span>
                    <span className="font-semibold">{formatBRL(feature.avgPriceWith)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sem feature:</span>
                    <span className="font-semibold">{formatBRL(feature.avgPriceWithout)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">Diferença:</span>
                    <span className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatBRL(feature.pricePremium)}
                    </span>
                  </div>
                  {feature.rentData.count > 0 && (
                    <div className="flex justify-between text-blue-600 pt-1">
                      <span>Aluguel ({feature.rentData.count}):</span>
                      <span className="font-semibold">{feature.rentData.premiumPercentage > 0 ? '+' : ''}{feature.rentData.premiumPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                  {feature.saleData.count > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Venda ({feature.saleData.count}):</span>
                      <span className="font-semibold">{feature.saleData.premiumPercentage > 0 ? '+' : ''}{feature.saleData.premiumPercentage.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="rent" className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {data.filter(f => f.rentData.count > 0).map((feature, idx) => {
            const barWidth = maxRentPercentage > 0 ? (Math.abs(feature.rentData.premiumPercentage) / maxRentPercentage) * 100 : 0
            const isPositive = feature.rentData.premiumPercentage > 0
            const icon = FEATURE_ICONS[feature.feature.toLowerCase()] || '✨'

            return (
              <div key={idx} className="group p-4 rounded-xl bg-blue-50/30 hover:bg-blue-50 transition-all duration-200 border border-blue-100">
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold truncate capitalize block text-blue-900">
                        {feature.feature}
                      </span>
                      <span className="text-xs text-blue-600">
                        {feature.rentData.count} {feature.rentData.count === 1 ? 'imóvel' : 'imóveis'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-600" />
                    )}
                    <span
                      className={`font-bold text-base ${
                        isPositive ? 'text-blue-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {feature.rentData.premiumPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-blue-200/50 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isPositive 
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600' 
                        : 'bg-gradient-to-r from-rose-400 to-rose-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="hidden group-hover:block mt-3 p-3 bg-blue-100/50 rounded-lg text-xs space-y-1 border border-blue-200">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Aluguel médio com:</span>
                    <span className="font-semibold text-blue-900">{formatBRL(feature.rentData.avgPriceWith)}/mês</span>
                  </div>
                </div>
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="sale" className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {data.filter(f => f.saleData.count > 0).map((feature, idx) => {
            const barWidth = maxSalePercentage > 0 ? (Math.abs(feature.saleData.premiumPercentage) / maxSalePercentage) * 100 : 0
            const isPositive = feature.saleData.premiumPercentage > 0
            const icon = FEATURE_ICONS[feature.feature.toLowerCase()] || '✨'

            return (
              <div key={idx} className="group p-4 rounded-xl bg-emerald-50/30 hover:bg-emerald-50 transition-all duration-200 border border-emerald-100">
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold truncate capitalize block text-emerald-900">
                        {feature.feature}
                      </span>
                      <span className="text-xs text-emerald-600">
                        {feature.saleData.count} {feature.saleData.count === 1 ? 'imóvel' : 'imóveis'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-rose-600" />
                    )}
                    <span
                      className={`font-bold text-base ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {feature.saleData.premiumPercentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-emerald-200/50 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isPositive 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                        : 'bg-gradient-to-r from-rose-400 to-rose-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="hidden group-hover:block mt-3 p-3 bg-emerald-100/50 rounded-lg text-xs space-y-1 border border-emerald-200">
                  <div className="flex justify-between">
                    <span className="text-emerald-700">Preço médio com:</span>
                    <span className="font-semibold text-emerald-900">{formatBRL(feature.saleData.avgPriceWith)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-muted-foreground text-center font-medium">
          Mostrando características presentes em 10 ou mais imóveis. Os percentuais indicam quanto cada característica influencia no valor do imóvel.
        </p>
      </div>
    </Card>
  )
}
