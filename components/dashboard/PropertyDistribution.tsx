'use client'

import { Card } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { PropertyDistribution } from '@/lib/analytics/types'

interface PropertyDistributionProps {
  data: PropertyDistribution[]
}

const TYPE_LABELS: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  sobrado: 'Sobrado',
  sala_comercial: 'Sala Comercial',
  fazenda_sitio_chacara: 'Chácara/Fazenda',
  unknown: 'Desconhecido',
}

const TYPE_COLORS: Record<string, { bg: string; gradient: string; text: string }> = {
  apartamento: { 
    bg: 'bg-blue-100',
    gradient: 'from-blue-400 to-blue-600',
    text: 'text-blue-700'
  },
  casa: { 
    bg: 'bg-emerald-100',
    gradient: 'from-emerald-400 to-emerald-600',
    text: 'text-emerald-700'
  },
  sobrado: { 
    bg: 'bg-purple-100',
    gradient: 'from-purple-400 to-purple-600',
    text: 'text-purple-700'
  },
  sala_comercial: { 
    bg: 'bg-orange-100',
    gradient: 'from-orange-400 to-orange-600',
    text: 'text-orange-700'
  },
  fazenda_sitio_chacara: { 
    bg: 'bg-pink-100',
    gradient: 'from-pink-400 to-pink-600',
    text: 'text-pink-700'
  },
  unknown: { 
    bg: 'bg-gray-100',
    gradient: 'from-gray-400 to-gray-600',
    text: 'text-gray-700'
  },
}

export function PropertyDistribution({ data }: PropertyDistributionProps) {
  const t = useTranslations('dashboard.propertyDistribution')

  if (data.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold">{t('title')}</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">
          {t('empty')}
        </p>
      </Card>
    )
  }

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center shadow-md">
          <Building2 className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">Distribuição por tipo de imóvel</p>
        </div>
      </div>

      <div className="space-y-5">
        {data.map((item) => {
          const colors = TYPE_COLORS[item.type] || TYPE_COLORS.unknown
          const percentage = (item.count / total) * 100

          return (
            <div key={item.type} className="group">
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${colors.gradient} shadow-sm`} />
                  <span className="font-semibold text-foreground">
                    {TYPE_LABELS[item.type] || item.type}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${colors.text}`}>
                    {item.percentage}%
                  </span>
                  <span className="text-muted-foreground font-medium">
                    {item.count} {item.count === 1 ? 'imóvel' : 'imóveis'}
                  </span>
                </div>
              </div>

              <div className="relative w-full bg-muted/30 rounded-full h-4 overflow-hidden group-hover:shadow-md transition-all duration-300">
                {/* Background indicator */}
                <div className="absolute inset-0 bg-muted/20" />
                
                {/* Progress bar with gradient */}
                <div
                  className={`h-4 rounded-full bg-gradient-to-r ${colors.gradient} transition-all duration-500 shadow-sm relative overflow-hidden`}
                  style={{ width: `${item.percentage}%` }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Count badge for larger bars */}
                {percentage > 15 && (
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <span className="text-xs font-bold text-white drop-shadow-md">
                      {item.count}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Total summary */}
      <div className="mt-6 pt-6 border-t flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Total de Imóveis</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          {total}
        </span>
      </div>
    </Card>
  )
}
