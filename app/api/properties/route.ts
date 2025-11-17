import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    // Build query
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minBedrooms = searchParams.get('minBedrooms')
    const maxBedrooms = searchParams.get('maxBedrooms')

    if (city) query = query.eq('city', city)
    if (state) query = query.eq('state', state)
    if (type) query = query.eq('type', type)
    if (status) query = query.eq('status', status)
    if (minPrice) query = query.gte('price_brl', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price_brl', parseFloat(maxPrice))
    if (minBedrooms) query = query.gte('bedrooms', parseInt(minBedrooms))
    if (maxBedrooms) query = query.lte('bedrooms', parseInt(maxBedrooms))

    const { data, error } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('properties')
      // @ts-ignore - Supabase type inference issue with insert
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('Error creating property:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
