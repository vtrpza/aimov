# Assistente Imobiliário IA - POC

Um assistente inteligente para profissionais do mercado imobiliário brasileiro, desenvolvido com Next.js 16, OpenAI GPT-4, e Supabase.

## 🎯 Funcionalidades

### Assistente IA Multi-propósito
- **Busca Inteligente de Imóveis**: Encontre propriedades usando linguagem natural
- **Qualificação de Leads**: Capture e qualifique potenciais clientes automaticamente
- **Agendamento de Visitas**: Agende visitas a imóveis de forma conversacional
- **Insights de Mercado**: Análise de tendências, preços médios e estatísticas em tempo real

### Recursos Técnicos
- Interface de chat em tempo real com streaming de respostas
- Function calling do OpenAI para operações precisas
- Autenticação com Supabase Auth
- Localização completa em português brasileiro (pt-BR)
- Formatação brasileira (BRL, CEP, telefone, datas)
- Design responsivo com Tailwind CSS 4
- Modo escuro completo

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Linguagem**: TypeScript 5.9
- **IA**: OpenAI GPT-4 Turbo via Vercel AI SDK
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl
- **Validação**: Zod

## 📋 Pré-requisitos

- Node.js 18+
- pnpm (gerenciador de pacotes)
- Conta Supabase (gratuita)
- Chave de API OpenAI

## 🚀 Setup e Instalação

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd aimov
```

### 2. Instale as Dependências

```bash
pnpm install
```

### 3. Configure o Supabase

#### 3.1. Crie um Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote a **URL do projeto** e a **anon key** (disponíveis em Settings > API)

#### 3.2. Execute o Schema do Banco de Dados

1. No painel do Supabase, vá em **SQL Editor**
2. Copie todo o conteúdo do arquivo `supabase/schema.sql`
3. Cole no editor SQL e execute
4. Isso criará todas as tabelas necessárias e populará com dados de exemplo

#### 3.3. Configure a Autenticação

1. No painel do Supabase, vá em **Authentication > Providers**
2. Certifique-se de que **Email** está habilitado
3. Configure as URLs de redirecionamento se necessário

### 4. Configure o OpenAI

1. Acesse [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma nova API key
3. Anote a chave (você não poderá vê-la novamente)

### 5. Configure as Variáveis de Ambiente

1. Abra o arquivo `.env.local` na raiz do projeto
2. Preencha as variáveis com seus valores:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# OpenAI Configuration
OPENAI_API_KEY=sua_openai_key_aqui

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Onde encontrar as chaves do Supabase:**
- URL e Anon Key: Settings > API > Project URL e anon/public key
- Service Role Key: Settings > API > service_role key (⚠️ mantenha em segredo!)

### 6. Inicie o Servidor de Desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📱 Como Usar

### 1. Criar uma Conta

1. Clique em "Cadastrar" no canto superior direito
2. Preencha seu email e senha
3. Faça login

### 2. Explorar Imóveis

- Navegue até a página de **Imóveis** para ver todas as propriedades disponíveis
- Clique em um imóvel para ver detalhes completos
- Use os filtros para encontrar imóveis específicos

### 3. Usar o Assistente IA

1. Acesse a página de **Chat**
2. Experimente perguntas como:
   - "Mostre apartamentos disponíveis em São Paulo"
   - "Qual o preço médio de casas em Barueri?"
   - "Quero agendar uma visita no apartamento do Jardins"
   - "Me ajude a encontrar um imóvel com 3 quartos e piscina"

### 4. Agendar Visitas

- Durante a conversa, o assistente pode agendar visitas
- Você também pode clicar em "Agendar Visita" na página de detalhes do imóvel

## 🎨 Estrutura do Projeto

```
/app
  /(auth)
    /login              # Página de login
    /signup             # Página de cadastro
  /chat                 # Interface de chat com IA
  /properties           # Listagem de imóveis
  /properties/[id]      # Detalhes do imóvel
  /api
    /chat               # Endpoint do chat com IA
    /properties         # API CRUD de imóveis
  /actions              # Server Actions
/components
  /chat                 # Componentes do chat
  /properties           # Componentes de imóveis
/lib
  /ai                   # Configuração e tools da IA
  /supabase             # Clientes Supabase
  /utils                # Utilitários (formatação BR)
/i18n                   # Traduções pt-BR
/types                  # TypeScript types
/supabase               # Schema SQL
```

## 🔧 Ferramentas da IA

O assistente possui as seguintes ferramentas (function calling):

1. **searchProperties**: Busca imóveis no banco de dados com filtros
2. **getPropertyDetails**: Obtém detalhes completos de um imóvel
3. **captureLead**: Salva informações de potenciais clientes
4. **scheduleViewing**: Agenda visitas a imóveis
5. **getMarketInsights**: Fornece análises e estatísticas de mercado

## 🌐 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Importe o projeto no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy!

### Outras Plataformas

O projeto pode ser deployado em qualquer plataforma que suporte Next.js 16:
- AWS Amplify
- Netlify
- Railway
- Render

## 🐛 Troubleshooting

### Erro ao conectar ao Supabase

- Verifique se as URLs e chaves estão corretas em `.env.local`
- Certifique-se de que o schema foi executado corretamente
- Verifique se o projeto Supabase está ativo

### Erro na API do OpenAI

- Verifique se a chave API está correta
- Confirme se há créditos disponíveis na conta OpenAI
- Verifique se o modelo `gpt-4-turbo` está disponível

### Middleware não está funcionando

- Certifique-se de que está logado
- Limpe os cookies do navegador
- Reinicie o servidor de desenvolvimento

## 📝 Dados de Exemplo

O banco de dados inclui 6 propriedades de exemplo representando o mercado brasileiro:
- Apartamento no Jardins, SP
- Casa em Alphaville, SP
- Cobertura na Barra da Tijuca, RJ
- Kitnet no Centro de SP
- Terreno comercial na Paulista, SP
- Chácara em Atibaia, SP

## 🔐 Segurança

- ✅ Row Level Security (RLS) habilitado em todas as tabelas
- ✅ Autenticação obrigatória para rotas protegidas
- ✅ API keys nunca expostas no cliente
- ✅ Validação de dados com Zod
- ✅ CORS configurado

## 🎯 Próximos Passos (Sugestões)

1. **Integração com APIs brasileiras**
   - VivaReal, ZAP Imóveis, OLX
   - API de CEP (ViaCEP)
   - Google Maps para localização

2. **Funcionalidades Avançadas**
   - Upload de imagens
   - Sistema de favoritos
   - Notificações por email
   - Relatórios de vendas
   - CRM completo

3. **Melhorias na IA**
   - Análise de sentimento
   - Recomendações personalizadas
   - Chatbot multi-idioma
   - Integração com WhatsApp

## 📄 Licença

Este é um projeto POC (Proof of Concept) para demonstração.

---

**Desenvolvido com ❤️ para o mercado imobiliário brasileiro**
