'use client'

import { useTranslations } from 'next-intl'
import { Bot, Users, Target, TrendingUp, Search, MessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void
}

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
    prompt: 'Apartamentos de 2-3 quartos em condomínios com piscina, entre R$ 300k-500k em São Paulo',
    category: 'smart-search',
  },
]

export function ChatWelcome({ onPromptClick }: ChatWelcomeProps) {
  const t = useTranslations('chat')

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto px-4 py-8">
      {/* Logo/Icon */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
          <Bot className="h-8 w-8 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('title')}
          </h1>
          <p className="text-muted-foreground max-w-lg">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {SUGGESTED_PROMPTS.map((suggestion, idx) => {
          const Icon = suggestion.icon
          return (
            <Card
              key={idx}
              className="p-4 cursor-pointer hover:bg-accent hover:border-primary/50 transition-all duration-200 hover:shadow-md group"
              onClick={() => onPromptClick(suggestion.prompt)}
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1 text-foreground">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {suggestion.prompt}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Helper Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p className="flex items-center gap-2 justify-center">
          <MessageSquare className="h-4 w-4" />
          {t('helperText')}
        </p>
      </div>
    </div>
  )
}
