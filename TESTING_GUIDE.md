# 🧪 Guia de Testes - Chat UX/UI Melhorado

## 📋 Checklist de Testes

### ✅ 1. Teste de Inicialização

**Passos:**
1. Inicie o servidor: `pnpm dev`
2. Acesse: `http://localhost:3000/chat`
3. Faça login se necessário

**Verificar:**
- [ ] Welcome screen aparece
- [ ] 4 suggested prompts estão visíveis
- [ ] Logo/ícone do assistente está centralizado
- [ ] Sidebar está visível (desktop) ou menu hamburger (mobile)
- [ ] Botão "Nova Conversa" está no topo da sidebar

---

### ✅ 2. Teste de Suggested Prompts

**Passos:**
1. Clique em cada um dos 4 prompts sugeridos

**Verificar:**
- [ ] "Buscar Imóveis" envia mensagem correta
- [ ] "Detalhes de Imóvel" envia mensagem
- [ ] "Análise de Mercado" envia mensagem
- [ ] "Agendar Visita" envia mensagem
- [ ] Welcome screen desaparece após primeira mensagem
- [ ] Mensagem do usuário aparece
- [ ] Typing indicator aparece (3 dots animados)

---

### ✅ 3. Teste de Markdown Rendering

**Passos:**
1. Digite uma mensagem que force o assistente a usar markdown
2. Exemplos de testes:

```
Teste 1: "Me mostre um exemplo de código JavaScript"
Teste 2: "Explique com uma lista os tipos de imóveis"
Teste 3: "Crie uma tabela comparando 2 imóveis"
```

**Verificar:**
- [ ] **Negrito** renderiza corretamente
- [ ] `código inline` tem background cinza
- [ ] Blocos de código têm syntax highlighting
- [ ] Botão "Copiar código" aparece em hover
- [ ] Listas com bullets (•) ou números
- [ ] Links são clicáveis
- [ ] Parágrafos têm espaçamento adequado

---

### ✅ 4. Teste de Code Highlighting

**Passos:**
1. Peça ao assistente para gerar código
2. Teste múltiplas linguagens:

```
"Me mostre código JavaScript para calcular preço"
"Me mostre código Python para buscar imóveis"
"Me mostre SQL para criar tabela de properties"
```

**Verificar:**
- [ ] Código tem cores (syntax highlighting)
- [ ] Botão copiar aparece no canto superior direito do bloco
- [ ] Copiar funciona (toast "Código copiado!")
- [ ] Scroll horizontal funciona se código for longo

---

### ✅ 5. Teste de Gerenciamento de Conversas

**Passos:**
1. Clique em "Nova Conversa" (3 vezes)
2. Em cada conversa, envie uma mensagem diferente
3. Teste renomear e deletar

**Verificar:**
- [ ] 3 conversas aparecem na sidebar
- [ ] Cada conversa mostra o título correto
- [ ] Contador de mensagens está correto
- [ ] Mais recentes aparecem no topo
- [ ] Ao selecionar conversa, mensagens corretas aparecem
- [ ] Menu (⋮) aparece em hover
- [ ] "Renomear" abre input inline
- [ ] Pode salvar (✓) ou cancelar (✗)
- [ ] "Deletar" pede confirmação
- [ ] Após deletar, conversa some

---

### ✅ 6. Teste de Input Avançado

**Passos:**
1. Digite mensagem curta
2. Digite mensagem longa (várias linhas)
3. Use Shift+Enter para nova linha
4. Teste atalhos

**Verificar:**
- [ ] Textarea cresce automaticamente ao digitar
- [ ] Max-height de ~128px (scroll depois disso)
- [ ] Contador de caracteres aparece ao digitar
- [ ] Botão enviar desabilitado se vazio
- [ ] Enter envia mensagem
- [ ] Shift+Enter adiciona nova linha
- [ ] Texto de ajuda visível: "Pressione Enter ⏎..."
- [ ] Botão enviar tem animação de escala

---

### ✅ 7. Teste de Copy & Paste

**Passos:**
1. Envie mensagem e receba resposta do assistente
2. Hover sobre a mensagem do assistente

**Verificar:**
- [ ] Botão "Copiar" aparece no canto superior direito
- [ ] Clique copia texto completo
- [ ] Ícone muda para ✓ (check)
- [ ] Toast "Mensagem copiada!" aparece
- [ ] Botão volta ao normal após 2s

---

### ✅ 8. Teste de Typing Indicator

**Passos:**
1. Envie mensagem e observe indicador

**Verificar:**
- [ ] 3 dots aparecem abaixo da última mensagem
- [ ] Dots fazem animação de "bounce"
- [ ] Animação é suave e sincronizada
- [ ] Aparece antes da resposta do assistente
- [ ] Desaparece quando resposta chega

---

### ✅ 9. Teste Mobile (< 768px)

**Passos:**
1. Redimensione janela para < 768px OU use DevTools mobile
2. Teste todas as funcionalidades

**Verificar:**
- [ ] Sidebar não está visível por padrão
- [ ] Botão menu (☰) aparece no header
- [ ] Clicar abre Sheet lateral
- [ ] Sheet cobre tela (overlay)
- [ ] Pode fechar com X ou clicando fora
- [ ] Lista de conversas funciona no Sheet
- [ ] "Nova Conversa" fecha Sheet automaticamente
- [ ] Selecionando conversa fecha Sheet
- [ ] Input e botões têm tamanho adequado (min 44x44px)
- [ ] Suggested prompts ficam em 1 coluna

---

### ✅ 10. Teste de Persistência

**Passos:**
1. Crie 2 conversas
2. Envie mensagens em ambas
3. Feche o navegador
4. Reabra e acesse `/chat`

**Verificar:**
- [ ] Conversas ainda estão lá
- [ ] Mensagens foram preservadas
- [ ] Última conversa ativa está selecionada
- [ ] Títulos estão corretos
- [ ] Contadores de mensagens corretos

---

### ✅ 11. Teste de Acessibilidade

**Passos:**
1. Use Tab para navegar
2. Use leitor de tela (opcional)

**Verificar:**
- [ ] Pode navegar com Tab
- [ ] Focus states são visíveis
- [ ] Botões têm `aria-label`
- [ ] Contraste de cores adequado
- [ ] Sem elementos inacessíveis

---

### ✅ 12. Teste de Performance

**Passos:**
1. Crie 10+ conversas
2. Cada uma com 20+ mensagens
3. Navegue entre conversas

**Verificar:**
- [ ] Scroll suave mesmo com muitas conversas
- [ ] Trocar de conversa é instantâneo
- [ ] Sem lag ao digitar
- [ ] Animações permanecem suaves
- [ ] Memória não cresce descontroladamente

---

## 🐛 Bugs Conhecidos / Limitações

1. **Persistência Global**: O store Zustand é global, não por usuário
   - **Fix futuro**: Sincronizar com Supabase user_id

2. **Limite de Conversas**: Sem limite de conversas no localStorage
   - **Fix futuro**: Limite de 50 conversas + cleanup automático

3. **Mensagens Longas**: Mensagens muito longas podem causar scroll issues
   - **Fix futuro**: Virtualização da lista de mensagens

---

## 📸 Screenshots Esperados

### Desktop - Welcome Screen
```
┌─────────┬────────────────────────────┐
│ SIDEBAR │     🤖                     │
│ + Nova  │  Assistente Imobiliário   │
│         │  Seu assistente...         │
│ [vazio] │                            │
│         │  [Buscar] [Detalhes]       │
│         │  [Mercado] [Agendar]       │
└─────────┴────────────────────────────┘
```

### Desktop - Com Mensagens
```
┌─────────┬────────────────────────────┐
│ SIDEBAR │  👤 Mostre imóveis...      │
│ + Nova  │                            │
│         │  🤖 **Encontrei 5:**       │
│ 💬 Conv │     • Apto 2Q - R$ 500k    │
│   3msg  │     ```js                  │
│ 💬 Conv │     code here [📋]         │
│   5msg  │     ```                    │
└─────────┴────────────────────────────┘
```

### Mobile - Menu Aberto
```
┌─────────────────────────────────┐
│ [☰] Assistente Imobiliário     │
├──────────┬──────────────────────┤
│ SIDEBAR  │  (overlay escuro)    │
│ + Nova   │                      │
│          │                      │
│ 💬 Conv1 │                      │
│   3 msgs │                      │
└──────────┴──────────────────────┘
```

---

## ✅ Checklist Final

Antes de considerar completo:

- [ ] Todos os 12 testes passaram
- [ ] Desktop funciona perfeitamente
- [ ] Mobile funciona perfeitamente
- [ ] Tablet funciona (se aplicável)
- [ ] Dark mode testado (se aplicável)
- [ ] Sem erros no console
- [ ] Sem warnings React
- [ ] Build production passa: `pnpm build`
- [ ] Lint passa: `pnpm lint`

---

## 🚀 Próximos Passos

Se todos os testes passaram:

1. **Deploy em staging** para QA team testar
2. **Coletar feedback** de usuários beta
3. **Monitorar métricas**:
   - Tempo médio de sessão
   - Número de conversas criadas
   - Feature adoption (markdown, copy buttons)
4. **Iterar** baseado em feedback

---

**Status:** ✅ PRONTO PARA TESTES  
**Última atualização:** 2025-01-17
