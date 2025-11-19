# 🚀 Plano de Implementação - Dashboard B2B + Chat

## 📋 Visão Geral

Este documento detalha o plano passo-a-passo para implementar o Dashboard do Corretor e melhorias B2B no Chat.

**Tempo estimado:** 4-6 horas  
**Complexidade:** Média  
**Prioridade:** Alta

---

## 🎯 Objetivos

1. ✅ Criar Dashboard funcional com métricas em tempo real
2. ✅ Atualizar Chat com foco B2B (prompts profissionais)
3. ✅ Adicionar Quick Actions para produtividade
4. ✅ Melhorar UX com contexto profissional

---

## 📊 Ordem de Implementação

### **FASE 1: Fundação (1h)**
Criar estrutura base e queries SQL

### **FASE 2: Dashboard (2h)**
Implementar componentes e página do dashboard

### **FASE 3: Chat B2B (1h)**
Atualizar prompts e adicionar quick actions

### **FASE 4: Integração (30min)**
Conectar tudo e adicionar navegação

### **FASE 5: Testes (30min-1h)**
Testar funcionalidades e responsividade

---

## 🔧 FASE 1: Fundação

### **1.1 Criar Types para Analytics**

**Arquivo:** `lib/analytics/types.ts`

```typescript
export interface DashboardStats {
  totalProperties: number
  propertiesThisWeek: number
  totalClients: number
  clientsThisMonth: number
  upcomingViewings: number
  avgPrice: number
}

export interface Activity {
  id: string
  type: 'client' | 'viewing' | 'chat' | 'property'
  title: string
  description?: string
  timestamp: Date
}

export interface PropertyDistribution {
  type: string
  count: number
  percentage: number
}

export interface PropertyMatch {
  clientId: string
  clientName: string
  propertyId: string
  propertyTitle: string
  matchScore: number
}

export interface QuickAction {
  id: string
  title: string
  icon: string
  href?: string
  prompt?: string
  color?: string
}
```

---

### **1.2 Criar Dashboard Queries**

**Arquivo:** `lib/analytics/dashboard-queries.ts`

```typescript
import { createClient } from '@/lib/supabase/server'
import type { DashboardStats, Activity, PropertyDistribution, PropertyMatch } from './types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  // Query estatísticas gerais
  const { data, error } = await supabase.rpc('get_dashboard_stats')

  if (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalProperties: 0,
      propertiesThisWeek: 0,
      totalClients: 0,
      clientsThisMonth: 0,
      upcomingViewings: 0,
      avgPrice: 0,
    }
  }

  return data
}

export async function getRecentActivities(limit = 10): Promise<Activity[]> {
  const supabase = await createClient()

  // Buscar clientes recentes
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  // Buscar visitas recentes
  const { data: viewings } = await supabase
    .from('viewings')
    .select('id, scheduled_at, property_id, properties(title)')
    .eq('status', 'scheduled')
    .order('created_at', { ascending: false })
    .limit(5)

  const activities: Activity[] = []

  // Mapear clientes
  clients?.forEach((client) => {
    activities.push({
      id: client.id,
      type: 'client',
      title: client.full_name,
      description: 'Novo cliente cadastrado',
      timestamp: new Date(client.created_at),
    })
  })

  // Mapear visitas
  viewings?.forEach((viewing: any) => {
    activities.push({
      id: viewing.id,
      type: 'viewing',
      title: 'Visita agendada',
      description: viewing.properties?.title || 'Imóvel',
      timestamp: new Date(viewing.scheduled_at),
    })
  })

  // Ordenar por timestamp
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
}

export async function getPropertyDistribution(): Promise<PropertyDistribution[]> {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from('properties')
    .select('property_type')
    .eq('status', 'active')
    .is('deleted_at', null)

  if (!properties) return []

  // Contar por tipo
  const distribution: Record<string, number> = {}
  const total = properties.length

  properties.forEach((p) => {
    const type = p.property_type || 'unknown'
    distribution[type] = (distribution[type] || 0) + 1
  })

  // Converter para array com percentual
  return Object.entries(distribution).map(([type, count]) => ({
    type,
    count,
    percentage: Math.round((count / total) * 100 * 10) / 10,
  }))
}

export async function getTopMatches(limit = 5): Promise<PropertyMatch[]> {
  const supabase = await createClient()

  // Para POC, simular matches baseado em orçamento
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name, budget_min, budget_max')
    .is('deleted_at', null)
    .not('budget_min', 'is', null)
    .not('budget_max', 'is', null)
    .limit(3)

  const { data: properties } = await supabase
    .from('properties')
    .select('id, title, price_total, price_monthly')
    .eq('status', 'active')
    .is('deleted_at', null)
    .limit(10)

  if (!clients || !properties) return []

  const matches: PropertyMatch[] = []

  // Calcular matches simples baseado em orçamento
  clients.forEach((client) => {
    properties.forEach((property) => {
      const price = property.price_total || (property.price_monthly || 0) * 12
      const budgetMin = client.budget_min || 0
      const budgetMax = client.budget_max || Infinity

      let matchScore = 0
      if (price >= budgetMin && price <= budgetMax) {
        matchScore = 95
      } else if (price <= budgetMax * 1.1) {
        matchScore = 85
      } else if (price <= budgetMax * 1.2) {
        matchScore = 70
      }

      if (matchScore > 0) {
        matches.push({
          clientId: client.id,
          clientName: client.full_name,
          propertyId: property.id,
          propertyTitle: property.title,
          matchScore,
        })
      }
    })
  })

  // Ordenar por score e retornar top N
  return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit)
}
```

**NOTA:** Como não temos supabase RPC, vamos criar queries diretas.

---

### **1.3 Adicionar Traduções**

**Arquivo:** `i18n/messages/pt-BR.json`

Adicionar seção `dashboard`:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "subtitle": "Visão geral das suas atividades",
    "stats": {
      "properties": "Imóveis Ativos",
      "propertiesThisWeek": "novos esta semana",
      "clients": "Clientes",
      "clientsThisMonth": "novos este mês",
      "viewings": "Visitas Agendadas",
      "upcomingViewings": "próximos 7 dias",
      "avgPrice": "Ticket Médio",
      "loading": "Carregando estatísticas..."
    },
    "recentActivity": {
      "title": "Atividade Recente",
      "empty": "Nenhuma atividade recente",
      "newClient": "Novo cliente cadastrado",
      "scheduledViewing": "Visita agendada",
      "timeAgo": {
        "justNow": "Agora mesmo",
        "minutesAgo": "minutos atrás",
        "hoursAgo": "horas atrás",
        "daysAgo": "dias atrás"
      }
    },
    "propertyDistribution": {
      "title": "Distribuição de Imóveis por Tipo",
      "empty": "Nenhum imóvel cadastrado"
    },
    "topMatches": {
      "title": "Top Matches Cliente × Imóvel",
      "match": "Match",
      "viewAll": "Ver todos os matches",
      "empty": "Nenhum match encontrado"
    },
    "quickActions": {
      "title": "Ações Rápidas",
      "searchProperties": "Buscar Imóveis",
      "newClient": "Novo Cliente",
      "scheduleViewing": "Agendar Visita",
      "marketInsights": "Insights de Mercado",
      "chatAI": "Chat IA",
      "generateReport": "Gerar Relatório"
    }
  }
}
```

---

## 🎨 FASE 2: Componentes do Dashboard

### **2.1 DashboardStats Component**

**Arquivo:** `components/dashboard/DashboardStats.tsx`

```typescript
'use client'

import { Building2, Users, Calendar, DollarSign } from 'lucide-react'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-12 w-12 rounded-lg mb-4" />
            <Skeleton className="h-8 w-20 mb-2" />
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
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: t('clients'),
      value: stats.totalClients,
      subtitle: `+${stats.clientsThisMonth} ${t('clientsThisMonth')}`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: t('viewings'),
      value: stats.upcomingViewings,
      subtitle: t('upcomingViewings'),
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: t('avgPrice'),
      value: formatBRL(stats.avgPrice),
      subtitle: 'preço médio',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.title}
            className="p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {card.title}
                </p>
                <h3 className="text-3xl font-bold mb-1">
                  {card.value}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
```

---

### **2.2 RecentActivity Component**

**Arquivo:** `components/dashboard/RecentActivity.tsx`

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { Users, Calendar, MessageSquare, Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Activity } from '@/lib/analytics/types'

interface RecentActivityProps {
  activities: Activity[]
}

const ACTIVITY_ICONS = {
  client: Users,
  viewing: Calendar,
  chat: MessageSquare,
  property: Building2,
}

const ACTIVITY_COLORS = {
  client: 'text-green-600 bg-green-100',
  viewing: 'text-purple-600 bg-purple-100',
  chat: 'text-blue-600 bg-blue-100',
  property: 'text-orange-600 bg-orange-100',
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const t = useTranslations('dashboard.recentActivity')

  if (activities.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
        <p className="text-muted-foreground text-sm text-center py-8">
          {t('empty')}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type]
          const colorClass = ACTIVITY_COLORS[activity.type]
          
          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`h-10 w-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(activity.timestamp, {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
```

---

### **2.3 PropertyDistribution Component**

**Arquivo:** `components/dashboard/PropertyDistribution.tsx`

```typescript
'use client'

import { Card } from '@/components/ui/card'
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

const TYPE_COLORS: Record<string, string> = {
  apartamento: 'bg-blue-500',
  casa: 'bg-green-500',
  sobrado: 'bg-purple-500',
  sala_comercial: 'bg-orange-500',
  fazenda_sitio_chacara: 'bg-pink-500',
  unknown: 'bg-gray-500',
}

export function PropertyDistribution({ data }: PropertyDistributionProps) {
  const t = useTranslations('dashboard.propertyDistribution')

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
        <p className="text-muted-foreground text-sm text-center py-8">
          {t('empty')}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.type}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">
                {TYPE_LABELS[item.type] || item.type}
              </span>
              <span className="text-muted-foreground">
                {item.count} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${TYPE_COLORS[item.type] || TYPE_COLORS.unknown}`}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
```

---

### **2.4 QuickActionsPanel Component**

**Arquivo:** `components/dashboard/QuickActionsPanel.tsx`

```typescript
'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, UserPlus, Calendar, TrendingUp, MessageSquare, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function QuickActionsPanel() {
  const t = useTranslations('dashboard.quickActions')

  const actions = [
    { icon: Search, label: t('searchProperties'), href: '/properties', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
    { icon: UserPlus, label: t('newClient'), href: '/clients/new', color: 'bg-green-100 text-green-600 hover:bg-green-200' },
    { icon: Calendar, label: t('scheduleViewing'), href: '/chat', color: 'bg-purple-100 text-purple-600 hover:bg-purple-200' },
    { icon: TrendingUp, label: t('marketInsights'), href: '/chat', color: 'bg-orange-100 text-orange-600 hover:bg-orange-200' },
    { icon: MessageSquare, label: t('chatAI'), href: '/chat', color: 'bg-cyan-100 text-cyan-600 hover:bg-cyan-200' },
    { icon: FileText, label: t('generateReport'), href: '#', color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{t('title')}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link key={action.label} href={action.href}>
              <Button
                variant="ghost"
                className={`w-full h-auto flex-col gap-2 p-4 ${action.color}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium text-center">
                  {action.label}
                </span>
              </Button>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}
```

---

### **2.5 Dashboard Page**

**Arquivo:** `app/dashboard/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import { DashboardStatsCards } from '@/components/dashboard/DashboardStats'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { PropertyDistribution } from '@/components/dashboard/PropertyDistribution'
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel'
import {
  getDashboardStats,
  getRecentActivities,
  getPropertyDistribution,
} from '@/lib/analytics/dashboard-queries'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Você precisa estar logado para acessar o dashboard</p>
      </div>
    )
  }

  // Fetch all data in parallel
  const [stats, activities, distribution] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(),
    getPropertyDistribution(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Visão geral das suas atividades e métricas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <DashboardStatsCards stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RecentActivity activities={activities} />
          <PropertyDistribution data={distribution} />
        </div>

        {/* Quick Actions */}
        <QuickActionsPanel />
      </div>
    </div>
  )
}
```

---

## 💬 FASE 3: Chat B2B

### **3.1 Atualizar ChatWelcome**

**Arquivo:** `components/chat/ChatWelcome.tsx`

Atualizar `SUGGESTED_PROMPTS`:

```typescript
import { Users, Target, TrendingUp, Calendar, Search, FileText } from 'lucide-react'

const SUGGESTED_PROMPTS = [
  {
    icon: Users,
    title: 'Qualificar Novo Lead',
    prompt: 'Preciso cadastrar um novo cliente interessado em apartamentos de 2 quartos em Barueri, orçamento até R$ 400 mil',
    category: 'lead-qualification',
  },
  {
    icon: Target,
    title: 'Encontrar Match Perfeito',
    prompt: 'Tenho um cliente com orçamento de R$ 500k, precisa de 3 quartos e vaga na garagem em São Paulo. Quais imóveis se encaixam?',
    category: 'matching',
  },
  {
    icon: TrendingUp,
    title: 'Análise de Mercado',
    prompt: 'Mostre dados de mercado para apartamentos de 2-3 quartos em Barueri',
    category: 'market-insights',
  },
  {
    icon: Search,
    title: 'Busca Avançada',
    prompt: 'Apartamentos de 2-3 quartos em condomínios com piscina, entre R$ 300k-500k',
    category: 'smart-search',
  },
]
```

---

## 🔗 FASE 4: Integração

### **4.1 Atualizar Header**

**Arquivo:** `components/layout/Header.tsx`

Adicionar link para Dashboard:

```typescript
// Após ler o arquivo atual, adicionar:
import { LayoutDashboard } from 'lucide-react'

// Na navegação:
<Link href="/dashboard">
  <Button variant="ghost">
    <LayoutDashboard className="h-4 w-4 mr-2" />
    Dashboard
  </Button>
</Link>
```

---

## ✅ FASE 5: Testes

### **Checklist de Testes:**

- [ ] Dashboard carrega sem erros
- [ ] Stats exibem valores corretos
- [ ] Atividades recentes aparecem
- [ ] Gráfico de distribuição funciona
- [ ] Quick actions navegam corretamente
- [ ] Chat com novos prompts funciona
- [ ] Responsivo em mobile/tablet/desktop
- [ ] Traduções estão corretas
- [ ] Loading states funcionam
- [ ] Error handling funciona

---

## 📦 Ordem de Criação de Arquivos

1. ✅ `lib/analytics/types.ts`
2. ✅ `lib/analytics/dashboard-queries.ts`
3. ✅ Atualizar `i18n/messages/pt-BR.json`
4. ✅ `components/dashboard/DashboardStats.tsx`
5. ✅ `components/dashboard/RecentActivity.tsx`
6. ✅ `components/dashboard/PropertyDistribution.tsx`
7. ✅ `components/dashboard/QuickActionsPanel.tsx`
8. ✅ `app/dashboard/page.tsx`
9. ✅ Atualizar `components/chat/ChatWelcome.tsx`
10. ✅ Atualizar `components/layout/Header.tsx`

---

**Última atualização:** 2025-01-17  
**Versão:** 1.0  
**Status:** ✅ Pronto para Implementação
