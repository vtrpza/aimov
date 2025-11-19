import { NextRequest, NextResponse } from 'next/server'
import { findSimilarProperties } from '@/lib/embeddings/semantic-search'
import { formatBRL, formatArea } from '@/lib/utils/brazilian-formatters'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const propertyId = params.id
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '5')
    const threshold = parseFloat(searchParams.get('threshold') || '0.7')

    const results = await findSimilarProperties(propertyId, { limit, threshold })

    // Format results
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
      propertyId,
      similarProperties: formattedResults,
      count: formattedResults.length,
    })
  } catch (error: any) {
    console.error('Find similar properties error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar imóveis similares' },
      { status: 500 }
    )
  }
}
