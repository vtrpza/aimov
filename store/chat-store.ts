'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: MessagePart[]
  createdAt: number
}

export interface MessagePart {
  type: string
  text?: string
  toolCallId?: string
  toolName?: string
  args?: any
  result?: any
  isError?: boolean
  [key: string]: any
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface ChatState {
  conversations: Conversation[]
  currentConversationId: string | null

  // Actions
  createConversation: () => string
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string) => void
  addMessage: (conversationId: string, message: Message) => void
  updateConversationTitle: (id: string, title: string) => void
  clearAllConversations: () => void
  getCurrentConversation: () => Conversation | null
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const generateTitle = (firstMessage?: string) => {
  if (!firstMessage) return 'Nova Conversa'
  const preview = firstMessage.slice(0, 40)
  return preview.length < firstMessage.length ? `${preview}...` : preview
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: () => {
        const id = generateId()
        const now = Date.now()
        const newConversation: Conversation = {
          id,
          title: 'Nova Conversa',
          messages: [],
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          conversations: [...state.conversations, newConversation],
          currentConversationId: id,
        }))

        return id
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id)
          const newCurrentId =
            state.currentConversationId === id
              ? newConversations[0]?.id || null
              : state.currentConversationId

          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          }
        })
      },

      setCurrentConversation: (id) => {
        set({ currentConversationId: id })
      },

      addMessage: (conversationId, message) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              // Auto-generate title from first user message
              const isFirstUserMessage =
                conv.messages.length === 0 && message.role === 'user'
              const firstMessageText = message.parts.find((p) => p.type === 'text')?.text

              return {
                ...conv,
                messages: [...conv.messages, message],
                title:
                  isFirstUserMessage && firstMessageText
                    ? generateTitle(firstMessageText)
                    : conv.title,
                updatedAt: Date.now(),
              }
            }
            return conv
          })

          return { conversations }
        })
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title, updatedAt: Date.now() } : conv
          ),
        }))
      },

      clearAllConversations: () => {
        set({ conversations: [], currentConversationId: null })
      },

      getCurrentConversation: () => {
        const state = get()
        return (
          state.conversations.find((c) => c.id === state.currentConversationId) || null
        )
      },
    }),
    {
      name: 'chat-history',
      storage: createJSONStorage(() => localStorage),
      // Only persist conversations, not currentConversationId
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
)
