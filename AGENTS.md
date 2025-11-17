# AGENTS.md - Quick Reference for Coding Agents

## Commands
- **Dev**: `pnpm dev` (http://localhost:3000)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint`
- **Tests**: No test suite configured

## Code Style

### Imports
- Use `@/` path alias for all project imports (`@/lib/utils`, `@/components/ui/button`)
- Server imports: `@/lib/supabase/server` (Server Components, API routes, Server Actions)
- Client imports: `@/lib/supabase/client` (Client Components with `'use client'`)

### TypeScript
- Strict mode enabled, but `ignoreBuildErrors: true` in `next.config.ts` (POC project)
- Always define proper types - avoid `any` where possible
- Use Zod for validation schemas (AI tools, forms)

### Formatting & Naming
- Use single quotes for strings
- Semicolons required
- camelCase for variables/functions, PascalCase for components/types
- Use descriptive names: `formatBRL()`, `searchPropertiesTool`, `ChatMessage`

### Components
- Client components: Add `'use client'` directive at top
- Server components: Default (no directive needed)
- Organize by feature: `/components/chat`, `/components/properties`

### Brazilian Localization
- **ALWAYS** use formatters from `@/lib/utils/brazilian-formatters` for display
- Currency: `formatBRL()` → "R$ 1.234.567,89"
- All user-facing text in Brazilian Portuguese

### Error Handling
- Server Actions: Return `{ error: string }` on failure
- AI tools: Throw errors directly, return data (no `{success, data}` wrappers)
- Database queries: Check `error` object from Supabase response

### AI SDK v5 Pattern
- Tool definition: Use `inputSchema:` (NOT `parameters:`)
- Stream response: Use `toUIMessageStreamResponse()` for tools
- Tool execution: Return data directly, throw on error
