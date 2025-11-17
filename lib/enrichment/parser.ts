import OpenAI from 'openai'
import { EnrichmentInput, EnrichmentOutput, EnrichmentResult } from './types'

// Lazy initialization - only create OpenAI client when needed
let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

/**
 * Parse property data using OpenAI to extract structured information
 */
export async function enrichPropertyWithAI(
  property: EnrichmentInput
): Promise<EnrichmentResult> {
  try {
    console.log(`🤖 Enriching property: ${property.id}`)

    const prompt = buildEnrichmentPrompt(property)

    const response = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise de imóveis brasileiros. 
Extraia dados estruturados de listagens de imóveis com precisão.
Retorne APENAS JSON válido, sem explicações adicionais.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('Empty response from OpenAI')
    }

    const enrichedData = JSON.parse(content) as EnrichmentOutput

    // Validate and clean the response
    const validatedData = validateEnrichmentOutput(enrichedData, property)

    return {
      success: true,
      propertyId: property.id,
      enrichedData: validatedData,
      tokensUsed: response.usage?.total_tokens || 0,
    }
  } catch (error) {
    console.error(`❌ Failed to enrich property ${property.id}:`, error)
    return {
      success: false,
      propertyId: property.id,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Build the enrichment prompt for OpenAI
 */
function buildEnrichmentPrompt(property: EnrichmentInput): string {
  return `Analise esta listagem de imóvel e extraia dados estruturados:

TÍTULO: ${property.title || 'N/A'}

DESCRIÇÃO: ${property.description || 'N/A'}

CIDADE: ${property.address_city || 'N/A'}
ESTADO: ${property.address_state || 'N/A'}

Extraia e retorne um JSON com os seguintes campos:

{
  "property_type": "apartamento|casa|sobrado|sala_comercial|terreno|fazenda_sitio_chacara|loft|cobertura|null",
  "listing_type": "rent|sale|null",
  "bedrooms": number ou null,
  "bathrooms": number ou null,
  "suites": number ou null (quartos com banheiro privativo),
  "parking_spaces": number ou null (vagas de garagem),
  "price_monthly": number ou null (aluguel mensal em reais),
  "price_total": number ou null (preço de venda em reais),
  "condominium_fee": number ou null (taxa de condomínio mensal),
  "iptu_monthly": number ou null (IPTU mensal),
  "iptu_annual": number ou null (IPTU anual),
  "address_neighborhood": "nome do bairro" ou null,
  "furnished": "furnished|unfurnished|semi_furnished|null",
  "features": ["feature1", "feature2", ...] (array de características),
  "ai_summary": "Resumo de 2-3 frases em português descrevendo o imóvel"
}

REGRAS IMPORTANTES:
1. Se um campo não estiver claramente mencionado, use null
2. Para property_type, escolha a categoria mais específica
3. Para listing_type: "rent" se mencionar aluguel/locação, "sale" se mencionar venda/compra
4. Preços devem ser apenas números (sem R$, pontos ou vírgulas)
5. Features devem ser características importantes (piscina, academia, churrasqueira, etc.)
6. O ai_summary deve ser objetivo e destacar os principais atrativos
7. Se o título mencionar "para alugar" ou "locação", é rent
8. Se o título mencionar "venda" ou "compra", é sale
9. Extraia o bairro do título ou descrição se possível

Retorne APENAS o JSON, sem texto adicional.`
}

/**
 * Validate and clean the enrichment output
 */
function validateEnrichmentOutput(
  data: EnrichmentOutput,
  original: EnrichmentInput
): EnrichmentOutput {
  // Ensure arrays are arrays
  if (!Array.isArray(data.features)) {
    data.features = []
  }

  // Validate property_type enum
  const validPropertyTypes = [
    'apartamento',
    'casa',
    'sobrado',
    'sala_comercial',
    'terreno',
    'fazenda_sitio_chacara',
    'loft',
    'cobertura',
  ]
  if (data.property_type && !validPropertyTypes.includes(data.property_type)) {
    console.warn(`Invalid property_type: ${data.property_type}, setting to null`)
    data.property_type = null
  }

  // Validate listing_type enum
  if (data.listing_type && !['rent', 'sale'].includes(data.listing_type)) {
    console.warn(`Invalid listing_type: ${data.listing_type}, setting to null`)
    data.listing_type = null
  }

  // Validate furnished enum
  if (
    data.furnished &&
    !['furnished', 'unfurnished', 'semi_furnished'].includes(data.furnished)
  ) {
    console.warn(`Invalid furnished value: ${data.furnished}, setting to null`)
    data.furnished = null
  }

  // Ensure numeric fields are numbers or null
  const numericFields: (keyof EnrichmentOutput)[] = [
    'bedrooms',
    'bathrooms',
    'suites',
    'parking_spaces',
    'price_monthly',
    'price_total',
    'condominium_fee',
    'iptu_monthly',
    'iptu_annual',
  ]

  numericFields.forEach((field) => {
    if (data[field] !== null && data[field] !== undefined) {
      const value = Number(data[field])
      if (isNaN(value)) {
        console.warn(`Invalid number for ${field}: ${data[field]}, setting to null`)
        // @ts-ignore
        data[field] = null
      } else {
        // @ts-ignore
        data[field] = value
      }
    }
  })

  // Clean up features - remove empty strings, duplicates
  data.features = [...new Set(data.features.filter((f) => f && f.trim().length > 0))]

  // Ensure ai_summary exists
  if (!data.ai_summary || data.ai_summary.trim().length === 0) {
    data.ai_summary = `${original.title || 'Imóvel'} em ${original.address_city || 'localização não especificada'}`
  }

  return data
}

/**
 * Extract basic info from title using regex (fallback method)
 */
export function extractBasicInfoFromTitle(title: string): Partial<EnrichmentOutput> {
  const result: Partial<EnrichmentOutput> = {
    features: [],
  }

  // Extract bedrooms (quartos)
  const bedroomMatch = title.match(/(\d+)\s*quarto/i)
  if (bedroomMatch) {
    result.bedrooms = parseInt(bedroomMatch[1])
  }

  // Extract bathrooms (banheiros)
  const bathroomMatch = title.match(/(\d+)\s*banheiro/i)
  if (bathroomMatch) {
    result.bathrooms = parseInt(bathroomMatch[1])
  }

  // Extract parking (vagas)
  const parkingMatch = title.match(/(\d+)\s*vaga/i)
  if (parkingMatch) {
    result.parking_spaces = parseInt(parkingMatch[1])
  }

  // Extract price
  const priceMatch = title.match(/R\$\s*([0-9.,]+)/i)
  if (priceMatch) {
    const priceStr = priceMatch[1].replace(/\./g, '').replace(',', '.')
    const price = parseFloat(priceStr)
    
    // Determine if rent or sale based on context
    if (title.toLowerCase().includes('alugar') || title.toLowerCase().includes('aluguel')) {
      result.listing_type = 'rent'
      result.price_monthly = price
    } else {
      result.listing_type = 'sale'
      result.price_total = price
    }
  }

  // Determine property type
  if (title.toLowerCase().includes('apartamento') || title.toLowerCase().includes('apto')) {
    result.property_type = 'apartamento'
  } else if (title.toLowerCase().includes('casa')) {
    result.property_type = 'casa'
  } else if (title.toLowerCase().includes('sobrado')) {
    result.property_type = 'sobrado'
  } else if (title.toLowerCase().includes('sala') || title.toLowerCase().includes('comercial')) {
    result.property_type = 'sala_comercial'
  } else if (title.toLowerCase().includes('terreno') || title.toLowerCase().includes('lote')) {
    result.property_type = 'terreno'
  } else if (title.toLowerCase().includes('chácara') || title.toLowerCase().includes('sítio') || title.toLowerCase().includes('fazenda')) {
    result.property_type = 'fazenda_sitio_chacara'
  } else if (title.toLowerCase().includes('cobertura')) {
    result.property_type = 'cobertura'
  } else if (title.toLowerCase().includes('loft')) {
    result.property_type = 'loft'
  }

  return result
}
