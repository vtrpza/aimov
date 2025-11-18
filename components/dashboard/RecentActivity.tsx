'use client'

import { Card } from '@/components/ui/card'
import { Users, Calendar, MessageSquare, Building2, Clock } from 'lucide-react'
import { useTranslations } from 'next-intl'
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

const ACTIVITY_STYLES = {
  client: {
    iconBg: 'bg-gradient-to-br from-emerald-100 to-green-100',
    iconColor: 'text-emerald-600',
    gradient: 'from-emerald-500 to-green-600',
  },
  viewing: {
    iconBg: 'bg-gradient-to-br from-purple-100 to-violet-100',
    iconColor: 'text-purple-600',
    gradient: 'from-purple-500 to-violet-600',
  },
  chat: {
    iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
    iconColor: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-600',
  },
  property: {
    iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100',
    iconColor: 'text-orange-600',
    gradient: 'from-orange-500 to-amber-600',
  },
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'Agora mesmo'
  if (seconds < 3600) return `Há ${Math.floor(seconds / 60)} minutos`
  if (seconds < 86400) return `Há ${Math.floor(seconds / 3600)} horas`
  return `Há ${Math.floor(seconds / 86400)} dias`
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const t = useTranslations('dashboard.recentActivity')

  if (activities.length === 0) {
    return (
      <Card className="p-8 border-0 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-slate-600" />
          </div>
          <h3 className="text-xl font-bold">{t('title')}</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-12">
          {t('empty')}
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center shadow-md">
          <Clock className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">{t('title')}</h3>
          <p className="text-sm text-muted-foreground">Últimas atividades do sistema</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {activities.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type]
          const styles = ACTIVITY_STYLES[activity.type]
          
          return (
            <div 
              key={activity.id} 
              className="group flex items-start gap-4 p-4 rounded-xl hover:bg-muted/30 transition-all duration-200 relative overflow-hidden"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${styles.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className={`relative h-12 w-12 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`h-6 w-6 ${styles.iconColor}`} />
              </div>
              
              <div className="flex-1 min-w-0 relative">
                <p className="text-sm font-bold text-foreground mb-1">
                  {activity.title}
                </p>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{getTimeAgo(activity.timestamp)}</span>
                </div>
              </div>

              {/* Activity type badge */}
              <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                <div className={`px-2 py-1 rounded-full bg-gradient-to-r ${styles.gradient} shadow-sm`}>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                    {activity.type}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {activities.length > 5 && (
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground font-medium">
            Mostrando {activities.length} atividades recentes
          </p>
        </div>
      )}
    </Card>
  )
}
