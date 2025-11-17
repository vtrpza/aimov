import { tool } from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { formatBRL, formatArea } from '@/lib/utils/brazilian-formatters'

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
      .update(updateData as any)
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
