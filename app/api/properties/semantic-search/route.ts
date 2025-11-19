import { NextRequest, NextResponse } from 'next/server'
import { semanticSearchProperties, hybridSearch } from '@/lib/embeddings/semantic-search'
import { formatBRL, formatArea } from '@/lib/utils/brazilian-formatters'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit, threshold, filters } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query é obrigatório e deve ser uma string' },
        { status: 400 }
      )
    }

    let results

    if (filters && Object.keys(filters).length > 0) {
      // Use hybrid search if filters are provided
      results = await hybridSearch(query, {
        limit,
        threshold,
        ...filters,
      })
    } else {
      // Use pure semantic search
      results = await semanticSearchProperties(query, { limit, threshold })
    }

    // Format results for better readability
    const formattedResults = results.map((prop) => ({
      id: prop.id,
      title: prop.title,
      description: prop.description,
      ai_summary: prop.ai_summary,
      price_monthly: prop.price_monthly ? formatBRL(Number(prop.price_monthly)) : null,
      price_total: prop.price_total ? formatBRL(Number(prop.price_total)) : null,
      type: prop.property_type,
      listing_type: prop.listing_type,
      location: `${prop.address_neighborhood || ''}, ${prop.address_city}, ${prop.address_state}`,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      area: prop.area_total ? formatArea(Number(prop.area_total)) : null,
      features: prop.features,
      similarity: Math.round(prop.similarity * 100), // Convert to percentage
    }))

    return NextResponse.json({
      query,
      results: formattedResults,
      count: formattedResults.length,
    })
  } catch (error: any) {
    console.error('Semantic search error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao realizar busca semântica' },
      { status: 500 }
    )
  }
}
