import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages, stepCountIs } from 'ai'
import { createClient } from '@/lib/supabase/server'
import {
  searchPropertiesTool,
  getPropertyDetailsTool,
  captureLeadTool,
  scheduleViewingTool,
  getMarketInsightsTool,
} from '@/lib/ai/tools'
import {
  getClientInfoTool,
  updateClientPreferencesTool,
  recordPropertyInterestTool,
  findPropertiesForClientTool,
} from '@/lib/ai/client-tools'
import { formatBRL } from '@/lib/utils/brazilian-formatters'

export const maxDuration = 30

const SYSTEM_PROMPT = `Você é um assistente imobiliário inteligente especializado no mercado imobiliário brasileiro.
Seu papel é ajudar profissionais do setor imobiliário e potenciais compradores/locatários com:

1. **Busca de Imóveis**: Ajude usuários a encontrar propriedades que correspondam aos seus critérios (localização, preço, tipo, tamanho, etc.)
2. **Qualificação de Leads**: Colete informações sobre potenciais compradores/locatários de forma natural e profissional
3. **Agendamento de Visitas**: Auxilie no agendamento de visitas a propriedades
4. **Insights de Mercado**: Forneça análises e estatísticas sobre o mercado imobiliário em regiões específicas

**Diretrizes importantes:**
- Seja profissional, prestativo e amigável
- Use português brasileiro em todas as interações
- Faça perguntas relevantes para entender melhor as necessidades do usuário
- Ao apresentar imóveis, destaque características importantes e vantagens
- Para valores monetários, sempre use formatação brasileira (R$ 1.234.567,89)
- Para qualificação de leads, seja natural e não invasivo ao coletar informações
- Sugira visitas quando o usuário demonstrar interesse em uma propriedade específica
- Use as ferramentas disponíveis para fornecer informações precisas e atualizadas

**CRÍTICO: Depois de chamar qualquer ferramenta e receber o resultado, você DEVE OBRIGATORIAMENTE gerar uma resposta em texto português explicando os resultados ao usuário. NUNCA termine a conversa após uma chamada de ferramenta sem fornecer uma resposta textual. Sempre interprete os resultados das ferramentas e explique-os ao usuário de forma clara e útil.**

**Suas ferramentas:**
- searchProperties: Buscar imóveis no banco de dados
- getPropertyDetails: Obter detalhes completos de um imóvel específico
- captureLead: Salvar informações de potenciais clientes
- scheduleViewing: Agendar visitas a imóveis
- getMarketInsights: Obter estatísticas e análises de mercado

Sempre priorize a experiência do usuário e forneça informações relevantes e úteis.`

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, clientId } = await req.json()

    console.log('📨 Received messages:', messages.length, 'clientId:', clientId)

    // Fetch client context if provided
    let clientContext = null
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .is('deleted_at', null)
        .single()

      if (client) {
        clientContext = client as any
      }
    }

    // Build system prompt with client context
    const systemPrompt = clientContext
      ? `${SYSTEM_PROMPT}

**CONTEXTO DO CLIENTE ATIVO:**
Você está ajudando o corretor a encontrar imóveis para o cliente: ${clientContext.full_name}

Informações do Cliente:
- Nome: ${clientContext.full_name}
- Telefone: ${clientContext.phone}
${clientContext.email ? `- Email: ${clientContext.email}` : ''}
- Orçamento: ${clientContext.budget_min ? formatBRL(Number(clientContext.budget_min)) : 'Não especificado'} - ${clientContext.budget_max ? formatBRL(Number(clientContext.budget_max)) : 'Não especificado'}
${clientContext.preferred_neighborhoods?.length > 0 ? `- Bairros preferidos: ${clientContext.preferred_neighborhoods.join(', ')}` : ''}
${clientContext.preferred_property_types?.length > 0 ? `- Tipos de imóvel: ${clientContext.preferred_property_types.join(', ')}` : ''}
${clientContext.min_bedrooms ? `- Mínimo de quartos: ${clientContext.min_bedrooms}` : ''}
${clientContext.min_bathrooms ? `- Mínimo de banheiros: ${clientContext.min_bathrooms}` : ''}
${clientContext.required_features?.length > 0 ? `- Características necessárias: ${clientContext.required_features.join(', ')}` : ''}
${clientContext.notes ? `- Observações: ${clientContext.notes}` : ''}

**IMPORTANTE:** 
- Sempre considere as preferências do cliente ao buscar imóveis
- Use a ferramenta findPropertiesForClient para encontrar imóveis que correspondam ao perfil do cliente
- Registre o nível de interesse do cliente nos imóveis apresentados usando recordPropertyInterest
- Atualize as preferências do cliente se ele fornecer novas informações durante a conversa usando updateClientPreferences`
      : SYSTEM_PROMPT

    // Filter out the welcome message and convert UI messages to model messages
    const filteredMessages = messages.filter((m: any) => m.id !== 'welcome')
    const modelMessages = convertToModelMessages(filteredMessages)

    console.log('🔄 Converted to model messages:', modelMessages.length)

    const result = streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: modelMessages,
      tools: {
        searchProperties: searchPropertiesTool,
        getPropertyDetails: getPropertyDetailsTool,
        captureLead: captureLeadTool,
        scheduleViewing: scheduleViewingTool,
        getMarketInsights: getMarketInsightsTool,
        getClientInfo: getClientInfoTool,
        updateClientPreferences: updateClientPreferencesTool,
        recordPropertyInterest: recordPropertyInterestTool,
        findPropertiesForClient: findPropertiesForClientTool,
      },
      stopWhen: stepCountIs(10), // Stop after 10 steps (enables multi-step execution)
      onStepFinish: (step) => {
        console.log('📍 Step finished:', {
          stepType: step.stepType,
          toolCalls: step.toolCalls?.map((tc) => tc.toolName),
          toolResults: step.toolResults?.map((tr) => ({
            toolName: tr.toolName,
            success: !tr.isError,
            output: typeof tr.output,  // v5: output instead of result
            outputValue: JSON.stringify(tr.output)?.substring(0, 200),
            isError: tr.isError,
          })),
          text: step.text?.substring(0, 100),
          finishReason: step.finishReason,
          isContinued: step.isContinued,
        })
      },
      onFinish: (result) => {
        console.log('✅ Stream finished')
        console.log('   - Usage:', result.usage)
        console.log('   - Steps:', result.steps?.length)
        console.log('   - Text:', result.text?.substring(0, 100))
        if (result.steps) {
          result.steps.forEach((step, idx) => {
            console.log(`   - Step ${idx + 1}:`, {
              type: step.stepType,
              toolCalls: step.toolCalls?.length || 0,
              hasText: !!step.text,
            })
          })
        }
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('❌ Chat API error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
