'use client'

import { useTranslations } from 'next-intl'
import { Plus, MessageSquare, Trash2, MoreVertical, Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Conversation } from '@/store/chat-store'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onRenameConversation: (id: string, title: string) => void
}

export function ChatSidebar({
  conversations,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
}: ChatSidebarProps) {
  const t = useTranslations('chat')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id)
    setEditingTitle(conversation.title)
  }

  const saveEdit = (id: string) => {
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim())
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  // Sort conversations by updatedAt (most recent first)
  const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)

  return (
    <div className="flex flex-col h-full bg-muted/30 border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={onNewConversation}
          className="w-full justify-start gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          {t('newConversation')}
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sortedConversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                {t('noConversations')}
              </p>
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={cn(
                  'group relative rounded-lg transition-all',
                  currentConversationId === conversation.id
                    ? 'bg-accent'
                    : 'hover:bg-accent/50'
                )}
              >
                {editingId === conversation.id ? (
                  <div className="flex items-center gap-1 p-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(conversation.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 flex-shrink-0"
                      onClick={() => saveEdit(conversation.id)}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 flex-shrink-0"
                      onClick={cancelEdit}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className="w-full text-left p-3 pr-10 rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {conversation.messages.length} {conversation.messages.length === 1 ? 'mensagem' : 'mensagens'}
                        </p>
                      </div>
                    </div>
                  </button>
                )}

                {editingId !== conversation.id && (
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(conversation)
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm('Tem certeza que deseja excluir esta conversa?')) {
                              onDeleteConversation(conversation.id)
                            }
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
