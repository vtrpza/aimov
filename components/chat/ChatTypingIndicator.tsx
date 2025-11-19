'use client'

import { Bot } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ChatTypingIndicator() {
  return (
    <div className="flex gap-3 py-6 px-4 sm:px-6 bg-muted/50">
      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
        <AvatarFallback className="bg-success text-success-foreground">
          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 flex items-center gap-1 pt-1">
        <div className="flex gap-1">
          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }} />
          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }} />
          <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }} />
        </div>
      </div>
    </div>
  )
}
