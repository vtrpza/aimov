// @ts-nocheck - POC project with ignoreBuildErrors enabled
import { createClient } from '@/lib/supabase/server'
import type {
  DashboardStats,
  Activity,
  PropertyDistribution,
  PriceRange,
  FeatureAnalysis,
  NeighborhoodStats,
  MarketInsights,
  DataQualityMetrics,
  PropertySample,
} from './types'

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  try {
    // Get properties stats
    const { data: properties } = await supabase
      .from('properties')
      .select('id, created_at, price_total, price_monthly, listing_type')
      .eq('status', 'active')
      .is('deleted_at', null)

    const totalProperties = properties?.length || 0
    const propertiesThisWeek = properties?.filter((p: any) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(p.created_at || '') >= weekAgo
    }).length || 0

    // Separate rent and sale properties
    const rentProperties = properties?.filter((p: any) => p.listing_type === 'rent') || []
    const saleProperties = properties?.filter((p: any) => p.listing_type === 'sale') || []

    // Calculate average prices
    const avgPrice = properties?.reduce((sum: number, p: any) => {
      const price = p.price_total || (p.price_monthly ? p.price_monthly * 12 : 0)
      return sum + price
    }, 0) / (totalProperties || 1)

    const avgRentPrice = rentProperties.reduce((sum: number, p: any) => {
      return sum + (p.price_monthly || 0)
    }, 0) / (rentProperties.length || 1)

    const avgSalePrice = saleProperties.reduce((sum: number, p: any) => {
      return sum + (p.price_total || 0)
    }, 0) / (saleProperties.length || 1)

    // Get clients stats
    const { data: clients } = await supabase
      .from('clients')
      .select('id, created_at')
      .is('deleted_at', null)

    const totalClients = clients?.length || 0
    const clientsThisMonth = clients?.filter((c: any) => {
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      return new Date(c.created_at || '') >= monthAgo
    }).length || 0

    // Get upcoming viewings
    const { data: viewings } = await supabase
      .from('viewings')
      .select('id, scheduled_at')
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .lte('scheduled_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())

    const upcomingViewings = viewings?.length || 0

    return {
      totalProperties,
      propertiesThisWeek,
      totalClients,
      clientsThisMonth,
      upcomingViewings,
      avgPrice: Math.round(avgPrice),
      rentProperties: rentProperties.length,
      saleProperties: saleProperties.length,
      avgRentPrice: Math.round(avgRentPrice),
      avgSalePrice: Math.round(avgSalePrice),
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalProperties: 0,
      propertiesThisWeek: 0,
      totalClients: 0,
      clientsThisMonth: 0,
      upcomingViewings: 0,
      avgPrice: 0,
      rentProperties: 0,
      saleProperties: 0,
      avgRentPrice: 0,
      avgSalePrice: 0,
    }
  }
}

export async function getRecentActivities(limit = 10): Promise<Activity[]> {
  const supabase = await createClient()

  try {
    const activities: Activity[] = []

    // Fetch recent clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id, full_name, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    clients?.forEach((client: any) => {
      activities.push({
        id: client.id,
        type: 'client',
        title: client.full_name,
        description: 'Novo cliente cadastrado',
        timestamp: new Date(client.created_at || ''),
      })
    })

    // Fetch recent viewings
    const { data: viewings } = await supabase
      .from('viewings')
      .select(`
        id,
        scheduled_at,
        created_at,
        property_id,
        properties (
          title
        )
      `)
      .eq('status', 'scheduled')
      .order('created_at', { ascending: false })
      .limit(5)

    viewings?.forEach((viewing: any) => {
      activities.push({
        id: viewing.id,
        type: 'viewing',
        title: 'Visita agendada',
        description: viewing.properties?.title || 'Imóvel',
        timestamp: new Date(viewing.created_at || ''),
      })
    })

    // Sort by timestamp and return top N
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return []
  }
}

export async function getPropertyDistribution(): Promise<PropertyDistribution[]> {
  const supabase = await createClient()

  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('property_type')
      .eq('status', 'active')
      .is('deleted_at', null)

    if (!properties || properties.length === 0) return []

    // Count by type
    const distribution: Record<string, number> = {}
    const total = properties.length

    properties.forEach((p: any) => {
      const type = p.property_type || 'unknown'
      distribution[type] = (distribution[type] || 0) + 1
    })

    // Convert to array with percentages
    return Object.entries(distribution)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('Error fetching property distribution:', error)
    return []
  }
}

export async function getPriceDistribution(): Promise<PriceRange[]> {
  const supabase = await createClient()

  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('price_total, price_monthly, listing_type')
      .eq('status', 'active')
      .is('deleted_at', null)

    if (!properties || properties.length === 0) return []

    const ranges = [
      { min: 0, max: 200000, label: 'Até R$ 200k' },
      { min: 200000, max: 500000, label: 'R$ 200k - R$ 500k' },
      { min: 500000, max: 1000000, label: 'R$ 500k - R$ 1M' },
      { min: 1000000, max: 2000000, label: 'R$ 1M - R$ 2M' },
      { min: 2000000, max: 999999999, label: 'Acima de R$ 2M' },
    ]

    return ranges.map((range) => {
      const inRange = properties.filter((p: any) => {
        const price = p.price_total || p.price_monthly || 0
        return price >= range.min && price < range.max
      })

      const rentInRange = inRange.filter((p: any) => p.listing_type === 'rent')
      const saleInRange = inRange.filter((p: any) => p.listing_type === 'sale')

      const avgRentPrice = rentInRange.length > 0
        ? rentInRange.reduce((sum: number, p: any) => sum + (p.price_monthly || 0), 0) / rentInRange.length
        : 0

      const avgSalePrice = saleInRange.length > 0
        ? saleInRange.reduce((sum: number, p: any) => sum + (p.price_total || 0), 0) / saleInRange.length
        : 0

      return {
        ...range,
        count: inRange.length,
        rentCount: rentInRange.length,
        saleCount: saleInRange.length,
        avgRentPrice: Math.round(avgRentPrice),
        avgSalePrice: Math.round(avgSalePrice),
      }
    })
  } catch (error) {
    console.error('Error fetching price distribution:', error)
    return []
  }
}

export async function getFeatureAnalysis(): Promise<FeatureAnalysis[]> {
  const supabase = await createClient()

  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('features, price_total, price_monthly, listing_type')
      .eq('status', 'active')
      .is('deleted_at', null)

    if (!properties || properties.length === 0) return []

    const total = properties.length
    const rentProperties = properties.filter((p: any) => p.listing_type === 'rent')
    const saleProperties = properties.filter((p: any) => p.listing_type === 'sale')

    const featureStats: Record<string, { 
      count: number
      totalPriceWith: number
      rentCount: number
      rentPriceWith: number
      saleCount: number
      salePriceWith: number
    }> = {}
    let totalPriceAll = 0
    let totalRentPrice = 0
    let totalSalePrice = 0

    properties.forEach((p: any) => {
      const price = p.price_total || p.price_monthly || 0
      totalPriceAll += price

      if (p.listing_type === 'rent') {
        totalRentPrice += p.price_monthly || 0
      } else if (p.listing_type === 'sale') {
        totalSalePrice += p.price_total || 0
      }

      if (p.features && Array.isArray(p.features)) {
        p.features.forEach((feature: string) => {
          if (!featureStats[feature]) {
            featureStats[feature] = { 
              count: 0, 
              totalPriceWith: 0,
              rentCount: 0,
              rentPriceWith: 0,
              saleCount: 0,
              salePriceWith: 0,
            }
          }
          featureStats[feature].count++
          featureStats[feature].totalPriceWith += price

          if (p.listing_type === 'rent') {
            featureStats[feature].rentCount++
            featureStats[feature].rentPriceWith += p.price_monthly || 0
          } else if (p.listing_type === 'sale') {
            featureStats[feature].saleCount++
            featureStats[feature].salePriceWith += p.price_total || 0
          }
        })
      }
    })

    const avgPriceAll = totalPriceAll / total
    const avgRentPrice = rentProperties.length > 0 ? totalRentPrice / rentProperties.length : 0
    const avgSalePrice = saleProperties.length > 0 ? totalSalePrice / saleProperties.length : 0

    return Object.entries(featureStats)
      .map(([feature, stats]) => {
        const avgPriceWith = stats.totalPriceWith / stats.count
        const avgPriceWithout =
          (totalPriceAll - stats.totalPriceWith) / (total - stats.count)
        const pricePremium = avgPriceWith - avgPriceWithout
        const premiumPercentage = ((pricePremium / avgPriceWithout) * 100)

        // Rent data
        const rentAvgWith = stats.rentCount > 0 ? stats.rentPriceWith / stats.rentCount : 0
        const rentAvgWithout = rentProperties.length > stats.rentCount
          ? (totalRentPrice - stats.rentPriceWith) / (rentProperties.length - stats.rentCount)
          : 0
        const rentPremiumPercentage = rentAvgWithout > 0
          ? ((rentAvgWith - rentAvgWithout) / rentAvgWithout) * 100
          : 0

        // Sale data
        const saleAvgWith = stats.saleCount > 0 ? stats.salePriceWith / stats.saleCount : 0
        const saleAvgWithout = saleProperties.length > stats.saleCount
          ? (totalSalePrice - stats.salePriceWith) / (saleProperties.length - stats.saleCount)
          : 0
        const salePremiumPercentage = saleAvgWithout > 0
          ? ((saleAvgWith - saleAvgWithout) / saleAvgWithout) * 100
          : 0

        return {
          feature,
          count: stats.count,
          percentage: Math.round((stats.count / total) * 100 * 10) / 10,
          avgPriceWith: Math.round(avgPriceWith),
          avgPriceWithout: Math.round(avgPriceWithout),
          pricePremium: Math.round(pricePremium),
          premiumPercentage: Math.round(premiumPercentage * 10) / 10,
          rentData: {
            count: stats.rentCount,
            avgPriceWith: Math.round(rentAvgWith),
            premiumPercentage: Math.round(rentPremiumPercentage * 10) / 10,
          },
          saleData: {
            count: stats.saleCount,
            avgPriceWith: Math.round(saleAvgWith),
            premiumPercentage: Math.round(salePremiumPercentage * 10) / 10,
          },
        }
      })
      .filter((f) => f.count >= 10) // Only features with 10+ properties
      .sort((a, b) => b.premiumPercentage - a.premiumPercentage)
      .slice(0, 15)
  } catch (error) {
    console.error('Error fetching feature analysis:', error)
    return []
  }
}

export async function getNeighborhoodStats(): Promise<NeighborhoodStats[]> {
  const supabase = await createClient()

  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('address_neighborhood, price_total, price_monthly, area_total, property_type, listing_type')
      .eq('status', 'active')
      .is('deleted_at', null)
      .not('address_neighborhood', 'is', null)

    if (!properties || properties.length === 0) return []

    const neighborhoodData: Record<string, any> = {}

    properties.forEach((p: any) => {
      const hood = p.address_neighborhood
      if (!hood) return

      if (!neighborhoodData[hood]) {
        neighborhoodData[hood] = {
          prices: [],
          areas: [],
          propertyTypes: {},
          rentPrices: [],
          salePrices: [],
          rentCount: 0,
          saleCount: 0,
        }
      }

      const price = p.price_total || p.price_monthly || 0
      if (price > 0) {
        neighborhoodData[hood].prices.push(price)
        if (p.listing_type === 'rent') {
          neighborhoodData[hood].rentPrices.push(p.price_monthly || 0)
          neighborhoodData[hood].rentCount++
        } else if (p.listing_type === 'sale') {
          neighborhoodData[hood].salePrices.push(p.price_total || 0)
          neighborhoodData[hood].saleCount++
        }
      }
      if (p.area_total > 0) neighborhoodData[hood].areas.push(p.area_total)

      const type = p.property_type || 'unknown'
      neighborhoodData[hood].propertyTypes[type] =
        (neighborhoodData[hood].propertyTypes[type] || 0) + 1
    })

    return Object.entries(neighborhoodData)
      .map(([neighborhood, data]: [string, any]) => {
        const prices = data.prices
        const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
        const avgArea =
          data.areas.length > 0
            ? data.areas.reduce((a: number, b: number) => a + b, 0) / data.areas.length
            : 0

        const avgRentPrice = data.rentPrices.length > 0
          ? data.rentPrices.reduce((a: number, b: number) => a + b, 0) / data.rentPrices.length
          : 0

        const avgSalePrice = data.salePrices.length > 0
          ? data.salePrices.reduce((a: number, b: number) => a + b, 0) / data.salePrices.length
          : 0

        return {
          neighborhood,
          count: prices.length,
          avgPrice: Math.round(avgPrice),
          minPrice: Math.min(...prices),
          maxPrice: Math.max(...prices),
          pricePerSqm: avgArea > 0 ? Math.round(avgPrice / avgArea) : 0,
          propertyTypes: data.propertyTypes,
          rentCount: data.rentCount,
          saleCount: data.saleCount,
          avgRentPrice: Math.round(avgRentPrice),
          avgSalePrice: Math.round(avgSalePrice),
        }
      })
      .filter((n) => n.count >= 3) // Only neighborhoods with 3+ properties
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
  } catch (error) {
    console.error('Error fetching neighborhood stats:', error)
    return []
  }
}

export async function getMarketInsights(): Promise<MarketInsights | null> {
  const supabase = await createClient()

  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('listing_type, property_type, price_total, price_monthly, features')
      .eq('status', 'active')
      .is('deleted_at', null)

    if (!properties || properties.length === 0) return null

    const total = properties.length

    // Portfolio mix
    const rentCount = properties.filter((p: any) => p.listing_type === 'rent').length
    const saleCount = properties.filter((p: any) => p.listing_type === 'sale').length

    // Dominant type
    const typeCount: Record<string, number> = {}
    properties.forEach((p: any) => {
      const type = p.property_type || 'unknown'
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    const dominantType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]

    // Price range analysis
    const priceRanges = await getPriceDistribution()
    const dominantRange = priceRanges.sort((a, b) => b.count - a.count)[0]

    // Top feature by premium
    const features = await getFeatureAnalysis()
    const topFeature = features[0]

    return {
      portfolioMix: {
        rentPercentage: Math.round((rentCount / total) * 100),
        salePercentage: Math.round((saleCount / total) * 100),
      },
      dominantType: {
        type: dominantType[0],
        percentage: Math.round((dominantType[1] / total) * 100),
      },
      dominantPriceRange: {
        range: dominantRange?.label || 'N/A',
        percentage: Math.round(((dominantRange?.count || 0) / total) * 100),
      },
      topFeature: {
        feature: topFeature?.feature || 'N/A',
        premiumPercentage: topFeature?.premiumPercentage || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching market insights:', error)
    return null
  }
}

export async function getDataQualityMetrics(): Promise<DataQualityMetrics | null> {
  const supabase = await createClient()

  try {
    const { data: properties } = await supabase
      .from('properties')
      .select('address_neighborhood, latitude, longitude, features, ai_embedding')
      .eq('status', 'active')
      .is('deleted_at', null)

    if (!properties || properties.length === 0) return null

    const total = properties.length
    const withNeighborhood = properties.filter((p: any) => p.address_neighborhood).length
    const withCoordinates = properties.filter(
      (p: any) => p.latitude && p.longitude
    ).length
    const withFeatures = properties.filter(
      (p: any) => p.features && p.features.length > 0
    ).length
    const withEmbeddings = properties.filter((p: any) => p.ai_embedding).length

    // Calculate completeness score (weighted average)
    const completenessScore = Math.round(
      (withNeighborhood * 0.3 +
        withCoordinates * 0.2 +
        withFeatures * 0.2 +
        withEmbeddings * 0.3) /
        total
    )

    return {
      totalProperties: total,
      withNeighborhood,
      withoutNeighborhood: total - withNeighborhood,
      withCoordinates,
      withFeatures,
      withEmbeddings,
      completenessScore,
    }
  } catch (error) {
    console.error('Error fetching data quality metrics:', error)
    return null
  }
}

export async function getPropertySamples(limit = 5): Promise<PropertySample[]> {
  const supabase = await createClient()

  try {
    const { data: properties } = await supabase
      .from('properties')
      .select(
        'id, title, price_total, price_monthly, image_url, property_type, address_neighborhood, address_city, bedrooms, area_total'
      )
      .eq('status', 'active')
      .is('deleted_at', null)
      .not('ai_embedding', 'is', null)
      .limit(limit * 3) // Get more to randomize

    if (!properties || properties.length === 0) return []

    // Randomize and take limit
    const shuffled = properties.sort(() => 0.5 - Math.random()).slice(0, limit)

    return shuffled.map((p: any) => ({
      id: p.id,
      title: p.title,
      price: p.price_total || p.price_monthly || 0,
      imageUrl: p.image_url,
      propertyType: p.property_type || 'unknown',
      neighborhood: p.address_neighborhood,
      city: p.address_city || '',
      bedrooms: p.bedrooms,
      area: p.area_total,
    }))
  } catch (error) {
    console.error('Error fetching property samples:', error)
    return []
  }
}
