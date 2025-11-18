# Chat AI Test Prompts

Test these prompts to validate your chat system's capabilities based on your excellent data quality (92/100).

---

## 🎯 Basic Property Search Tests

### Test 1: Simple City Search
```
Quero ver apartamentos em São Paulo
```

**Expected:**
- Searches properties in São Paulo
- Shows 10 results with formatted prices
- Displays bedrooms, bathrooms, location
- Shows AI summaries

---

### Test 2: Price Range + Type
```
Procuro uma casa entre R$ 800.000 e R$ 1.200.000
```

**Expected:**
- Filters by property_type = 'casa'
- Applies price range filter
- Shows matching properties
- Displays pricing in BRL format

---

### Test 3: Feature-Based Search
```
Apartamento com piscina e academia em Jundiaí
```

**Expected:**
- Searches in Jundiaí
- Should filter by features (97% have features!)
- Shows properties with amenities
- Highlights features in results

---

## 🔍 Semantic Search Tests

### Test 4: Natural Language Query
```
Preciso de um imóvel espaçoso para minha família, com pelo menos 3 quartos e jardim
```

**Expected:**
- Uses semantic understanding
- Searches for houses/apartments with 3+ bedrooms
- Looks for garden feature
- Shows relevant results with AI summaries

---

### Test 5: Lifestyle-Based Search
```
Apartamento moderno e mobiliado próximo ao metrô, ideal para profissional solteiro
```

**Expected:**
- Searches for furnished apartments
- Considers location (neighborhood context)
- Shows compact 1-2 bedroom properties
- Uses AI summaries to match "modern" concept

---

### Test 6: Investment Search
```
Estou procurando imóvel para investimento, algo que valorize bem
```

**Expected:**
- Understands investment intent
- May suggest specific neighborhoods or property types
- Could use market insights tool
- Provides analysis-focused response

---

## 📊 Advanced Features Tests

### Test 7: Market Insights
```
Qual é o preço médio de apartamentos de 2 quartos em São Paulo?
```

**Expected:**
- Calls getMarketInsights tool
- Provides statistics for SP
- Shows average prices
- May suggest neighborhoods

---

### Test 8: Property Details Deep Dive
```
Me mostre os detalhes completos do primeiro imóvel
```
(After getting search results)

**Expected:**
- Calls getPropertyDetails with property ID
- Shows full details: fees, IPTU, features, etc.
- Displays AI summary
- Formatted pricing

---

### Test 9: Similar Properties
```
Tem outros imóveis parecidos com este?
```
(After viewing a property)

**Expected:**
- Could use semantic search to find similar
- Matches on type, price range, location
- Shows properties with similar features
- Leverages embeddings for similarity

---

## 💼 Lead Qualification Tests

### Test 10: Lead Capture - Natural
```
Gostei muito deste apartamento. Como posso agendar uma visita?
```

**Expected:**
- Asks for contact information naturally
- Calls captureLead tool
- Saves lead with property interest
- Offers to schedule viewing

---

### Test 11: Lead Capture - Full Info
```
Meu nome é João Silva, telefone (11) 98765-4321, email joao@email.com. Tenho orçamento de até R$ 500.000 para comprar apartamento
```

**Expected:**
- Extracts all information
- Calls captureLead with complete data
- Confirms information saved
- Offers to search within budget

---

### Test 12: Schedule Viewing
```
Posso visitar este imóvel amanhã às 15h?
```
(After expressing interest in a property)

**Expected:**
- Calls scheduleViewing tool
- Records viewing appointment
- Confirms scheduling
- Professional response

---

## 🏆 Complex Multi-Step Tests

### Test 13: Complete User Journey
```
Olá! Estou procurando apartamento para alugar em Jundiaí, preciso de 2 quartos e vaga de garagem, orçamento até R$ 2.500/mês
```

**Expected:**
- Searches properties with filters
- Shows relevant results
- May ask qualifying questions
- Offers to save preferences

---

### Test 14: Refinement Flow
```
1. "Quero casa em São Paulo"
2. Wait for results...
3. "Na verdade, quero com piscina"
4. Wait for results...
5. "E com pelo menos 4 quartos"
```

**Expected:**
- First search: houses in SP
- Second: adds pool feature filter
- Third: adds bedroom filter
- Each refinement narrows results
- Maintains context throughout

---

### Test 15: Comparison Request
```
Entre os imóveis que você mostrou, qual tem o melhor custo-benefício?
```
(After seeing multiple properties)

**Expected:**
- Analyzes previous results
- Compares price vs features
- Considers location
- Provides recommendation with reasoning

---

## 🧪 Edge Cases & Error Handling

### Test 16: No Results
```
Procuro mansão de 20 quartos por R$ 1.000 em São Paulo
```

**Expected:**
- Gracefully handles no results
- Suggests alternatives
- May adjust criteria
- Helpful response, not error

---

### Test 17: Ambiguous Query
```
Quero um imóvel bom
```

**Expected:**
- Asks clarifying questions
- Requests: type, location, budget, purpose
- Guides user naturally
- Doesn't make assumptions

---

### Test 18: Mixed Rent/Buy
```
Apartamento de 3 quartos, tanto para alugar quanto comprar
```

**Expected:**
- Searches both listing types
- Separates results clearly
- Shows rent vs buy options
- Explains differences

---

## 🎨 Rich Response Tests

### Test 19: AI Summary Utilization
```
Me fale sobre este apartamento de forma resumida
```
(After property search)

**Expected:**
- Uses ai_summary field (100% coverage!)
- Provides concise overview
- Highlights key features
- Natural language response

---

### Test 20: Feature Explanation
```
Quais as principais características deste imóvel?
```

**Expected:**
- Extracts from features array (97% have it!)
- Lists amenities clearly
- Explains benefits
- Structured response

---

## 🌍 Location-Based Tests

### Test 21: Neighborhood Search (May be Limited)
```
Apartamentos no bairro Jardins
```

**Expected:**
- Searches by neighborhood
- NOTE: Only 53% have neighborhood data
- May return partial results
- Could suggest nearby areas if limited

---

### Test 22: Multiple Locations
```
Casa em Jundiaí ou Campinas
```

**Expected:**
- Searches both cities
- Combines results
- Shows properties from both locations
- Groups or labels by city

---

### Test 23: State-Wide Search
```
Propriedades no estado de São Paulo
```

**Expected:**
- Filters by state
- Shows diverse locations
- May show top cities
- Handles large result set

---

## 💡 Intelligent Recommendations

### Test 24: Budget-Based Suggestions
```
Tenho R$ 300.000 para investir, o que você recomenda?
```

**Expected:**
- Searches within budget
- May suggest property types
- Could provide market insights
- Investment-focused advice

---

### Test 25: Family-Oriented Search
```
Preciso de uma casa para minha família, temos 2 crianças pequenas
```

**Expected:**
- Suggests houses (safer, more space)
- Looks for features: garden, playground, etc.
- Recommends family-friendly neighborhoods
- Considers schools/safety

---

## 📱 Client Context Tests (if using clientId)

### Test 26: Client Profile Match
(Start chat with clientId parameter)
```
Mostre imóveis para este cliente
```

**Expected:**
- Calls findPropertiesForClient tool
- Uses client preferences from database
- Matches budget, bedrooms, features
- Leverages preferences_embedding if available

---

### Test 27: Update Preferences
(With active client)
```
O cliente agora quer também aceitar imóveis em Campinas
```

**Expected:**
- Calls updateClientPreferences
- Updates preferred locations
- Searches with new criteria
- Confirms update

---

### Test 28: Record Interest
(With active client)
```
O cliente adorou este apartamento!
```

**Expected:**
- Calls recordPropertyInterest
- Saves interest level
- Suggests next steps (viewing, etc.)
- Updates client interaction history

---

## 🚀 Performance & Quality Checks

### Test 29: Response Time
```
Apartamentos de 2 quartos em São Paulo até R$ 500k
```

**Expected:**
- Response within 3-5 seconds
- Smooth streaming
- All tools execute quickly
- No timeouts

---

### Test 30: Multi-Tool Chain
```
Procuro apartamento de 3 quartos em São Paulo, depois me mostre os detalhes do mais barato, e quero agendar visita
```

**Expected:**
- Chains multiple tool calls:
  1. searchProperties
  2. getPropertyDetails
  3. captureLead (for contact)
  4. scheduleViewing
- Maintains context
- Completes full flow
- Natural conversation

---

## 📋 Test Results Checklist

For each test, verify:

- [ ] Tool calls execute successfully
- [ ] Results are formatted in Portuguese
- [ ] Prices show in BRL format (R$ 1.234.567,89)
- [ ] AI summaries are displayed (100% coverage)
- [ ] Features are shown when relevant (97% coverage)
- [ ] Neighborhood data shown when available (53% coverage)
- [ ] Semantic understanding works
- [ ] Error handling is graceful
- [ ] Conversation flows naturally
- [ ] Multi-step reasoning works

---

## 🎯 Expected Success Rates

Based on your data quality (92/100):

- ✅ **AI Summaries:** 100% - All properties should show summaries
- ✅ **Features:** 97% - Most searches show features
- ✅ **Semantic Search:** 100% - All properties embedded
- ⚠️ **Neighborhood:** 53% - May have partial results
- ✅ **Basic Fields:** 98-99% - Nearly complete

---

## 💪 Stress Tests

### Test 31: Rapid Fire
Send 5 queries in quick succession:
```
1. "Apartamentos em SP"
2. "Com piscina"
3. "Até R$ 500k"
4. "Detalhes do primeiro"
5. "Quero agendar visita"
```

### Test 32: Long Conversation
Have a 15+ message conversation maintaining context throughout.

### Test 33: Complex Criteria
```
Apartamento de 3 ou 4 quartos, com suíte, vaga de garagem, piscina, academia, salão de festas, em condomínio fechado, em São Paulo ou Campinas, entre R$ 800k e R$ 1.2M, mobiliado ou semi-mobiliado
```

---

## 📊 Recommended Test Order

1. Start with **Basic Tests (1-3)** - Verify core functionality
2. Run **Semantic Tests (4-6)** - Validate AI understanding
3. Test **Advanced Features (7-9)** - Check tool integration
4. Try **Lead Qualification (10-12)** - Verify CRM features
5. Run **Complex Journeys (13-15)** - Test multi-step flows
6. Check **Edge Cases (16-18)** - Validate error handling
7. Test **Rich Responses (19-20)** - Verify data quality usage
8. Optional: **Client Context (26-28)** if using that feature

---

## 🎉 Success Criteria

Your chat is working excellently if:

- ✅ 90%+ of searches return relevant results
- ✅ All AI summaries display correctly
- ✅ Tool calls execute in <3 seconds
- ✅ Semantic understanding is accurate
- ✅ Lead capture works smoothly
- ✅ Conversation maintains context
- ✅ Errors are handled gracefully
- ✅ Responses are natural and helpful

With 92/100 data quality, expect **excellent performance** on all tests!

---

**Tip:** Start with Test 1 and work your way up. Your data quality supports all these features!
