export interface DashboardStats {
  totalProperties: number
  propertiesThisWeek: number
  totalClients: number
  clientsThisMonth: number
  upcomingViewings: number
  avgPrice: number
  rentProperties: number
  saleProperties: number
  avgRentPrice: number
  avgSalePrice: number
}

export interface Activity {
  id: string
  type: 'client' | 'viewing' | 'chat' | 'property'
  title: string
  description?: string
  timestamp: Date
}

export interface PropertyDistribution {
  type: string
  count: number
  percentage: number
}

export interface PropertyMatch {
  clientId: string
  clientName: string
  propertyId: string
  propertyTitle: string
  matchScore: number
}

export interface QuickAction {
  id: string
  title: string
  icon: string
  href?: string
  prompt?: string
  color?: string
}

export interface PriceRange {
  min: number
  max: number
  label: string
  count: number
  rentCount: number
  saleCount: number
  avgRentPrice: number
  avgSalePrice: number
}

export interface FeatureAnalysis {
  feature: string
  count: number
  percentage: number
  avgPriceWith: number
  avgPriceWithout: number
  pricePremium: number
  premiumPercentage: number
  rentData: {
    count: number
    avgPriceWith: number
    premiumPercentage: number
  }
  saleData: {
    count: number
    avgPriceWith: number
    premiumPercentage: number
  }
}

export interface NeighborhoodStats {
  neighborhood: string
  count: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  pricePerSqm: number
  propertyTypes: Record<string, number>
  rentCount: number
  saleCount: number
  avgRentPrice: number
  avgSalePrice: number
}

export interface MarketInsights {
  portfolioMix: {
    rentPercentage: number
    salePercentage: number
  }
  dominantType: {
    type: string
    percentage: number
  }
  dominantPriceRange: {
    range: string
    percentage: number
  }
  topFeature: {
    feature: string
    premiumPercentage: number
  }
}

export interface DataQualityMetrics {
  totalProperties: number
  withNeighborhood: number
  withoutNeighborhood: number
  withCoordinates: number
  withFeatures: number
  withEmbeddings: number
  completenessScore: number
}

export interface PropertySample {
  id: string
  title: string
  price: number
  imageUrl: string | null
  propertyType: string
  neighborhood: string | null
  city: string
  bedrooms: number | null
  area: number | null
}
