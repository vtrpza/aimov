'use client'

import { Card } from '@/components/ui/card'
import { PieChart, TrendingUp, Home, Sparkles } from 'lucide-react'
import type { MarketInsights } from '@/lib/analytics/types'

interface MarketIntelligenceProps {
  data: MarketInsights | null
}

const TYPE_LABELS: Record<string, string> = {
  apartamento: 'Apartamentos',
  casa: 'Casas',
  sobrado: 'Sobrados',
  sala_comercial: 'Salas Comerciais',
  fazenda_sitio_chacara: 'Chácaras/Fazendas',
  loft: 'Lofts',
  cobertura: 'Coberturas',
  terreno: 'Terrenos',
}

export function MarketIntelligence({ data }: MarketIntelligenceProps) {
  if (!data) {
    return (
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold">Inteligência de Mercado</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">
          Sem dados disponíveis
        </p>
      </Card>
    )
  }

  const insights = [
    {
      icon: PieChart,
      title: 'Mix de Portfólio',
      value: `${data.portfolioMix.rentPercentage}% / ${data.portfolioMix.salePercentage}%`,
      subtitle: 'Aluguel / Venda',
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600',
      bgGradient: 'from-blue-50/50 to-cyan-50/50',
    },
    {
      icon: Home,
      title: 'Tipo Dominante',
      value: TYPE_LABELS[data.dominantType.type] || data.dominantType.type,
      subtitle: `${data.dominantType.percentage}% do portfólio`,
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'from-purple-100 to-pink-100',
      iconColor: 'text-purple-600',
      bgGradient: 'from-purple-50/50 to-pink-50/50',
    },
    {
      icon: TrendingUp,
      title: 'Faixa de Preço Líder',
      value: data.dominantPriceRange.range,
      subtitle: `${data.dominantPriceRange.percentage}% dos imóveis`,
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'from-orange-100 to-red-100',
      iconColor: 'text-orange-600',
      bgGradient: 'from-orange-50/50 to-red-50/50',
    },
    {
      icon: Sparkles,
      title: 'Feature Mais Valorizada',
      value: data.topFeature.feature,
      subtitle: `+${data.topFeature.premiumPercentage.toFixed(1)}% no preço`,
      gradient: 'from-emerald-500 to-green-500',
      iconBg: 'from-emerald-100 to-green-100',
      iconColor: 'text-emerald-600',
      bgGradient: 'from-emerald-50/50 to-green-50/50',
    },
  ]

  return (
    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shadow-md">
          <TrendingUp className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Inteligência de Mercado</h3>
          <p className="text-sm text-muted-foreground">Análise do portfólio e tendências</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, idx) => {
          const Icon = insight.icon
          return (
            <div
              key={idx}
              className="group relative p-6 rounded-xl border-2 border-transparent hover:border-current transition-all duration-300 overflow-hidden hover:shadow-lg"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${insight.bgGradient} opacity-50`} />
              
              {/* Decorative corner */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${insight.gradient} opacity-5 rounded-bl-full`} />
              
              <div className="relative flex items-start gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${insight.iconBg} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-6 w-6 ${insight.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {insight.title}
                  </p>
                  <p className="font-bold text-lg truncate mb-1 text-foreground">
                    {insight.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">
                    {insight.subtitle}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-6 border-t">
        <p className="text-xs text-muted-foreground text-center font-medium">
          Insights baseados em {data.portfolioMix.rentPercentage + data.portfolioMix.salePercentage}% do portfólio ativo
        </p>
      </div>
    </Card>
  )
}
