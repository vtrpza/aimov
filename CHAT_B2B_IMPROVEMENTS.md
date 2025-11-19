# 💬 Chat B2B - Melhorias para Corretores

## 🎯 Objetivo

Transformar o chat de assistente genérico para um **assistente especializado em workflow de corretores**, com prompts B2B, quick actions e contexto profissional.

---

## 🔄 Paradigma: B2C → B2B

### **Antes (B2C - Consumidor Final):**
```
"Estou procurando um apartamento de 2 quartos em São Paulo"
→ Cliente final buscando imóvel para morar
```

### **Depois (B2B - Corretor Profissional):**
```
"Tenho um cliente com orçamento de R$ 500k, precisa de 3 quartos 
e vaga na garagem em São Paulo. Quais imóveis se encaixam?"
→ Corretor buscando para um cliente específico
```

---

## 🎯 Principais Mudanças

### **1. Prompts Sugeridos (ChatWelcome.tsx)**

#### **Antes (Genérico):**
- "Buscar Imóveis"
- "Detalhes de Imóvel"
- "Análise de Mercado"
- "Agendar Visita"

#### **Depois (B2B - Corretor):**

```typescript
const SUGGESTED_PROMPTS_B2B = [
  {
    icon: Users,
    title: 'Qualificar Novo Lead',
    prompt: 'Preciso cadastrar um novo cliente interessado em apartamentos de 2 quartos em Barueri, orçamento até R$ 400 mil',
    category: 'lead-qualification',
    color: 'green',
  },
  {
    icon: Target,
    title: 'Encontrar Match Perfeito',
    prompt: 'Tenho um cliente com orçamento de R$ 500k, precisa de 3 quartos e vaga na garagem em São Paulo. Quais imóveis se encaixam?',
    category: 'matching',
    color: 'blue',
  },
  {
    icon: TrendingUp,
    title: 'Análise de Mercado',
    prompt: 'Mostre dados de mercado para apartamentos de 2-3 quartos em Barueri nos últimos 6 meses',
    category: 'market-insights',
    color: 'purple',
  },
  {
    icon: Calendar,
    title: 'Gerenciar Agenda',
    prompt: 'Mostre minhas próximas visitas agendadas esta semana',
    category: 'schedule-management',
    color: 'orange',
  },
  {
    icon: Search,
    title: 'Busca Avançada',
    prompt: 'Apartamentos de 2-3 quartos em condomínios com piscina, entre R$ 300k-500k em São Paulo',
    category: 'smart-search',
    color: 'cyan',
  },
  {
    icon: FileText,
    title: 'Comparar Imóveis',
    prompt: 'Preciso comparar 3 apartamentos similares para apresentar ao meu cliente',
    category: 'comparison',
    color: 'indigo',
  },
]
```

---

### **2. Chat Header com Contexto Profissional**

#### **Componente: ChatHeader.tsx (Novo)**

```
┌────────────────────────────────────────────────────────┐
│ 💬 Chat IA  │  📊 12 clientes  │  📅 5 visitas hoje   │
└────────────────────────────────────────────────────────┘
```

**Dados em tempo real:**
- Total de clientes ativos
- Visitas agendadas hoje/semana
- Último lead capturado

**Props:**
```typescript
interface ChatHeaderProps {
  stats: {
    totalClients: number
    viewingsToday: number
    lastLeadTime?: Date
  }
}
```

---

### **3. Quick Actions Sidebar**

#### **Componente: ChatQuickActions.tsx (Novo)**

**Desktop (Sidebar Fixa):**
```
┌─────────────────────┐
│  ⚡ Ações Rápidas   │
├─────────────────────┤
│  🔍 Buscar Imóveis  │
│  👤 Novo Cliente    │
│  🎯 Encontrar Match │
│  📊 Insights        │
│  📅 Ver Agenda      │
│  📈 Dashboard       │
├─────────────────────┤
│  💡 Dicas:          │
│  Use comandos como: │
│  "buscar", "lead",  │
│  "agendar"          │
└─────────────────────┘
```

**Mobile (Floating Action Button + Bottom Sheet):**
```
┌──────────────┐
│              │
│   [💬 Chat]  │
│              │
│         [⚡] │ ← Floating button
└──────────────┘
```

**Ações:**

1. **🔍 Buscar Imóveis**
   - Pré-preenche: "Buscar apartamentos de [X] quartos em [cidade]"
   - Link direto: `/properties`

2. **👤 Novo Cliente**
   - Pré-preenche: "Preciso cadastrar um novo cliente"
   - Inicia flow de captura de lead

3. **🎯 Encontrar Match**
   - Pré-preenche: "Tenho um cliente com as seguintes preferências..."
   - Usa `findPropertiesForClientTool`

4. **📊 Insights de Mercado**
   - Pré-preenche: "Mostre insights de mercado para [cidade]"
   - Usa `getMarketInsightsTool`

5. **📅 Ver Agenda**
   - Pré-preenche: "Mostre minha agenda de visitas"
   - Future: Integrar com `viewings` table

6. **📈 Dashboard**
   - Link direto: `/dashboard`

---

### **4. Message Templates (Sugestões Contextuais)**

Durante a conversa, sugerir próximos passos:

**Exemplo 1 - Após buscar imóveis:**
```
Assistente: "Encontrei 5 apartamentos que correspondem aos critérios..."

[Sugestões:]
• Agendar visita neste imóvel
• Cadastrar cliente interessado
• Ver mais opções similares
• Comparar com outros imóveis
```

**Exemplo 2 - Após cadastrar lead:**
```
Assistente: "Cliente João Silva cadastrado com sucesso!"

[Sugestões:]
• Buscar imóveis para este cliente
• Ver matches automáticos
• Agendar primeira visita
• Adicionar observações
```

---

### **5. Linguagem Profissional (Tone of Voice)**

#### **Antes (Casual):**
```
"Oi! Como posso te ajudar?"
"Legal! Vou buscar isso pra você"
"Encontrei alguns imóveis bacana!"
```

#### **Depois (Profissional):**
```
"Olá! Como posso auxiliar no seu atendimento hoje?"
"Entendido. Vou consultar nossa base de imóveis."
"Localizei 5 propriedades que correspondem ao perfil do cliente."
```

**Tom adequado:**
- ✅ Profissional mas não robótico
- ✅ Direto e objetivo
- ✅ Usa terminologia do mercado ("lead", "match", "conversão")
- ✅ Oferece próximos passos claros

---

## 🎨 Modificações nos Componentes

### **ChatWelcome.tsx**

**Mudanças:**
1. Atualizar `SUGGESTED_PROMPTS` para prompts B2B
2. Adicionar cores diferentes por categoria
3. Subtitle mais específico para corretores

```diff
- {t('subtitle')}
+ "Seu assistente inteligente para gestão de clientes, 
   busca de imóveis e insights de mercado"
```

---

### **app/chat/page.tsx**

**Adicionar:**
1. `ChatHeader` no topo (desktop e mobile)
2. `ChatQuickActions` na sidebar (desktop)
3. Floating button para quick actions (mobile)

**Estrutura:**
```tsx
<div className="flex h-[calc(100vh-4rem)]">
  {/* Quick Actions Sidebar - Desktop */}
  <div className="hidden lg:block w-64 border-r">
    <ChatQuickActions />
  </div>

  {/* Main Chat */}
  <div className="flex-1 flex flex-col">
    {/* Header com stats */}
    <ChatHeader stats={stats} />
    
    {/* Messages */}
    <div className="flex-1 overflow-y-auto">
      {!hasMessages ? (
        <ChatWelcome onPromptClick={handlePromptClick} />
      ) : (
        // Messages...
      )}
    </div>

    {/* Input */}
    <ChatInput />
  </div>

  {/* Conversas Sidebar - Desktop */}
  <div className="hidden md:block w-80">
    <ChatSidebar />
  </div>
</div>

{/* Floating Quick Actions - Mobile */}
<div className="lg:hidden fixed bottom-20 right-4">
  <ChatQuickActionsFAB />
</div>
```

---

## 🆕 Novos Componentes

### **1. ChatHeader.tsx**

```typescript
'use client'

import { Users, Calendar } from 'lucide-react'

interface ChatHeaderProps {
  stats: {
    totalClients: number
    viewingsToday: number
  }
}

export function ChatHeader({ stats }: ChatHeaderProps) {
  return (
    <div className="border-b bg-muted/30 px-4 py-3">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{stats.totalClients}</span>
          <span className="text-muted-foreground">clientes</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{stats.viewingsToday}</span>
          <span className="text-muted-foreground">visitas hoje</span>
        </div>
      </div>
    </div>
  )
}
```

---

### **2. ChatQuickActions.tsx**

```typescript
'use client'

import { Search, UserPlus, Target, TrendingUp, Calendar, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const QUICK_ACTIONS = [
  { icon: Search, label: 'Buscar Imóveis', prompt: 'Buscar apartamentos' },
  { icon: UserPlus, label: 'Novo Cliente', prompt: 'Cadastrar novo cliente' },
  { icon: Target, label: 'Encontrar Match', prompt: 'Encontrar imóveis para cliente' },
  { icon: TrendingUp, label: 'Insights', prompt: 'Mostrar insights de mercado' },
  { icon: Calendar, label: 'Agenda', prompt: 'Ver agenda de visitas' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
]

export function ChatQuickActions({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold mb-3">⚡ Ações Rápidas</h3>
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        
        if (action.href) {
          return (
            <Link key={action.label} href={action.href}>
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            </Link>
          )
        }

        return (
          <Button
            key={action.label}
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => onPromptClick(action.prompt!)}
          >
            <Icon className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
```

---

### **3. ChatQuickActionsFAB.tsx** (Mobile)

```typescript
'use client'

import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ChatQuickActions } from './ChatQuickActions'

export function ChatQuickActionsFAB({ onPromptClick }: { onPromptClick: (prompt: string) => void }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <Zap className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto">
        <ChatQuickActions onPromptClick={onPromptClick} />
      </SheetContent>
    </Sheet>
  )
}
```

---

## 🌍 Traduções (i18n/messages/pt-BR.json)

```json
{
  "chat": {
    "title": "Assistente IA para Corretores",
    "subtitle": "Seu assistente inteligente para gestão de clientes, busca de imóveis e insights de mercado",
    "quickActions": "Ações Rápidas",
    "suggestions": "Sugestões",
    "contextStats": {
      "clients": "clientes",
      "viewings": "visitas",
      "today": "hoje",
      "thisWeek": "esta semana"
    },
    "prompts": {
      "qualifyLead": "Qualificar Novo Lead",
      "findMatch": "Encontrar Match Perfeito",
      "marketAnalysis": "Análise de Mercado",
      "manageSchedule": "Gerenciar Agenda",
      "advancedSearch": "Busca Avançada",
      "compareProperties": "Comparar Imóveis"
    }
  }
}
```

---

## 📊 Métricas de Sucesso

### **KPIs:**
1. **Adoption Rate de Quick Actions:** > 50% dos usuários
2. **Tempo médio de cadastro de lead:** < 2 minutos
3. **Taxa de uso de prompts sugeridos:** > 60%
4. **Satisfação com linguagem profissional:** NPS > 8

---

## 🚀 Roadmap Futuro

### **Fase 2:**
1. **Voice Input** - Gravar áudio e transcrever
2. **Templates de Respostas** - Respostas rápidas pré-definidas
3. **Menções @** - Mencionar clientes/imóveis específicos
4. **Shortcuts de Teclado** - `/buscar`, `/lead`, `/agendar`

### **Fase 3:**
1. **WhatsApp Integration** - Atendimento via WhatsApp
2. **Multi-agent Chat** - Múltiplos clientes simultaneamente
3. **Sentiment Analysis** - Detectar urgência do cliente
4. **Auto-follow-up** - Lembretes automáticos

---

## ✅ Checklist de Implementação

- [ ] Atualizar `ChatWelcome.tsx` com prompts B2B
- [ ] Criar `ChatHeader.tsx`
- [ ] Criar `ChatQuickActions.tsx`
- [ ] Criar `ChatQuickActionsFAB.tsx`
- [ ] Atualizar `app/chat/page.tsx` com novo layout
- [ ] Adicionar traduções pt-BR
- [ ] Atualizar tom de voz da IA (system prompt)
- [ ] Adicionar message templates contextuais
- [ ] Testar responsividade mobile
- [ ] Code review
- [ ] Deploy para staging

---

**Última atualização:** 2025-01-17  
**Versão:** 1.0  
**Status:** 📝 Especificação Completa
