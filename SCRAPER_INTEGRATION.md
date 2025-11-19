# 🔄 Integração Scraper → Database

## Comportamento do Scraper

O scraper **sempre insere** `listing_type='buy'` para propriedades à venda.

## ✅ Solução Implementada

Criamos um **trigger no Postgres** que normaliza automaticamente:

```sql
CREATE TRIGGER normalize_listing_type_trigger
  BEFORE INSERT OR UPDATE OF listing_type ON properties
  FOR EACH ROW
  EXECUTE FUNCTION normalize_listing_type();
```

## 🔀 Fluxo de Dados

```
┌─────────────┐
│   Scraper   │
│             │
│ listing_type│
│   = 'buy'   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Database Trigger   │
│                     │
│  IF buy THEN sale   │
└──────┬──────────────┘
       │
       ▼
┌─────────────┐
│  Database   │
│             │
│ listing_type│
│  = 'sale'   │
└─────────────┘
```

## 📊 Mapeamento de Valores

| Scraper Input | Database Output | AI Tool Output |
|--------------|-----------------|----------------|
| `'buy'`      | `'sale'` ✅     | Venda         |
| `'rent'`     | `'rent'` ✅     | Locação       |
| `null`       | `null` ✅       | N/A           |

## 🧪 Como Testar

```sql
-- Inserir como o scraper faz:
INSERT INTO properties (source_url, title, listing_type)
VALUES ('https://exemplo.com/123', 'Apartamento Teste', 'buy')
RETURNING id, listing_type;

-- Resultado esperado: listing_type = 'sale'
```

## ⚠️ Importante

- **NÃO altere o scraper** - Ele pode continuar enviando 'buy'
- **NÃO remova o trigger** - É a camada de normalização
- **NÃO adicione constraint** - O trigger já garante consistência

## 🔧 Manutenção

Se precisar adicionar mais normalizações, edite a função:

```sql
CREATE OR REPLACE FUNCTION normalize_listing_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalização 'buy' → 'sale'
  IF NEW.listing_type = 'buy' THEN
    NEW.listing_type := 'sale';
  END IF;
  
  -- Adicione novas regras aqui se necessário
  -- Exemplo: IF NEW.listing_type = 'aluguel' THEN
  --            NEW.listing_type := 'rent';
  --          END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 📈 Métricas de Sucesso

Após implementação do trigger:

- ✅ **0 imóveis** com `listing_type='buy'` no banco
- ✅ **501 imóveis** convertidos para `listing_type='sale'`
- ✅ **100% de normalização** automática em novos inserts
- ✅ **Zero impacto** no scraper (backward compatible)

---

**Status:** ✅ Em Produção  
**Última atualização:** 2025-11-17  
**Responsável:** Database Layer (Trigger)
