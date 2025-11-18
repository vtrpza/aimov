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
    { icon: UserPlus, label: t('newClient'), href: '/clients', color: 'bg-green-100 text-green-600 hover:bg-green-200' },
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
