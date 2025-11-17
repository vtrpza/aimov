import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { formatBRL, formatArea } from '@/lib/utils/brazilian-formatters'

/**
 * Tool to search for properties in the database
 */
export const searchPropertiesTool = tool({
  description: `Search for properties in the database based on various filters.
    Use this when users ask about available properties, want to find homes/apartments/commercial spaces,
    or are looking for properties in specific locations or price ranges.
    Returns a list of matching properties with details.`,
  inputSchema: z.object({
    city: z.string().optional().describe('City name to filter by'),
    state: z.string().optional().describe('State code (e.g., SP, RJ) to filter by'),
    neighborhood: z.string().optional().describe('Neighborhood name to filter by'),
    propertyType: z.string().optional().describe('Type of property (apartamento, casa, sobrado, sala_comercial, fazenda_sitio_chacara)'),
    minPrice: z.number().optional().describe('Minimum price in BRL'),
    maxPrice: z.number().optional().describe('Maximum price in BRL'),
    minBedrooms: z.number().optional().describe('Minimum number of bedrooms'),
    maxBedrooms: z.number().optional().describe('Maximum number of bedrooms'),
    status: z.string().optional().describe('Property status (active, sold, rented)'),
  }),
  execute: async (params) => {
    console.log('🔧 searchProperties called with:', params)
    const supabase = await createClient()

    let query = supabase
      .from('properties')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (params.city) query = query.ilike('address_city', `%${params.city}%`)
    if (params.state) query = query.eq('address_state', params.state)
    if (params.neighborhood) query = query.ilike('address_neighborhood', `%${params.neighborhood}%`)
    if (params.propertyType) query = query.eq('property_type', params.propertyType)
    if (params.minPrice) {
      query = query.or(`price_monthly.gte.${params.minPrice},price_total.gte.${params.minPrice}`)
    }
    if (params.maxPrice) {
      query = query.or(`price_monthly.lte.${params.maxPrice},price_total.lte.${params.maxPrice}`)
    }
    if (params.minBedrooms) query = query.gte('bedrooms', params.minBedrooms)
    if (params.maxBedrooms) query = query.lte('bedrooms', params.maxBedrooms)
    if (params.status) query = query.eq('status', params.status)
    else query = query.eq('status', 'active') // Default to active properties

    const { data, error } = await query.limit(10)

    console.log('🔧 searchProperties query result:', { dataCount: data?.length, error: error?.message })

    if (error) {
      console.log('🔧 searchProperties query error:', error.message)
      throw new Error(error.message)
    }

    if (!data || data.length === 0) {
      console.log('🔧 searchProperties: no properties found')
      throw new Error('Nenhum imóvel encontrado com os critérios especificados')
    }

    // Format properties for better readability
    const formattedProperties = data.map((prop) => ({
      id: prop.id,
      title: prop.title,
      price_monthly: prop.price_monthly ? formatBRL(Number(prop.price_monthly)) : null,
      price_total: prop.price_total ? formatBRL(Number(prop.price_total)) : null,
      condominium_fee: prop.condominium_fee ? formatBRL(Number(prop.condominium_fee)) : null,
      type: prop.property_type,
      listing_type: prop.listing_type,
      location: `${prop.address_neighborhood || ''}, ${prop.address_city}, ${prop.address_state}`,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      parking_spaces: prop.parking_spaces,
      area: prop.area_total ? formatArea(Number(prop.area_total)) : null,
      description: prop.description,
      features: prop.features,
      ai_summary: prop.ai_summary,
    }))

    console.log('🔧 searchProperties returning:', formattedProperties.length, 'properties')
    return formattedProperties
  },
})

/**
 * Tool to get detailed information about a specific property
 */
export const getPropertyDetailsTool = tool({
  description: `Get detailed information about a specific property by ID.
    Use this when users want to know more about a particular property they've expressed interest in.`,
  inputSchema: z.object({
    propertyId: z.string().describe('The ID of the property to get details for'),
  }),
  execute: async ({ propertyId }) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      throw new Error('Imóvel não encontrado')
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      ai_summary: data.ai_summary,
      price_monthly: data.price_monthly ? formatBRL(Number(data.price_monthly)) : null,
      price_total: data.price_total ? formatBRL(Number(data.price_total)) : null,
      condominium_fee: data.condominium_fee ? formatBRL(Number(data.condominium_fee)) : null,
      iptu_monthly: data.iptu_monthly ? formatBRL(Number(data.iptu_monthly)) : null,
      property_type: data.property_type,
      listing_type: data.listing_type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parking_spaces: data.parking_spaces,
      area_total: data.area_total ? formatArea(Number(data.area_total)) : null,
      area_useful: data.area_useful ? formatArea(Number(data.area_useful)) : null,
      furnished: data.furnished,
      address_full: data.address_full,
      address_neighborhood: data.address_neighborhood,
      address_city: data.address_city,
      address_state: data.address_state,
      address_zipcode: data.address_zipcode,
      features: data.features,
      status: data.status,
      images: data.images,
      image_url: data.image_url,
    }
  },
})

/**
 * Tool to capture and save lead information
 */
export const captureLeadTool = tool({
  description: `Capture client/lead information when a user expresses interest in properties or real estate services.
    Use this to save potential buyer/renter information including their preferences and budget.
    This helps real estate professionals follow up with qualified leads.`,
  inputSchema: z.object({
    fullName: z.string().describe('Client full name'),
    email: z.string().email().optional().describe('Client email address'),
    phone: z.string().describe('Client phone number'),
    budgetMin: z.number().optional().describe('Minimum budget in BRL'),
    budgetMax: z.number().optional().describe('Maximum budget in BRL'),
    preferredNeighborhoods: z
      .array(z.string())
      .optional()
      .describe('Preferred neighborhoods'),
    preferredPropertyTypes: z
      .array(z.string())
      .optional()
      .describe('Types of properties the client is interested in'),
    minBedrooms: z.number().optional().describe('Minimum number of bedrooms'),
    minBathrooms: z.number().optional().describe('Minimum number of bathrooms'),
    requiredFeatures: z
      .array(z.string())
      .optional()
      .describe('Required features (pool, gym, etc.)'),
    notes: z
      .string()
      .optional()
      .describe('Additional notes about the client or their preferences'),
  }),
  execute: async (params) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('clients')
      // @ts-ignore - Supabase type inference issue
      .insert([
        {
          full_name: params.fullName,
          email: params.email,
          phone: params.phone,
          budget_min: params.budgetMin,
          budget_max: params.budgetMax,
          preferred_neighborhoods: params.preferredNeighborhoods || [],
          preferred_property_types: params.preferredPropertyTypes || [],
          min_bedrooms: params.minBedrooms,
          min_bathrooms: params.minBathrooms,
          required_features: params.requiredFeatures || [],
          status: 'active',
          source: 'ai_assistant',
          notes: params.notes,
        },
      ])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao cadastrar cliente: ${error.message}`)
    }

    return {
      message: `Cliente cadastrado com sucesso! Entraremos em contato com ${params.fullName} em breve.`,
      clientId: data.id,
    }
  },
})

/**
 * Tool to schedule a property viewing
 */
export const scheduleViewingTool = tool({
  description: `Schedule a property viewing for a user.
    Use this when users want to visit a property in person.
    Saves the viewing appointment in the system.`,
  inputSchema: z.object({
    propertyId: z.string().describe('The ID of the property to visit'),
    scheduledAt: z.string().describe('Preferred viewing date and time (ISO format)'),
    meetingType: z.enum(['in-person', 'virtual']).optional().describe('Type of meeting'),
    agentNotes: z.string().optional().describe('Additional notes or requirements for the viewing'),
  }),
  execute: async ({ propertyId, scheduledAt, meetingType, agentNotes }) => {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Usuário deve estar logado para agendar visitas')
    }

    // Verify property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('title, address_full, address_city, address_neighborhood')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      throw new Error('Imóvel não encontrado')
    }

    // Create viewing
    const { error } = await supabase.from('viewings')
    // @ts-ignore - Supabase type inference issue
    .insert([
      {
        property_id: propertyId,
        agent_id: user.id,
        scheduled_at: scheduledAt,
        status: 'scheduled',
        meeting_type: meetingType || 'in-person',
        agent_notes: agentNotes,
      },
    ])

    if (error) {
      throw new Error(`Erro ao agendar visita: ${error.message}`)
    }

    const location = property.address_neighborhood
      ? `${property.address_neighborhood}, ${property.address_city}`
      : property.address_city

    return {
      message: `Visita agendada com sucesso!\n\nImóvel: ${property.title}\nLocalização: ${location}\nData: ${new Date(scheduledAt).toLocaleString('pt-BR')}\nTipo: ${meetingType === 'virtual' ? 'Virtual' : 'Presencial'}\n\n${agentNotes ? `Observações: ${agentNotes}` : ''}`,
    }
  },
})

/**
 * Tool to get market insights for a specific city/region
 */
export const getMarketInsightsTool = tool({
  description: `Get market insights and statistics for a specific city or region.
    Use this when users ask about market trends, average prices, or want to understand the real estate market in an area.`,
  inputSchema: z.object({
    city: z.string().optional().describe('City name'),
    state: z.string().optional().describe('State code (e.g., SP, RJ)'),
    neighborhood: z.string().optional().describe('Neighborhood name'),
    propertyType: z.string().optional().describe('Type of property to analyze (apartamento, casa, sobrado, sala_comercial, fazenda_sitio_chacara)'),
  }),
  execute: async (params) => {
    try {
      console.log('🔧 getMarketInsights called with:', params)
      const supabase = await createClient()

      let query = supabase
        .from('properties')
        .select('price_monthly, price_total, area_total, property_type, bedrooms, listing_type')
        .eq('status', 'active')
        .is('deleted_at', null)

      if (params.city) query = query.ilike('address_city', `%${params.city}%`)
      if (params.state) query = query.eq('address_state', params.state)
      // Don't filter by neighborhood since most are NULL - just use city/state
      // if (params.neighborhood) query = query.ilike('address_neighborhood', `%${params.neighborhood}%`)
      if (params.propertyType) query = query.eq('property_type', params.propertyType)

      const { data, error } = await query

      console.log('🔧 Query result:', { dataCount: data?.length, error: error?.message, params })

    if (error || !data || data.length === 0) {
      console.log('🔧 No data found, throwing error')
      throw new Error('Não há dados disponíveis para esta localização')
    }

    // Calculate statistics for rental properties
    const rentals = data.filter((p) => p.listing_type === 'rent' && p.price_monthly)
    const sales = data.filter((p) => p.listing_type === 'sale' && p.price_total)

    const stats: any = {
      totalProperties: data.length,
      location: `${params.neighborhood || ''} ${params.city || 'Todas as cidades'}, ${params.state || 'Todos os estados'}`,
    }

    if (rentals.length > 0) {
      const rentalPrices = rentals.map((p) => Number(p.price_monthly))
      stats.rental = {
        count: rentals.length,
        averagePrice: formatBRL(rentalPrices.reduce((a, b) => a + b, 0) / rentalPrices.length),
        priceRange: {
          min: formatBRL(Math.min(...rentalPrices)),
          max: formatBRL(Math.max(...rentalPrices)),
        },
      }
    }

    if (sales.length > 0) {
      const salePrices = sales.map((p) => Number(p.price_total))
      stats.sale = {
        count: sales.length,
        averagePrice: formatBRL(salePrices.reduce((a, b) => a + b, 0) / salePrices.length),
        priceRange: {
          min: formatBRL(Math.min(...salePrices)),
          max: formatBRL(Math.max(...salePrices)),
        },
      }
    }

    // Calculate average area
    const areas = data.filter((p) => p.area_total).map((p) => Number(p.area_total))
    if (areas.length > 0) {
      stats.averageArea = formatArea(areas.reduce((a, b) => a + b, 0) / areas.length)
    }

    // Property type distribution
    const typeDistribution: Record<string, number> = {}
    data.forEach((p) => {
      if (p.property_type) {
        typeDistribution[p.property_type] = (typeDistribution[p.property_type] || 0) + 1
      }
    })
    stats.typeDistribution = typeDistribution

      console.log('🔧 Returning stats:', JSON.stringify(stats).substring(0, 200))
      return stats  // Return data directly, not wrapped in success object
    } catch (err) {
      console.error('🔧 getMarketInsights error:', err)
      throw new Error(`Erro ao buscar dados: ${err instanceof Error ? err.message : String(err)}`)
    }
  },
})

/**
 * Tool to get client information and preferences
 */
export const getClientInfoTool = tool({
  description: `Get detailed information about a specific client including their preferences, budget, and requirements.
    Use this when you need to understand a client's needs to find suitable properties for them.`,
  inputSchema: z.object({
    clientId: z.string().describe('The ID of the client to retrieve'),
  }),
  execute: async ({ clientId }) => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      throw new Error('Cliente não encontrado')
    }

    const clientData = data as any

    return {
      id: clientData.id,
      name: clientData.full_name,
      email: clientData.email,
      phone: clientData.phone,
      budget: {
        min: clientData.budget_min ? formatBRL(Number(clientData.budget_min)) : null,
        max: clientData.budget_max ? formatBRL(Number(clientData.budget_max)) : null,
        min_raw: clientData.budget_min,
        max_raw: clientData.budget_max,
      },
      preferences: {
        neighborhoods: clientData.preferred_neighborhoods || [],
        propertyTypes: clientData.preferred_property_types || [],
        minBedrooms: clientData.min_bedrooms,
        minBathrooms: clientData.min_bathrooms,
        requiredFeatures: clientData.required_features || [],
      },
      status: clientData.status,
      notes: clientData.notes,
      created_at: clientData.created_at,
    }
  },
})

/**
 * Tool to update client preferences based on conversation
 */
export const updateClientPreferencesTool = tool({
  description: `Update a client's preferences and requirements based on new information learned during conversation.
    Use this when the client clarifies or changes their requirements.`,
  inputSchema: z.object({
    clientId: z.string().describe('The ID of the client to update'),
    budgetMin: z.number().optional().describe('Updated minimum budget in BRL'),
    budgetMax: z.number().optional().describe('Updated maximum budget in BRL'),
    preferredNeighborhoods: z.array(z.string()).optional().describe('Updated list of preferred neighborhoods'),
    preferredPropertyTypes: z.array(z.string()).optional().describe('Updated list of preferred property types'),
    minBedrooms: z.number().optional().describe('Updated minimum bedrooms requirement'),
    minBathrooms: z.number().optional().describe('Updated minimum bathrooms requirement'),
    requiredFeatures: z.array(z.string()).optional().describe('Updated list of required features'),
    notes: z.string().optional().describe('Additional notes to append'),
  }),
  execute: async (params) => {
    const supabase = await createClient()

    const updateData: any = {}
    if (params.budgetMin !== undefined) updateData.budget_min = params.budgetMin
    if (params.budgetMax !== undefined) updateData.budget_max = params.budgetMax
    if (params.preferredNeighborhoods) updateData.preferred_neighborhoods = params.preferredNeighborhoods
    if (params.preferredPropertyTypes) updateData.preferred_property_types = params.preferredPropertyTypes
    if (params.minBedrooms !== undefined) updateData.min_bedrooms = params.minBedrooms
    if (params.minBathrooms !== undefined) updateData.min_bathrooms = params.minBathrooms
    if (params.requiredFeatures) updateData.required_features = params.requiredFeatures

    // Append notes if provided
    if (params.notes) {
      const { data: currentClient } = await supabase
        .from('clients')
        .select('notes')
        .eq('id', params.clientId)
        .single()

      const existingNotes = (currentClient as any)?.notes || ''
      const timestamp = new Date().toLocaleString('pt-BR')
      updateData.notes = existingNotes
        ? `${existingNotes}\n\n[${timestamp}] ${params.notes}`
        : `[${timestamp}] ${params.notes}`
    }

    const { error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', params.clientId)

    if (error) {
      throw new Error(`Erro ao atualizar preferências do cliente: ${error.message}`)
    }

    return {
      message: 'Preferências do cliente atualizadas com sucesso!',
      updated: Object.keys(updateData),
    }
  },
})

/**
 * Tool to record a client's interest in a property
 */
export const recordPropertyInterestTool = tool({
  description: `Record a client's interest level in a specific property.
    Use this when a client expresses interest (positive or negative) in a property during conversation.`,
  inputSchema: z.object({
    clientId: z.string().describe('The ID of the client'),
    propertyId: z.string().describe('The ID of the property'),
    interestLevel: z.enum(['high', 'medium', 'low', 'rejected']).describe('Level of client interest'),
    notes: z.string().optional().describe('Notes about why the client is/isn\'t interested'),
  }),
  execute: async ({ clientId, propertyId, interestLevel, notes }) => {
    const supabase = await createClient()

    // Get current user to track who recorded this
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if match already exists
    const { data: existing } = await supabase
      .from('property_matches')
      .select('id')
      .eq('client_id', clientId)
      .eq('property_id', propertyId)
      .single()

    if (existing) {
      // Update existing match
      const { error } = await supabase
        .from('property_matches')
        .update({
          status: interestLevel,
          match_reasons: notes ? { notes } : undefined,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', (existing as any).id)

      if (error) {
        throw new Error(`Erro ao atualizar interesse: ${error.message}`)
      }
    } else {
      // Create new match record
      const { error } = await supabase
        .from('property_matches')
        .insert({
          client_id: clientId,
          property_id: propertyId,
          status: interestLevel,
          match_reasons: notes ? { notes } : undefined,
          sent_by: user?.id,
        } as any)

      if (error) {
        throw new Error(`Erro ao registrar interesse: ${error.message}`)
      }
    }

    const interestText = {
      high: 'alto interesse',
      medium: 'interesse moderado',
      low: 'baixo interesse',
      rejected: 'não interessado',
    }[interestLevel]

    return {
      message: `Interesse registrado com sucesso! Cliente marcado como "${interestText}" neste imóvel.`,
    }
  },
})

/**
 * Tool to find properties that match a client's preferences
 */
export const findPropertiesForClientTool = tool({
  description: `Find properties that match a specific client's preferences and budget.
    Use this when you need to suggest properties tailored to a client's requirements.`,
  inputSchema: z.object({
    clientId: z.string().describe('The ID of the client to find properties for'),
    limit: z.number().optional().describe('Maximum number of properties to return (default 5)'),
  }),
  execute: async ({ clientId, limit = 5 }) => {
    const supabase = await createClient()

    // First get the client's preferences
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .is('deleted_at', null)
      .single()

    if (clientError || !client) {
      throw new Error('Cliente não encontrado')
    }

    const clientData = client as any

    // Build query based on client preferences
    let query = supabase
      .from('properties')
      .select('*')
      .eq('status', 'active')
      .is('deleted_at', null)

    // Apply budget filter
    if (clientData.budget_min || clientData.budget_max) {
      if (clientData.budget_min && clientData.budget_max) {
        query = query.or(
          `and(price_monthly.gte.${clientData.budget_min},price_monthly.lte.${clientData.budget_max}),and(price_total.gte.${clientData.budget_min},price_total.lte.${clientData.budget_max})`
        )
      } else if (clientData.budget_min) {
        query = query.or(`price_monthly.gte.${clientData.budget_min},price_total.gte.${clientData.budget_min}`)
      } else if (clientData.budget_max) {
        query = query.or(`price_monthly.lte.${clientData.budget_max},price_total.lte.${clientData.budget_max}`)
      }
    }

    // Apply property type filter
    if (clientData.preferred_property_types && clientData.preferred_property_types.length > 0) {
      query = query.in('property_type', clientData.preferred_property_types)
    }

    // Apply bedroom filter
    if (clientData.min_bedrooms) {
      query = query.gte('bedrooms', clientData.min_bedrooms)
    }

    // Apply bathroom filter
    if (clientData.min_bathrooms) {
      query = query.gte('bathrooms', clientData.min_bathrooms)
    }

    const { data, error } = await query.limit(limit)

    if (error) {
      throw new Error(`Erro ao buscar imóveis: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return {
        message: 'Nenhum imóvel encontrado que corresponda exatamente às preferências do cliente. Considere ajustar os filtros.',
        properties: [],
        clientPreferences: {
          budget: `${clientData.budget_min ? formatBRL(Number(clientData.budget_min)) : 'N/A'} - ${clientData.budget_max ? formatBRL(Number(clientData.budget_max)) : 'N/A'}`,
          neighborhoods: clientData.preferred_neighborhoods,
          propertyTypes: clientData.preferred_property_types,
          minBedrooms: clientData.min_bedrooms,
          minBathrooms: clientData.min_bathrooms,
        },
      }
    }

    // Format properties
    const formattedProperties = data.map((prop: any) => ({
      id: prop.id,
      title: prop.title,
      price_monthly: prop.price_monthly ? formatBRL(Number(prop.price_monthly)) : null,
      price_total: prop.price_total ? formatBRL(Number(prop.price_total)) : null,
      condominium_fee: prop.condominium_fee ? formatBRL(Number(prop.condominium_fee)) : null,
      type: prop.property_type,
      listing_type: prop.listing_type,
      location: `${prop.address_neighborhood || ''}, ${prop.address_city}, ${prop.address_state}`,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      parking_spaces: prop.parking_spaces,
      area: prop.area_total ? formatArea(Number(prop.area_total)) : null,
      description: prop.description,
      features: prop.features,
      ai_summary: prop.ai_summary,
    }))

    return {
      message: `Encontrei ${data.length} imóveis que correspondem às preferências do cliente.`,
      properties: formattedProperties,
      clientInfo: {
        name: clientData.full_name,
        budget: `${clientData.budget_min ? formatBRL(Number(clientData.budget_min)) : 'N/A'} - ${clientData.budget_max ? formatBRL(Number(clientData.budget_max)) : 'N/A'}`,
      },
    }
  },
})
