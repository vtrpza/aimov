'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface PropertyFilters {
  city?: string
  state?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  bathrooms?: number
  propertyType?: string[]
  listingType?: 'rent' | 'sale'
}

interface PreferencesState {
  // Favorites
  favoritePropertyIds: string[]
  addFavorite: (propertyId: string) => void
  removeFavorite: (propertyId: string) => void
  isFavorite: (propertyId: string) => boolean

  // Property filters
  propertyFilters: PropertyFilters
  setPropertyFilters: (filters: PropertyFilters) => void
  clearPropertyFilters: () => void

  // Recent searches
  recentSearches: string[]
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void

  // UI preferences
  propertyViewMode: 'grid' | 'list'
  setPropertyViewMode: (mode: 'grid' | 'list') => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      favoritePropertyIds: [],

      addFavorite: (propertyId) => {
        set((state) => ({
          favoritePropertyIds: Array.from(new Set([...state.favoritePropertyIds, propertyId])),
        }))
      },

      removeFavorite: (propertyId) => {
        set((state) => ({
          favoritePropertyIds: state.favoritePropertyIds.filter((id) => id !== propertyId),
        }))
      },

      isFavorite: (propertyId) => {
        return get().favoritePropertyIds.includes(propertyId)
      },

      propertyFilters: {},

      setPropertyFilters: (filters) => {
        set({ propertyFilters: filters })
      },

      clearPropertyFilters: () => {
        set({ propertyFilters: {} })
      },

      recentSearches: [],

      addRecentSearch: (query) => {
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== query)
          return {
            recentSearches: [query, ...filtered].slice(0, 10), // Keep last 10 searches
          }
        })
      },

      clearRecentSearches: () => {
        set({ recentSearches: [] })
      },

      propertyViewMode: 'grid',

      setPropertyViewMode: (mode) => {
        set({ propertyViewMode: mode })
      },
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
