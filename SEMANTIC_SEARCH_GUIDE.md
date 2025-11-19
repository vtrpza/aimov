# Guia de Busca Semântica com Embeddings

## 📚 Visão Geral

Este sistema implementa busca semântica usando **OpenAI embeddings (text-embedding-3-small)** e **pgvector** no PostgreSQL, permitindo encontrar imóveis por similaridade de significado, não apenas palavras-chave exatas.

## 🏗️ Arquitetura

```
lib/embeddings/
├── types.ts                 # Tipos TypeScript
├── openai-embeddings.ts     # Cliente OpenAI para gerar embeddings
└── semantic-search.ts       # Funções de busca semântica

scripts/
└── generate-embeddings.ts   # Script para gerar embeddings em batch

supabase/migrations/
└── 20241117000000_add_vector_search.sql  # Migration com pgvector

app/api/properties/
├── semantic-search/route.ts # Endpoint de busca semântica
└── similar/[id]/route.ts    # Endpoint de imóveis similares

lib/ai/
└── tools.ts                 # Inclui semanticSearchPropertiesTool
```

## 🚀 Setup Inicial

### 1. Aplicar Migration

```bash
# Via Supabase CLI
supabase db push

# Ou aplicar manualmente no Supabase Dashboard > SQL Editor
```

A migration:
- ✅ Habilita extensão `pgvector`
- ✅ Adiciona colunas `ai_embedding vector(1536)` e `preferences_embedding vector(1536)`
- ✅ Cria índices HNSW para busca rápida
- ✅ Cria funções SQL: `match_properties()`, `find_similar_properties()`, `match_properties_for_client()`

### 2. Gerar Embeddings

```bash
# Preview sem salvar (recomendado primeiro)
pnpm embed:dry-run

# Gerar embeddings para todos os imóveis sem embedding
pnpm embed

# Apenas properties
pnpm embed:properties

# Apenas clients
pnpm embed:clients

# Forçar regeneração (sobrescreve embeddings existentes)
pnpm embed:force
```

**Output esperado:**
```
╔══════════════════════════════════════════════════════════╗
║          🤖 EMBEDDINGS GENERATION SCRIPT                ║
╚══════════════════════════════════════════════════════════╝

🏠 Generating embeddings for properties...

📊 Found 245 properties to process
💰 Estimated: 48,500 tokens, $0.0010 USD

🚀 Generating embeddings...

⏳ Progress: 245/245 (100%)

============================================================
📊 PROPERTIES - FINAL STATISTICS
============================================================
Total:      245
Processed:  245
✅ Success: 243
❌ Failed:  2
⏭️  Skipped: 0
🎯 Tokens:  48,234
💰 Cost:    $0.0009 USD
============================================================

✅ Done!
```

## 💡 Como Usar

### 1. API REST

#### Busca Semântica
```bash
curl -X POST http://localhost:3000/api/properties/semantic-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "casa espaçosa com piscina perto da praia",
    "limit": 10,
    "threshold": 0.7
  }'
```

#### Busca Híbrida (Semântica + Filtros)
```bash
curl -X POST http://localhost:3000/api/properties/semantic-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "apartamento moderno",
    "limit": 10,
    "filters": {
      "city": "São Paulo",
      "minBedrooms": 2,
      "maxPrice": 500000
    }
  }'
```

#### Imóveis Similares
```bash
curl http://localhost:3000/api/properties/similar/{property_id}?limit=5&threshold=0.7
```

### 2. AI Assistant Tool

O assistente AI agora tem acesso ao `semanticSearchPropertiesTool`:

**Exemplo de uso:**
```
Usuário: "Quero uma casa aconchegante com jardim, ideal para família grande"

Assistente: [Usa semanticSearchPropertiesTool internamente]
           Encontrei 8 imóveis que correspondem à sua descrição:
           
           1. Casa Espaçosa em Condomínio - Alphaville (92% match)
              4 suítes, jardim amplo, churrasqueira
              R$ 2.500.000,00
              
           2. Sobrado com Quintal - Vila Madalena (89% match)
              ...
```

### 3. Programaticamente

```typescript
import { semanticSearchProperties } from '@/lib/embeddings/semantic-search'

// Busca básica
const results = await semanticSearchProperties(
  'apartamento moderno com varanda',
  { limit: 10, threshold: 0.7 }
)

// Busca híbrida
import { hybridSearch } from '@/lib/embeddings/semantic-search'

const results = await hybridSearch(
  'casa com piscina',
  {
    limit: 5,
    threshold: 0.7,
    city: 'São Paulo',
    minBedrooms: 3,
    maxPrice: 1000000
  }
)

// Imóveis similares
import { findSimilarProperties } from '@/lib/embeddings/semantic-search'

const similar = await findSimilarProperties(propertyId, { limit: 5 })

// Match para cliente
import { matchPropertiesForClient } from '@/lib/embeddings/semantic-search'

const matches = await matchPropertiesForClient(clientId, { 
  limit: 10, 
  threshold: 0.6 
})
```

## 🔧 Funções SQL Disponíveis

### `match_properties(query_embedding, threshold, count)`
Busca semântica por embedding de query

```sql
SELECT * FROM match_properties(
  '[0.1, 0.2, ...]'::vector(1536),
  0.7,
  10
);
```

### `find_similar_properties(property_id, threshold, count)`
Encontra imóveis similares a um dado

```sql
SELECT * FROM find_similar_properties(
  '123e4567-e89b-12d3-a456-426614174000',
  0.7,
  5
);
```

### `match_properties_for_client(client_id, threshold, count)`
Match de imóveis baseado em preferências do cliente

```sql
SELECT * FROM match_properties_for_client(
  '123e4567-e89b-12d3-a456-426614174001',
  0.6,
  10
);
```

## 📊 Interpretando Similarity Score

- **90-100%**: Match quase perfeito
- **80-89%**: Match muito bom
- **70-79%**: Match bom (threshold padrão)
- **60-69%**: Match moderado
- **< 60%**: Match fraco (geralmente filtrado)

## 💰 Custos

### OpenAI text-embedding-3-small
- **Preço**: $0.02 por 1M tokens
- **Dimensões**: 1536
- **Tokens médios**: 
  - Property: ~200 tokens
  - Client: ~100 tokens
  - Query: ~50 tokens

### Exemplos de Custo Real
- **1.000 properties**: ~200k tokens = **$0.004** (menos de 1 centavo!)
- **10.000 properties**: ~2M tokens = **$0.04**
- **100.000 queries/mês**: ~5M tokens = **$0.10**

**Muito econômico!**

## ⚡ Performance

### Índices HNSW
- **m = 16**: Número de conexões por nó
- **ef_construction = 64**: Qualidade do índice

### Benchmarks Esperados
- Busca em **10k properties**: ~10-50ms
- Busca em **100k properties**: ~20-100ms
- Busca em **1M properties**: ~50-200ms

### Otimizações
1. **Threshold**: Aumentar para `0.75-0.8` reduz resultados
2. **Limit**: Reduzir para `5-10` melhora velocidade
3. **Filtros**: Usar busca híbrida com filtros tradicionais primeiro

## 🔄 Fluxo de Dados

```mermaid
1. User Query
   ↓
2. generateQueryEmbedding() → OpenAI API
   ↓
3. PostgreSQL match_properties() com pgvector
   ↓
4. Cálculo de cosine similarity
   ↓
5. Ordenação por similarity DESC
   ↓
6. Top N results
```

## 🎯 Casos de Uso

### ✅ Quando usar Busca Semântica
- Queries em linguagem natural
- "Casa aconchegante para família"
- "Apartamento moderno perto do metrô"
- "Imóvel com vista para o mar"
- Feature "Imóveis Similares"
- Match automático Cliente ↔ Imóvel

### ❌ Quando usar Busca Tradicional
- Filtros exatos (cidade, preço, quartos)
- Pesquisas por ID
- Relatórios e analytics
- Quando precisa de resultados determinísticos

### 💡 Melhor Estratégia: Híbrida
Combine ambas para melhor experiência:
```typescript
hybridSearch('casa com jardim', {
  city: 'São Paulo',
  minBedrooms: 3,
  maxPrice: 1000000
})
```

## 🔐 Segurança

- ✅ RLS policies aplicam-se normalmente
- ✅ Embeddings não contêm dados sensíveis (apenas vetores numéricos)
- ✅ API routes requerem autenticação (se configurado)
- ✅ Rate limiting via Supabase

## 🐛 Troubleshooting

### Erro: "extension vector does not exist"
```sql
-- Aplicar migration novamente
CREATE EXTENSION IF NOT EXISTS vector;
```

### Erro: "ai_embedding is null"
```bash
# Gerar embeddings
pnpm embed
```

### Resultados ruins (baixa relevância)
1. Reduzir `threshold` para `0.6` ou `0.5`
2. Verificar se embeddings foram gerados corretamente
3. Usar busca híbrida com filtros

### Performance lenta
1. Verificar índices HNSW: `\d+ properties` no psql
2. Reduzir `limit` para 5-10
3. Adicionar filtros tradicionais (cidade, tipo)

## 📝 Manutenção

### Regenerar Embeddings
```bash
# Quando mudar lógica de propertyToText() ou clientPreferencesToText()
pnpm embed:force
```

### Monitorar Custos
```bash
# Script mostra estimativa antes de processar
pnpm embed:dry-run
```

### Validar Qualidade
Testar queries conhecidas e verificar se resultados fazem sentido:
```bash
curl -X POST .../semantic-search -d '{"query": "casa luxuosa"}'
```

## 🎓 Recursos Adicionais

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Supabase Vector Guide](https://supabase.com/docs/guides/ai/vector-search)

## 📞 Suporte

Para dúvidas ou issues, consulte:
- `lib/embeddings/types.ts` - Tipos e interfaces
- `scripts/generate-embeddings.ts` - Lógica de geração
- `supabase/migrations/20241117000000_add_vector_search.sql` - Schema
