'use client'

import { cn } from '@/lib/utils'
import { Bot, User, Wrench, CheckCircle2, XCircle, Copy, Check, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useState } from 'react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

interface MessagePart {
  type: string
  text?: string
  toolCallId?: string
  toolName?: string
  args?: any
  result?: any
  isError?: boolean
  [key: string]: any
}

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system'
  parts: MessagePart[]
}

// Map tool names to user-friendly Portuguese labels
const toolLabels: Record<string, string> = {
  searchProperties: 'Buscando imóveis',
  getPropertyDetails: 'Obtendo detalhes do imóvel',
  captureLead: 'Salvando informações do cliente',
  scheduleViewing: 'Agendando visita',
  getMarketInsights: 'Analisando mercado',
}

export function ChatMessage({ role, parts }: ChatMessageProps) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)

  // Extract text from parts
  const textContent = parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')

  // Extract tool calls and results
  const toolCalls = parts.filter((part) => part.type === 'tool-call')
  const toolResults = parts.filter((part) => part.type === 'tool-result')

  const handleCopy = async () => {
    if (textContent) {
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      toast.success('Mensagem copiada!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      className={cn(
        'group flex gap-3 py-6 px-4 sm:px-6 transition-colors',
        isUser ? 'bg-transparent' : 'bg-muted/50'
      )}
    >
      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
        <AvatarFallback className={cn(
          isUser ? 'bg-primary text-primary-foreground' : 'bg-success text-success-foreground'
        )}>
          {isUser ? <User className="h-4 w-4 sm:h-5 sm:w-5" /> : <Bot className="h-4 w-4 sm:h-5 sm:w-5" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-3 min-w-0">
        {/* Display tool calls with expandable details */}
        {toolCalls.length > 0 && (
          <div className="space-y-2">
            {toolCalls.map((toolCall, idx) => {
              const toolLabel = toolLabels[toolCall.toolName || ''] || toolCall.toolName
              const toolResult = toolResults.find((r) => r.toolCallId === toolCall.toolCallId)
              const hasDetails = toolCall.args || toolResult?.result

              const toolBadge = (
                <div className="flex items-center gap-2 text-sm">
                  {toolResult ? (
                    toolResult.isError ? (
                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    )
                  ) : (
                    <Wrench className="h-4 w-4 text-primary flex-shrink-0 animate-pulse" />
                  )}
                  <span className="font-medium">{toolLabel}</span>
                  {hasDetails && <ChevronDown className="h-4 w-4 ml-auto" />}
                </div>
              )

              if (hasDetails) {
                return (
                  <Accordion key={idx} type="single" collapsible className="border rounded-lg">
                    <AccordionItem value={`tool-${idx}`} className="border-0">
                      <AccordionTrigger className="px-4 py-2 hover:no-underline">
                        {toolBadge}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 space-y-2">
                        {toolCall.args && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Parâmetros:</p>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(toolCall.args, null, 2)}
                            </pre>
                          </div>
                        )}
                        {toolResult?.result && !toolResult.isError && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Resultado:</p>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-h-32">
                              {typeof toolResult.result === 'string'
                                ? toolResult.result
                                : JSON.stringify(toolResult.result, null, 2)}
                            </pre>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              }

              return (
                <Badge key={idx} variant="outline" className="px-4 py-2 justify-start">
                  {toolBadge}
                </Badge>
              )
            })}
          </div>
        )}

        {/* Display text content */}
        {textContent && (
          <div className="relative">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-code:text-sm prose-p:leading-7 prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-1">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    return !inline ? (
                      <div className="relative group/code">
                        <div className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 bg-background/80 hover:bg-background"
                            onClick={async () => {
                              await navigator.clipboard.writeText(String(children))
                              toast.success('Código copiado!')
                            }}
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </div>
                    ) : (
                      <code className={cn('px-1.5 py-0.5 rounded-md bg-muted text-foreground font-mono text-sm', className)} {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children, ...props }: any) => (
                    <pre {...props} className="overflow-x-auto rounded-lg">
                      {children}
                    </pre>
                  ),
                  p: ({ children, ...props }: any) => (
                    <p {...props} className="mb-4 last:mb-0">
                      {children}
                    </p>
                  ),
                  ul: ({ children, ...props }: any) => (
                    <ul {...props} className="list-disc list-inside space-y-1 my-3">
                      {children}
                    </ul>
                  ),
                  ol: ({ children, ...props }: any) => (
                    <ol {...props} className="list-decimal list-inside space-y-1 my-3">
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }: any) => (
                    <li {...props} className="leading-7">
                      {children}
                    </li>
                  ),
                }}
              >
                {textContent}
              </ReactMarkdown>
            </div>

            {/* Copy button (appears on hover for assistant messages) */}
            {!isUser && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 bg-background/80 hover:bg-background"
                onClick={handleCopy}
                aria-label="Copiar mensagem"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
