# ⚡ Quick Reference - Chat UX/UI

## 🚀 Start

```bash
pnpm dev
# Acesse: http://localhost:3000/chat
```

---

## 📁 Arquivos Criados/Modificados

### Novos Componentes
```
components/chat/
├── ChatWelcome.tsx          # Empty state + suggested prompts
├── ChatTypingIndicator.tsx  # Animação de digitação
└── ChatSidebar.tsx          # Gerenciamento de conversas
```

### Componentes Modificados
```
components/chat/
└── ChatMessage.tsx          # Markdown + code highlighting

app/chat/
└── page.tsx                 # Layout refatorado com sidebar

i18n/messages/
└── pt-BR.json              # Novas traduções
```

### Componentes Removidos
```
components/chat/
└── ChatInput.tsx           # ❌ Removido (não estava sendo usado)
```

---

## 🎨 Principais Features

### 1. Sidebar (Desktop)
```tsx
// Auto-gerada ao iniciar
// Largura: 256px (md) | 320px (lg)
// Scroll independente
// Botão "Nova Conversa" no topo
```

### 2. Mobile Sheet
```tsx
// Sheet lateral < 768px
// Trigger: Botão hamburger (☰)
// Auto-fecha ao selecionar conversa
```

### 3. Markdown Support
```markdown
**bold** → Bold
`code` → Inline code
```js
code block → Syntax highlighted
```
• List item → Bullet list
1. Item → Numbered list
[link](url) → Clickable link
```

### 4. Conversas
```typescript
// Criar nova
createConversation()

// Renomear (inline)
updateConversationTitle(id, newTitle)

// Deletar (com confirmação)
deleteConversation(id)

// Selecionar
setCurrentConversation(id)
```

---

## 🔧 APIs Úteis

### Chat Store (Zustand)
```typescript
import { useChatStore } from '@/store/chat-store'

const {
  conversations,           // Conversation[]
  currentConversationId,   // string | null
  createConversation,      // () => string
  deleteConversation,      // (id: string) => void
  setCurrentConversation,  // (id: string) => void
  updateConversationTitle, // (id, title) => void
} = useChatStore()
```

### AI SDK
```typescript
import { useChat } from '@ai-sdk/react'

const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
})

// status: 'streaming' | 'idle' | 'error'
```

---

## 🎨 Styling Guide

### Colors
```css
/* Backgrounds */
bg-background       /* Página */
bg-muted/50        /* Mensagem assistente */
bg-accent          /* Hover states */

/* Text */
text-foreground     /* Texto principal */
text-muted-foreground /* Texto secundário */

/* Borders */
border-border       /* Bordas padrão */
```

### Spacing
```css
/* Containers */
p-4        /* Padding padrão */
gap-3      /* Gap entre elementos */
space-y-3  /* Spacing vertical */

/* Messages */
py-6 px-4  /* Padding de mensagem */
```

### Typography
```css
/* Markdown */
prose prose-sm dark:prose-invert
prose-p:leading-7
prose-headings:font-semibold
```

---

## 📱 Breakpoints

```css
/* Mobile First */
default     /* < 768px */
md:         /* ≥ 768px */
lg:         /* ≥ 1024px */

/* Exemplo */
<div className="w-full md:w-64 lg:w-80">
  Sidebar: Full width mobile, 256px tablet, 320px desktop
</div>
```

---

## 🔌 Dependências

### Markdown
```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
```

### Styles
```typescript
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'
```

---

## 🎯 Common Patterns

### Criar Nova Conversa
```typescript
const handleNewConversation = () => {
  const id = createConversation()
  // Auto-seleciona a nova conversa
  // Mostra welcome screen (sem mensagens)
}
```

### Enviar Mensagem
```typescript
const handleSendMessage = (text: string) => {
  sendMessage({ text })
  setInput('') // Limpa input
}
```

### Copiar Mensagem
```typescript
const handleCopy = async () => {
  await navigator.clipboard.writeText(textContent)
  toast.success('Mensagem copiada!')
}
```

### Auto-resize Textarea
```typescript
useEffect(() => {
  if (textareaRef.current) {
    textareaRef.current.style.height = 'auto'
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }
}, [input])
```

---

## 🐛 Debugging

### Console Logs
```typescript
// API route
onStepFinish: (step) => console.log('📍 Step:', step)
onFinish: (result) => console.log('✅ Finished:', result)
onError: (error) => console.error('❌ Error:', error)

// Chat page
useEffect(() => {
  console.log('💬 Messages:', messages)
}, [messages])
```

### Check Store
```typescript
// Em DevTools Console
localStorage.getItem('chat-history')
// Ver conversas salvas
```

### Clear Storage
```typescript
// Limpar todas conversas
const { clearAllConversations } = useChatStore()
clearAllConversations()

// OU no console
localStorage.removeItem('chat-history')
```

---

## 📚 Translation Keys

```json
{
  "chat.title": "Assistente Imobiliário",
  "chat.placeholder": "Digite sua mensagem...",
  "chat.newConversation": "Nova Conversa",
  "chat.noConversations": "Nenhuma conversa ainda",
  "chat.typing": "Digitando...",
  "chat.send": "Enviar",
  "chat.helperText": "Clique em uma sugestão ou digite sua pergunta",
  "chat.placeholderHint": "Pressione Enter para enviar, Shift+Enter para nova linha"
}
```

---

## ⌨️ Keyboard Shortcuts

```
Enter              → Enviar mensagem
Shift + Enter      → Nova linha
Tab                → Navegar entre elementos
Escape             → Fechar modals/sheets
```

---

## 🎨 Component Props

### ChatMessage
```typescript
interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  parts: MessagePart[]
}
```

### ChatSidebar
```typescript
interface ChatSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onNewConversation: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onRenameConversation: (id: string, title: string) => void
}
```

### ChatWelcome
```typescript
interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void
}
```

---

## 🔗 Useful Links

- **Shadcn UI:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs
- **react-markdown:** https://github.com/remarkjs/react-markdown
- **AI SDK:** https://sdk.vercel.ai/docs
- **Zustand:** https://github.com/pmndrs/zustand

---

## 📝 Notas

- Store persiste em `localStorage` (key: `chat-history`)
- Conversas são ordenadas por `updatedAt` DESC
- Título auto-gerado nos primeiros 40 chars da 1ª mensagem
- Markdown renderiza automaticamente (não precisa configurar)
- Code highlighting usa `highlight.js` (auto-detect language)

---

**Última atualização:** 2025-01-17  
**Versão:** 1.0
