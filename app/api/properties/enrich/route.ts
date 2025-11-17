import { NextRequest, NextResponse } from 'next/server'
import { autoEnrichProperty, autoEnrichProperties } from '@/lib/enrichment/auto-enrich'

/**
 * API endpoint to trigger property enrichment
 * 
 * POST /api/properties/enrich
 * Body: { propertyId: string } or { propertyIds: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Single property enrichment
    if (body.propertyId) {
      const success = await autoEnrichProperty(body.propertyId)
      
      return NextResponse.json({
        success,
        propertyId: body.propertyId,
      })
    }

    // Multiple properties enrichment
    if (body.propertyIds && Array.isArray(body.propertyIds)) {
      const results = await autoEnrichProperties(body.propertyIds)
      
      return NextResponse.json({
        success: true,
        results,
      })
    }

    return NextResponse.json(
      { error: 'Missing propertyId or propertyIds in request body' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Enrichment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
