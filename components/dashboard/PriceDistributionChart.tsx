'use client'

import { Card } from '@/components/ui/card'
import { DollarSign, Home, TrendingUp } from 'lucide-react'
import { formatBRL } from '@/lib/utils/brazilian-formatters'
import type { PriceRange } from '@/lib/analytics/types'

interface PriceDistributionChartProps {
  data: PriceRange[]
}

export function PriceDistributionChart({ data }: PriceDistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-violet-600" />
          </div>
          <h3 className="text-xl font-bold">Distribuição de Preços</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">
          Sem dados disponíveis
        </p>
      </Card>
    )
  }

  const rentData = data.filter(r => r.rentCount > 0)
  const saleData = data.filter(r => r.saleCount > 0)
  const maxRentCount = Math.max(...rentData.map(d => d.rentCount), 1)
  const maxSaleCount = Math.max(...saleData.map(d => d.saleCount), 1)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ALUGUEL */}
      <Card className="p-8 border-2 border-blue-300 shadow-lg shadow-blue-500/20 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-100 to-cyan-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center shadow-lg shadow-blue-600/40">
            <Home className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-blue-950">Imóveis para Aluguel</h3>
            <p className="text-sm text-blue-800 font-semibold">Distribuição por faixa de valor mensal</p>
          </div>
        </div>

        <div className="space-y-5">
          {rentData.length === 0 ? (
            <p className="text-center text-blue-600 py-8">Nenhum imóvel para aluguel cadastrado</p>
          ) : (
            rentData.map((range, idx) => {
              const width = (range.rentCount / maxRentCount) * 100

              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-bold text-blue-950">{range.label}</span>
                    <div className="flex items-center gap-3">
                      {range.avgRentPrice > 0 && (
                        <span className="text-blue-700 font-bold">
                          {formatBRL(range.avgRentPrice)}/mês
                        </span>
                      )}
                      <span className="text-blue-950 font-bold bg-blue-200 px-3 py-1.5 rounded-lg border border-blue-400">
                        {range.rentCount} {range.rentCount === 1 ? 'imóvel' : 'imóveis'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-blue-300 rounded-xl h-14 overflow-hidden border-2 border-blue-400 group-hover:border-blue-600 group-hover:shadow-lg transition-all duration-300 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 transition-all duration-500 flex items-center justify-center shadow-sm"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-base font-bold text-white drop-shadow-md">
                        {range.rentCount}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="mt-6 pt-6 border-t-2 border-blue-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-blue-900">Total de Aluguéis</span>
            <span className="text-3xl font-bold text-blue-950">
              {rentData.reduce((sum, r) => sum + r.rentCount, 0)}
            </span>
          </div>
        </div>
      </Card>

      {/* VENDA */}
      <Card className="p-8 border-2 border-emerald-300 shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-emerald-100 to-green-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-600/40">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-950">Imóveis à Venda</h3>
            <p className="text-sm text-emerald-800 font-semibold">Distribuição por faixa de valor total</p>
          </div>
        </div>

        <div className="space-y-5">
          {saleData.length === 0 ? (
            <p className="text-center text-emerald-600 py-8">Nenhum imóvel à venda cadastrado</p>
          ) : (
            saleData.map((range, idx) => {
              const width = (range.saleCount / maxSaleCount) * 100

              return (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-bold text-emerald-950">{range.label}</span>
                    <div className="flex items-center gap-3">
                      {range.avgSalePrice > 0 && (
                        <span className="text-emerald-700 font-bold">
                          {formatBRL(range.avgSalePrice)}
                        </span>
                      )}
                      <span className="text-emerald-950 font-bold bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-400">
                        {range.saleCount} {range.saleCount === 1 ? 'imóvel' : 'imóveis'}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-emerald-300 rounded-xl h-14 overflow-hidden border-2 border-emerald-400 group-hover:border-emerald-600 group-hover:shadow-lg transition-all duration-300 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-green-600 transition-all duration-500 flex items-center justify-center shadow-sm"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-base font-bold text-white drop-shadow-md">
                        {range.saleCount}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="mt-6 pt-6 border-t-2 border-emerald-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-emerald-900">Total de Vendas</span>
            <span className="text-3xl font-bold text-emerald-950">
              {saleData.reduce((sum, r) => sum + r.saleCount, 0)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
