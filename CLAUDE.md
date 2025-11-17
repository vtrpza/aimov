# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Assistente Imobiliário IA** - An intelligent real estate assistant for the Brazilian market, built as a POC (Proof of Concept). The application helps real estate professionals and clients with property searches, lead qualification, viewing scheduling, and market insights using AI-powered conversation.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **AI**: OpenAI GPT-4 Turbo via Vercel AI SDK
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl (pt-BR only)
- **Validation**: Zod

## Essential Commands

### Development
```bash
# Install dependencies
pnpm install

# Run development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

### Environment Setup

The project requires these environment variables in `.env.local`:

```bash
# Supabase (get from https://supabase.com/dashboard/project/<project-id>/settings/api)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=your_openai_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Go to SQL Editor in the Supabase dashboard
3. Execute the entire `supabase/schema.sql` file
4. This creates all tables with Row Level Security (RLS) enabled and populates sample Brazilian properties

Detailed instructions are in `scripts/setup-database.md`.

## Architecture

### AI System Architecture

The AI assistant uses **OpenAI Function Calling** pattern with 5 specialized tools:

1. **searchPropertiesTool** (`lib/ai/tools.ts:10`) - Searches properties with filters (city, state, price, bedrooms, type)
2. **getPropertyDetailsTool** (`lib/ai/tools.ts:86`) - Retrieves detailed property information by ID
3. **captureLeadTool** (`lib/ai/tools.ts:142`) - Captures client/lead information with preferences and budget
4. **scheduleViewingTool** (`lib/ai/tools.ts:212`) - Schedules property viewings (in-person or virtual)
5. **getMarketInsightsTool** (`lib/ai/tools.ts:277`) - Provides market statistics and price analysis for regions

**Chat API Flow**:
- Route: `app/api/chat/route.ts`
- Uses Vercel AI SDK's `streamText()` for streaming responses
- System prompt in Portuguese Brazilian defines assistant personality and capabilities
- All tools execute Supabase queries via the server client
- Authentication required (user must be logged in)

### Supabase Client Pattern

The project uses the **Supabase SSR pattern** with separate clients:

- **Server Client** (`lib/supabase/server.ts`) - For Server Components, API routes, and Server Actions. Uses `createServerClient()` with cookie handling via Next.js `cookies()`.
- **Browser Client** (`lib/supabase/client.ts`) - For Client Components. Uses `createBrowserClient()`.

**IMPORTANT**: Always import the correct client:
- Use `@/lib/supabase/server` in Server Components, API routes, and Server Actions
- Use `@/lib/supabase/client` in Client Components (with 'use client')

### Database Schema

Key tables:
- `properties` - Real estate listings with Brazilian-specific fields (CEP, condominium fees, IPTU)
- `clients` (referenced as `leads` in code) - Client information and preferences
- `viewings` - Scheduled property viewings
- `conversations` & `messages` - Chat history (references auth.users)
- `property_interactions` - User activity tracking

All tables have RLS policies enabled. Properties are soft-deleted (`deleted_at` field).

### Brazilian Localization

All formatting utilities are in `lib/utils/brazilian-formatters.ts`:

- `formatBRL()` - Currency: R$ 1.234.567,89
- `formatCEP()` - Postal code: 12345-678
- `formatPhone()` - Phone: (11) 98765-4321
- `formatDateBR()` - Date: 31/12/2024
- `formatDateTimeBR()` - DateTime: 31/12/2024 às 14:30
- `formatArea()` - Area: 120 m²
- `BRAZILIAN_STATES` - Array of state codes and names

**Always use these formatters** when displaying Brazilian data to users.

### Internationalization (i18n)

The project uses `next-intl` configured for **pt-BR only**:
- Configuration: `i18n/request.ts`
- Messages: `i18n/messages/pt-BR.json`
- Next.js plugin setup: `next.config.ts`

All user-facing text should be in Brazilian Portuguese.

### App Router Structure

```
/app
  /api
    /chat/route.ts          # AI chat endpoint (streaming)
    /properties/route.ts    # Properties CRUD API
    /properties/[id]/route.ts
  /actions
    /auth.ts               # Server Actions for authentication
  /chat/page.tsx           # Chat interface
  /properties/page.tsx     # Property listings
  /properties/[id]/page.tsx # Property details
  /login/page.tsx          # Login page
  /signup/page.tsx         # Signup page
  /page.tsx                # Home page
  /layout.tsx              # Root layout
```

### Component Organization

```
/components
  /chat                    # Chat UI components
  /properties              # Property-related components
```

Components are organized by feature. Client components use `'use client'` directive.

## Development Notes

### TypeScript Configuration

`next.config.ts` has `ignoreBuildErrors: true` set. While the project is a POC, strive to maintain type safety when making changes.

### Adding New AI Tools

To add a new AI tool:

1. Define the tool in `lib/ai/tools.ts` using the Vercel AI SDK `tool()` function
2. Include Zod schema for parameters with detailed descriptions
3. Implement `execute()` function with Supabase queries
4. Add the tool to the `tools` object in `app/api/chat/route.ts`
5. Update the `SYSTEM_PROMPT` to describe the new tool's purpose

### Working with Properties

Property searches default to `status: 'active'` and exclude soft-deleted records (`deleted_at IS NULL`). The properties table includes both rental and sale listings:
- Rental properties use `price_monthly` and have `listing_type: 'rent'`
- Sale properties use `price_total` and have `listing_type: 'sale'`

### Authentication Flow

- Login/Signup use Server Actions (`app/actions/auth.ts`)
- Protected routes require authenticated user
- Chat API checks authentication via `supabase.auth.getUser()`

## Key Conventions

1. **All monetary values** must be formatted with `formatBRL()` before display
2. **All dates** must be formatted with Brazilian locale formatters
3. **Database queries** must use soft-delete pattern: `.is('deleted_at', null)`
4. **AI tool responses** should return data directly or throw errors (not wrapped in `{success, ...}` objects)
5. **Property filters** default to active status unless specified otherwise
6. **Authentication required** for all chat and viewing features

## AI SDK v5 Critical Information

### Breaking Changes from v4

The project uses **Vercel AI SDK v5.0.93**, which has several breaking changes:

1. **Tool Definition**: Use `inputSchema` instead of `parameters`
   ```typescript
   // ✅ Correct (v5)
   tool({
     description: '...',
     inputSchema: z.object({ ... }),
     execute: async (params) => { ... }
   })

   // ❌ Wrong (v4)
   tool({
     description: '...',
     parameters: z.object({ ... }),  // This will fail!
     execute: async (params) => { ... }
   })
   ```

2. **Stream Response**: Use `toUIMessageStreamResponse()` for tools, not `toTextStreamResponse()`
   ```typescript
   // ✅ Correct (v5 with tools)
   return result.toUIMessageStreamResponse()

   // ❌ Wrong (text only, tools won't work)
   return result.toTextStreamResponse()
   ```

3. **Tool Properties Renamed**:
   - `args` → `input`
   - `result` → `output`
   ```typescript
   // v5: Access tool results via .output
   step.toolResults?.map(tr => tr.output)
   ```

### Tool Implementation Pattern

Tools must follow this pattern for proper execution:

```typescript
export const myTool = tool({
  description: 'Clear description of what the tool does',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  execute: async (params) => {
    // Return data directly (not wrapped in {success: true, data: ...})
    return someData

    // Throw errors instead of returning {success: false, error: ...}
    throw new Error('Error message')
  },
})
```

**Important**: Do NOT wrap results in `{success, data}` or `{success, error}` objects. Return data directly and throw errors.

### Required `streamText` Configuration

For tools to work correctly with multi-step interactions:

```typescript
streamText({
  model: openai('gpt-4-turbo'),
  messages: modelMessages,
  tools: { ... },
  maxSteps: 10,  // REQUIRED: Allow multiple tool call rounds
  experimental_continueSteps: true,  // REQUIRED: Force continuation after tools
  experimental_activeTools: 'all',  // Keep tools available at every step
})
```

### System Prompt Requirements

The system prompt MUST explicitly instruct the model to generate text responses after tool calls:

```
**CRÍTICO: Depois de chamar qualquer ferramenta e receber o resultado, você DEVE
OBRIGATORIAMENTE gerar uma resposta em texto português explicando os resultados ao
usuário. NUNCA termine a conversa após uma chamada de ferramenta sem fornecer uma
resposta textual.**
```

Without this explicit instruction, GPT-4 may stop after tool execution without generating a response.

## Database Data Characteristics

### Properties Table

**Important data patterns to be aware of**:

1. **Property Types** (in Portuguese):
   - `apartamento` (217 properties)
   - `casa` (67 properties)
   - `sala_comercial` (116 properties)
   - `sobrado` (6 properties)
   - `fazenda_sitio_chacara` (24 properties)
   - Many have `NULL` type (151 properties)

2. **Address Fields**:
   - **`address_neighborhood`**: Most properties have `NULL` value (579 out of 581)
   - **`address_city`**: All properties in "Jundiaí"
   - **`address_state`**: All properties in "SP"

   ⚠️ **Do NOT filter by neighborhood** - it will return empty results. Filter by city/state only.

3. **Listing Types**:
   - `rent` - Uses `price_monthly` field
   - `sale` - Uses `price_total` field

## Supabase RLS Considerations

### Known RLS Issue: Infinite Recursion

The `users` table had a circular RLS policy that caused infinite recursion. This has been fixed with a SECURITY DEFINER function:

```sql
-- Helper function to avoid RLS recursion
CREATE FUNCTION public.get_current_user_organization_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;
```

**Pattern**: When RLS policies need to query the same table they're protecting, use a SECURITY DEFINER function to break the recursion.

### Checking for RLS Issues

Use Supabase Advisors to detect issues:
- Security advisors: Check for missing RLS, infinite recursion
- Performance advisors: Check for missing indexes, inefficient queries

## Troubleshooting

### Tools Execute But No Response

**Symptoms**: Tool logs show successful execution, but AI response is empty.

**Causes**:
1. Missing `experimental_continueSteps: true` in `streamText()`
2. System prompt doesn't explicitly require text response after tools
3. Using `toTextStreamResponse()` instead of `toUIMessageStreamResponse()`

**Solution**: Follow the "Required `streamText` Configuration" pattern above.

### Invalid Schema Error

**Error**: `Invalid schema for function 'toolName': schema must be a JSON Schema of 'type: "object"', got 'type: "None"'`

**Cause**: Using `parameters` instead of `inputSchema` (v4 → v5 migration issue)

**Solution**: Replace `parameters:` with `inputSchema:` in all tool definitions.
