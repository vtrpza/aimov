'use client'

import { Building2, Users, Calendar, Home, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBRL } from '@/lib/utils/brazilian-formatters'
import { useTranslations } from 'next-intl'
import type { DashboardStats } from '@/lib/analytics/types'

interface DashboardStatsProps {
  stats: DashboardStats | null
  loading?: boolean
}

export function DashboardStatsCards({ stats, loading }: DashboardStatsProps) {
  const t = useTranslations('dashboard.stats')

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-8">
            <Skeleton className="h-14 w-14 rounded-xl mb-4" />
            <Skeleton className="h-9 w-24 mb-2" />
            <Skeleton className="h-4 w-32" />
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: t('properties'),
      value: stats.totalProperties,
      subtitle: `+${stats.propertiesThisWeek} ${t('propertiesThisWeek')}`,
      icon: Building2,
      gradient: 'from-violet-500 to-purple-600',
      iconBg: 'bg-gradient-to-br from-violet-100 to-purple-100',
      iconColor: 'text-violet-600',
      trend: stats.propertiesThisWeek > 0 ? '+' : '',
    },
    {
      title: t('clients'),
      value: stats.totalClients,
      subtitle: `+${stats.clientsThisMonth} ${t('clientsThisMonth')}`,
      icon: Users,
      gradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-gradient-to-br from-emerald-100 to-green-100',
      iconColor: 'text-emerald-600',
      trend: stats.clientsThisMonth > 0 ? '+' : '',
    },
    {
      title: t('viewings'),
      value: stats.upcomingViewings,
      subtitle: t('upcomingViewings'),
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-600',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
      iconColor: 'text-amber-600',
      trend: '',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.title}
              className="relative p-8 overflow-hidden hover:shadow-2xl transition-all duration-300 group border-0 shadow-lg"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    {card.title}
                  </p>
                  <h3 className="text-4xl font-bold mb-2 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                    {typeof card.value === 'number' ? card.value.toLocaleString('pt-BR') : card.value}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {card.subtitle}
                  </p>
                </div>
                <div className={`h-14 w-14 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`h-7 w-7 ${card.iconColor}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Rent vs Sale Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rent Stats */}
        <Card className="relative p-8 overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-blue-300 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-100 to-cyan-100">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-bl-full" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center shadow-xl shadow-blue-600/40">
                <Home className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-blue-950">Imóveis para Aluguel</h3>
                <p className="text-sm text-blue-700 font-semibold">Portfólio de locação</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold bg-gradient-to-br from-blue-700 to-cyan-700 bg-clip-text text-transparent drop-shadow-sm">
                  {stats.rentProperties}
                </span>
                <span className="text-xl text-blue-700 font-bold">imóveis</span>
              </div>

              <div className="pt-4 border-t-2 border-blue-300">
                <p className="text-sm text-blue-800 font-bold mb-1">Aluguel médio mensal</p>
                <p className="text-3xl font-bold text-blue-950">
                  {formatBRL(stats.avgRentPrice)}<span className="text-lg font-semibold text-blue-700">/mês</span>
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-blue-800">
                <div className="h-3 flex-1 bg-blue-300 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-sm"
                    style={{ width: `${stats.totalProperties > 0 ? (stats.rentProperties / stats.totalProperties) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-bold min-w-[3rem] text-right text-blue-950">
                  {stats.totalProperties > 0 ? Math.round((stats.rentProperties / stats.totalProperties) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Sale Stats */}
        <Card className="relative p-8 overflow-hidden hover:shadow-2xl transition-all duration-300 group border-2 border-emerald-300 shadow-lg shadow-emerald-500/20 bg-gradient-to-br from-emerald-100 to-green-100">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-bl-full" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-xl shadow-emerald-600/40">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-950">Imóveis à Venda</h3>
                <p className="text-sm text-emerald-700 font-semibold">Portfólio de vendas</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold bg-gradient-to-br from-emerald-700 to-green-700 bg-clip-text text-transparent drop-shadow-sm">
                  {stats.saleProperties}
                </span>
                <span className="text-xl text-emerald-700 font-bold">imóveis</span>
              </div>

              <div className="pt-4 border-t-2 border-emerald-300">
                <p className="text-sm text-emerald-800 font-bold mb-1">Preço médio de venda</p>
                <p className="text-3xl font-bold text-emerald-950">
                  {formatBRL(stats.avgSalePrice)}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-800">
                <div className="h-3 flex-1 bg-emerald-300 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className="h-3 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full shadow-sm"
                    style={{ width: `${stats.totalProperties > 0 ? (stats.saleProperties / stats.totalProperties) * 100 : 0}%` }}
                  />
                </div>
                <span className="font-bold min-w-[3rem] text-right text-emerald-950">
                  {stats.totalProperties > 0 ? Math.round((stats.saleProperties / stats.totalProperties) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
