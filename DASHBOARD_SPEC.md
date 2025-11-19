# 📊 Dashboard do Corretor - Especificação Técnica

## 🎯 Objetivo

Criar um dashboard data-driven para corretores de imóveis que exibe métricas em tempo real, atividades recentes e quick actions para aumentar a produtividade.

---

## 👥 Persona do Usuário

**Nome:** Carlos Silva  
**Cargo:** Corretor de Imóveis Sênior  
**Necessidades:**
- Visualizar rapidamente quantos imóveis, clientes e visitas tem
- Entender a distribuição do portfólio (tipos de imóveis)
- Ver atividades recentes (novos leads, visitas agendadas)
- Acessar ações rápidas (buscar imóvel, novo cliente)

**Dor Atual:**
- Perde tempo abrindo múltiplas abas/sistemas
- Não tem visão consolidada do pipeline
- Não sabe quais clientes estão 'quentes'

---

## 🎨 Layout & Componentes

### **Estrutura Visual (Desktop)**

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏠 Dashboard                                    [Carlos Silva ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  📊 Imóveis  │  │  👥 Clientes │  │  📅 Visitas  │           │
│  │     123      │  │      45      │  │      12      │           │
│  │  +5 esta     │  │  +8 novos    │  │  próximos    │           │
│  │  semana      │  │  este mês    │  │  7 dias      │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                   │
│  ┌──────────────┐                                                │
│  │ 💰 Ticket    │                                                │
│  │ R$ 850.000   │                                                │
│  │ preço médio  │                                                │
│  └──────────────┘                                                │
│                                                                   │
├───────────────────────────────┬─────────────────────────────────┤
│  📈 Atividade Recente         │  🎯 Top Matches Cliente×Imóvel  │
│  ┌─────────────────────────┐  │  ┌───────────────────────────┐ │
│  │ 🆕 João Silva            │  │  │ Maria S. ↔ Apt. Jardins   │ │
│  │    Novo cliente          │  │  │ Match: 95%                │ │
│  │    Há 5 minutos          │  │  └───────────────────────────┘ │
│  │                          │  │  ┌───────────────────────────┐ │
│  │ 📅 Visita agendada       │  │  │ Pedro M. ↔ Casa Alphaville│ │
│  │    Apt. Centro           │  │  │ Match: 87%                │ │
│  │    Há 15 minutos         │  │  └───────────────────────────┘ │
│  │                          │  │  ┌───────────────────────────┐ │
│  │ 💬 Chat IA ativo         │  │  │ Ana L. ↔ Cobertura Barra  │ │
│  │    Cliente buscando      │  │  │ Match: 82%                │ │
│  │    Há 1 hora             │  │  └───────────────────────────┘ │
│  └─────────────────────────┘  │                                 │
│                                │  [Ver todos os matches →]      │
├───────────────────────────────┴─────────────────────────────────┤
│  📊 Distribuição de Imóveis por Tipo                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Apartamento   ████████████████░░░░░░  60 (48.8%)         │  │
│  │  Casa          ██████████░░░░░░░░░░░░  30 (24.4%)         │  │
│  │  Sobrado       ████░░░░░░░░░░░░░░░░░░  15 (12.2%)         │  │
│  │  Comercial     ███░░░░░░░░░░░░░░░░░░░  10 (8.1%)          │  │
│  │  Chácara       ██░░░░░░░░░░░░░░░░░░░░   8 (6.5%)          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
├───────────────────────────────────────────────────────────────┤
│  🔥 Quick Actions                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🔍 Buscar    │  │ 👤 Novo      │  │ 📅 Agendar   │         │
│  │    Imóveis   │  │    Cliente   │  │    Visita    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 📊 Insights  │  │ 💬 Chat IA   │  │ 📋 Relatório │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────────────────────────────────────────┘
```

---

## 🧩 Componentes

### **1. DashboardStats.tsx**

**Responsabilidade:** Exibir cards de métricas principais

**Props:**
```typescript
interface DashboardStatsProps {
  stats: {
    totalProperties: number
    propertiesThisWeek: number
    totalClients: number
    clientsThisMonth: number
    upcomingViewings: number
    avgPrice: number
  }
  loading?: boolean
}
```

**Estados:**
- `loading` - Skeleton durante fetch

**Métricas:**
1. **Imóveis Ativos** - Total + novos esta semana
2. **Clientes** - Total + novos este mês
3. **Visitas Agendadas** - Próximos 7 dias
4. **Ticket Médio** - Preço médio dos imóveis ativos

**Styling:**
- Grid responsivo: 1 col (mobile), 2 cols (tablet), 4 cols (desktop)
- Cards com hover effect
- Ícones coloridos por categoria

---

### **2. RecentActivity.tsx**

**Responsabilidade:** Feed de atividades recentes

**Props:**
```typescript
interface Activity {
  id: string
  type: 'client' | 'viewing' | 'chat' | 'property'
  title: string
  description?: string
  timestamp: Date
  icon: LucideIcon
}

interface RecentActivityProps {
  activities: Activity[]
  limit?: number
}
```

**Funcionalidades:**
- Lista das últimas 10 atividades
- Ordenação por timestamp (mais recente primeiro)
- Ícones diferentes por tipo
- Link para detalhes (se aplicável)

**Estados:**
- Empty state: "Nenhuma atividade recente"

---

### **3. PropertyDistribution.tsx**

**Responsabilidade:** Gráfico de barras - distribuição de imóveis por tipo

**Props:**
```typescript
interface PropertyDistribution {
  type: string
  count: number
  percentage: number
}

interface PropertyDistributionProps {
  data: PropertyDistribution[]
}
```

**Visualização:**
- Barras horizontais com gradiente
- Percentual + count
- Cores distintas por tipo
- Tooltip ao hover

---

### **4. TopMatches.tsx**

**Responsabilidade:** Exibir top 5 matches cliente × imóvel

**Props:**
```typescript
interface Match {
  clientId: string
  clientName: string
  propertyId: string
  propertyTitle: string
  matchScore: number // 0-100
}

interface TopMatchesProps {
  matches: Match[]
  onViewDetails?: (match: Match) => void
}
```

**Funcionalidades:**
- Top 5 matches ordenados por score
- Link para cliente e imóvel
- Badge com % de match
- CTA "Ver todos os matches"

---

### **5. QuickActionsPanel.tsx**

**Responsabilidade:** Grid de ações rápidas

**Props:**
```typescript
interface QuickAction {
  id: string
  title: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  color?: string
}

interface QuickActionsPanelProps {
  actions: QuickAction[]
}
```

**Ações:**
1. 🔍 Buscar Imóveis → `/properties`
2. 👤 Novo Cliente → `/clients/new`
3. 📅 Agendar Visita → `/chat` (prompt pré-preenchido)
4. 📊 Insights de Mercado → `/chat` (prompt insights)
5. 💬 Chat IA → `/chat`
6. 📋 Gerar Relatório → (Future: export PDF)

---

## 🗄️ Queries SQL

### **Query 1: Estatísticas Gerais**

```sql
-- Executar em dashboard-queries.ts
WITH property_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE status = 'active' AND deleted_at IS NULL) as total_properties,
    COUNT(*) FILTER (
      WHERE status = 'active' 
      AND deleted_at IS NULL 
      AND created_at >= NOW() - INTERVAL '7 days'
    ) as properties_this_week,
    AVG(COALESCE(price_total, price_monthly * 12)) FILTER (
      WHERE status = 'active' AND deleted_at IS NULL
    ) as avg_price
  FROM properties
),
client_stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE deleted_at IS NULL) as total_clients,
    COUNT(*) FILTER (
      WHERE deleted_at IS NULL 
      AND created_at >= NOW() - INTERVAL '30 days'
    ) as clients_this_month
  FROM clients
),
viewing_stats AS (
  SELECT 
    COUNT(*) as upcoming_viewings
  FROM viewings
  WHERE scheduled_at >= NOW() 
    AND scheduled_at <= NOW() + INTERVAL '7 days'
    AND status = 'scheduled'
)
SELECT 
  p.total_properties,
  p.properties_this_week,
  p.avg_price,
  c.total_clients,
  c.clients_this_month,
  v.upcoming_viewings
FROM property_stats p, client_stats c, viewing_stats v;
```

### **Query 2: Atividades Recentes**

```sql
SELECT 
  id,
  'client' as type,
  full_name as title,
  'Novo cliente cadastrado' as description,
  created_at as timestamp
FROM clients
WHERE deleted_at IS NULL

UNION ALL

SELECT 
  v.id,
  'viewing' as type,
  'Visita agendada' as title,
  p.title as description,
  v.created_at as timestamp
FROM viewings v
LEFT JOIN properties p ON v.property_id = p.id
WHERE v.status = 'scheduled'

ORDER BY timestamp DESC
LIMIT 10;
```

### **Query 3: Distribuição de Imóveis**

```sql
WITH total AS (
  SELECT COUNT(*) as total_count
  FROM properties
  WHERE status = 'active' AND deleted_at IS NULL
)
SELECT 
  property_type as type,
  COUNT(*) as count,
  ROUND((COUNT(*) * 100.0 / total.total_count), 1) as percentage
FROM properties, total
WHERE status = 'active' AND deleted_at IS NULL
GROUP BY property_type, total.total_count
ORDER BY count DESC;
```

### **Query 4: Top Matches (Simulado para POC)**

```sql
-- Para POC, simular matches baseado em orçamento
SELECT 
  c.id as client_id,
  c.full_name as client_name,
  p.id as property_id,
  p.title as property_title,
  CASE 
    WHEN COALESCE(p.price_total, p.price_monthly * 12) BETWEEN c.budget_min AND c.budget_max
    THEN 95
    WHEN COALESCE(p.price_total, p.price_monthly * 12) < c.budget_max * 1.1
    THEN 85
    ELSE 70
  END as match_score
FROM clients c
CROSS JOIN properties p
WHERE c.deleted_at IS NULL
  AND p.status = 'active'
  AND p.deleted_at IS NULL
  AND c.budget_min IS NOT NULL
  AND c.budget_max IS NOT NULL
ORDER BY match_score DESC
LIMIT 5;
```

---

## 📁 Estrutura de Arquivos

```
app/
  dashboard/
    page.tsx                    # Página principal do dashboard

components/
  dashboard/
    DashboardStats.tsx          # Cards de métricas (4 cards)
    RecentActivity.tsx          # Feed de atividades
    PropertyDistribution.tsx    # Gráfico de barras
    TopMatches.tsx              # Top 5 matches
    QuickActionsPanel.tsx       # Grid de ações rápidas

lib/
  analytics/
    dashboard-queries.ts        # Server-side queries SQL
    types.ts                    # TypeScript types para analytics
```

---

## 🎨 Design System

### **Cores por Categoria:**

- **Imóveis:** `text-blue-600` / `bg-blue-100`
- **Clientes:** `text-green-600` / `bg-green-100`
- **Visitas:** `text-purple-600` / `bg-purple-100`
- **Financeiro:** `text-orange-600` / `bg-orange-100`

### **Iconografia:**

- Imóveis: `Building2`, `Home`
- Clientes: `Users`, `UserPlus`
- Visitas: `Calendar`, `CalendarCheck`
- Financeiro: `DollarSign`, `TrendingUp`
- Ações: `Search`, `Plus`, `MessageSquare`

### **Espaçamento:**

- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`
- Grid gap: `gap-6`
- Card padding: `p-6`

---

## 🔐 Segurança & Performance

### **RLS (Row Level Security):**
- Queries filtram por `user_id` (corretor logado)
- Apenas dados do corretor autenticado são visíveis

### **Performance:**
- Queries otimizadas com índices
- Cache de 5 minutos para estatísticas
- Skeleton loading durante fetch
- Lazy load de gráficos (viewport)

### **Error Handling:**
- Try/catch em todas as queries
- Fallback para valores padrão (0)
- Toast de erro amigável

---

## 📊 Métricas de Sucesso

### **KPIs do Dashboard:**

1. **Tempo até primeira interação:** < 2 segundos
2. **Taxa de uso de Quick Actions:** > 40%
3. **Frequência de acesso:** 3-5x por dia
4. **Satisfação do usuário:** NPS > 8

### **A/B Testing (Futuro):**
- Posição dos cards (ordem de prioridade)
- Número de atividades exibidas (5 vs 10)
- Tipo de visualização (cards vs tabela)

---

## 🚀 Roadmap Futuro

### **Fase 2 (Próximas Sprints):**
1. Filtros de data (últimos 7/30/90 dias)
2. Gráficos interativos (Chart.js / Recharts)
3. Exportação de relatórios (PDF/Excel)
4. Notificações em tempo real (follow-ups)

### **Fase 3 (Longo Prazo):**
1. Dashboard customizável (drag & drop widgets)
2. Metas e OKRs (conversão, vendas)
3. Integração com calendário (Google/Outlook)
4. Mobile app nativo

---

## 📝 Checklist de Implementação

- [ ] Criar `lib/analytics/dashboard-queries.ts`
- [ ] Criar `lib/analytics/types.ts`
- [ ] Criar `components/dashboard/DashboardStats.tsx`
- [ ] Criar `components/dashboard/RecentActivity.tsx`
- [ ] Criar `components/dashboard/PropertyDistribution.tsx`
- [ ] Criar `components/dashboard/TopMatches.tsx`
- [ ] Criar `components/dashboard/QuickActionsPanel.tsx`
- [ ] Criar `app/dashboard/page.tsx`
- [ ] Adicionar link no Header
- [ ] Adicionar traduções pt-BR
- [ ] Testar queries SQL no Supabase
- [ ] Testar responsividade (mobile/tablet/desktop)
- [ ] Code review
- [ ] Deploy para staging

---

**Última atualização:** 2025-01-17  
**Versão:** 1.0  
**Status:** 📝 Especificação Completa
