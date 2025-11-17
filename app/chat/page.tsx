'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChatMessage } from '@/components/chat/ChatMessage'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, FormEvent, useState } from 'react'
import { Loader2, Send } from 'lucide-react'

export default function ChatPage() {
  const t = useTranslations('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: t('welcomeMessage') }],
      },
    ],
    onFinish: (message) => {
      console.log('✅ Message finished:', message)
    },
    onError: (error) => {
      console.error('❌ Chat error:', error)
    },
  })

  // Debug: Log messages when they change
  useEffect(() => {
    console.log('💬 Messages updated:', messages.length, messages)
  }, [messages])

  const isLoading = status === 'streaming'

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (trimmedInput) {
      sendMessage({ text: trimmedInput })
      setInput('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role as 'user' | 'assistant' | 'system'}
              parts={message.parts}
            />
          ))}
          {isLoading && (
            <div className="flex gap-3 py-6 px-4 sm:px-6 bg-muted/50">
              <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-success text-success-foreground flex items-center justify-center">
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground">
                  {t('typing')}
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={onSubmit} className="border-t border-border bg-background p-4 sticky bottom-0">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder')}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 max-h-32 overflow-y-auto min-h-[44px] touch-manipulation"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 bg-primary text-primary-foreground h-11 w-11 rounded-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center touch-manipulation min-h-[44px] min-w-[44px]"
            aria-label="Enviar mensagem"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  )
}
