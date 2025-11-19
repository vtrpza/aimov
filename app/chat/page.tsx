'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatWelcome } from '@/components/chat/ChatWelcome'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { ChatTypingIndicator } from '@/components/chat/ChatTypingIndicator'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { Send, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatStore } from '@/store/chat-store'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  const t = useTranslations('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Chat store
  const {
    conversations,
    currentConversationId,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    updateConversationTitle,
  } = useChatStore()

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: [],
    onFinish: (message) => {
      console.log('✅ Message finished:', message)
    },
    onError: (error) => {
      console.error('❌ Chat error:', error)
    },
  })

  const isLoading = status === 'streaming'
  const hasMessages = messages.length > 0

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // Initialize first conversation if none exists
  useEffect(() => {
    if (conversations.length === 0 && !currentConversationId) {
      createConversation()
    }
  }, [conversations.length, currentConversationId, createConversation])

  const handleSendMessage = (text: string) => {
    const trimmedInput = text.trim()
    if (trimmedInput && !isLoading) {
      sendMessage({ text: trimmedInput })
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  const handleNewConversation = () => {
    createConversation()
    setMobileMenuOpen(false)
  }

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt)
  }

  // Sidebar Component (shared for desktop and mobile)
  const sidebarContent = (
    <ChatSidebar
      conversations={conversations}
      currentConversationId={currentConversationId}
      onNewConversation={handleNewConversation}
      onSelectConversation={(id) => {
        setCurrentConversation(id)
        setMobileMenuOpen(false)
      }}
      onDeleteConversation={deleteConversation}
      onRenameConversation={updateConversationTitle}
    />
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 lg:w-80 border-r border-border flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 p-4 border-b border-border bg-background">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              {sidebarContent}
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold truncate">{t('title')}</h1>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            <ChatWelcome onPromptClick={handlePromptClick} />
          ) : (
            <div className="max-w-4xl mx-auto w-full">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role as 'user' | 'assistant' | 'system'}
                  parts={message.parts}
                />
              ))}
              {isLoading && <ChatTypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border bg-background">
          <form onSubmit={onSubmit} className="p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('placeholder')}
                    disabled={isLoading}
                    rows={1}
                    className={cn(
                      'w-full resize-none rounded-xl border border-input bg-background',
                      'px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      'max-h-32 overflow-y-auto min-h-[52px]',
                      'transition-all duration-200'
                    )}
                  />
                  {/* Character count hint */}
                  {input.length > 0 && (
                    <div className="absolute bottom-2 right-14 text-xs text-muted-foreground">
                      {input.length}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className={cn(
                    'h-[52px] w-[52px] rounded-xl flex-shrink-0',
                    'transition-all duration-200',
                    input.trim() && !isLoading
                      ? 'bg-primary hover:bg-primary/90 scale-100'
                      : 'scale-95'
                  )}
                  aria-label={t('send')}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              {/* Helper text */}
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {t('placeholderHint')}
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
