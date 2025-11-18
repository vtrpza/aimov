import { createClient } from '@/lib/supabase/server'
import { DashboardStatsCards } from '@/components/dashboard/DashboardStats'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { PropertyDistribution } from '@/components/dashboard/PropertyDistribution'
import { PriceDistributionChart } from '@/components/dashboard/PriceDistributionChart'
import { PremiumFeaturesAnalysis } from '@/components/dashboard/PremiumFeaturesAnalysis'
import { NeighborhoodHeatmap } from '@/components/dashboard/NeighborhoodHeatmap'
import { MarketIntelligence } from '@/components/dashboard/MarketIntelligence'
import { PropertySimilarityExplorer } from '@/components/dashboard/PropertySimilarityExplorer'
import {
  getDashboardStats,
  getRecentActivities,
  getPropertyDistribution,
  getPriceDistribution,
  getFeatureAnalysis,
  getNeighborhoodStats,
  getMarketInsights,
  getPropertySamples,
} from '@/lib/analytics/dashboard-queries'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Fetch all data in parallel
  const [
    stats,
    activities,
    distribution,
    priceDistribution,
    featureAnalysis,
    neighborhoodStats,
    marketInsights,
    propertySamples,
  ] = await Promise.all([
    getDashboardStats(),
    getRecentActivities(),
    getPropertyDistribution(),
    getPriceDistribution(),
    getFeatureAnalysis(),
    getNeighborhoodStats(),
    getMarketInsights(),
    getPropertySamples(5),
  ])

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Insights data-driven do seu portfólio imobiliário
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-6">
          <DashboardStatsCards stats={stats} />
        </div>

        {/* Market Intelligence */}
        <div className="mb-6">
          <MarketIntelligence data={marketInsights} />
        </div>

        {/* Price Distribution - Full Width */}
        <div className="mb-6">
          <PriceDistributionChart data={priceDistribution} />
        </div>

        {/* Premium Features */}
        <div className="mb-6">
          <PremiumFeaturesAnalysis data={featureAnalysis} />
        </div>

        {/* Neighborhood Analysis */}
        <div className="mb-6">
          <NeighborhoodHeatmap data={neighborhoodStats} />
        </div>

        {/* Property Similarity Explorer (uses embeddings!) */}
        <div className="mb-6">
          <PropertySimilarityExplorer samples={propertySamples} />
        </div>

        {/* Original widgets - kept for continuity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity activities={activities} />
          <PropertyDistribution data={distribution} />
        </div>
      </div>
    </div>
  )
}
