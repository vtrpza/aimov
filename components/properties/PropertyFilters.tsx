'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { usePreferencesStore, PropertyFilters as FiltersType } from '@/store/preferences-store'
import { formatBRL } from '@/lib/utils/brazilian-formatters'

const propertyTypes = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'casa', label: 'Casa' },
  { value: 'sobrado', label: 'Sobrado' },
  { value: 'sala_comercial', label: 'Sala Comercial' },
  { value: 'fazenda_sitio_chacara', label: 'Fazenda/Sítio/Chácara' },
]

interface PropertyFiltersProps {
  onFiltersChange: (filters: FiltersType) => void
}

export function PropertyFilters({ onFiltersChange }: PropertyFiltersProps) {
  const { propertyFilters, setPropertyFilters, clearPropertyFilters } = usePreferencesStore()
  const [open, setOpen] = useState(false)

  // Local state for filters (applied on "Aplicar Filtros")
  const [localFilters, setLocalFilters] = useState<FiltersType>(propertyFilters)

  const priceRange = [
    localFilters.minPrice || 0,
    localFilters.maxPrice || 5000000,
  ]

  const handlePriceChange = (values: number[]) => {
    setLocalFilters({
      ...localFilters,
      minPrice: values[0],
      maxPrice: values[1],
    })
  }

  const handlePropertyTypeToggle = (type: string) => {
    const currentTypes = localFilters.propertyType || []
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type]

    setLocalFilters({
      ...localFilters,
      propertyType: newTypes.length > 0 ? newTypes : undefined,
    })
  }

  const handleApplyFilters = () => {
    setPropertyFilters(localFilters)
    onFiltersChange(localFilters)
    setOpen(false)
  }

  const handleClearFilters = () => {
    const emptyFilters: FiltersType = {}
    setLocalFilters(emptyFilters)
    setPropertyFilters(emptyFilters)
    clearPropertyFilters()
    onFiltersChange(emptyFilters)
  }

  // Count active filters
  const activeFiltersCount = Object.keys(propertyFilters).filter(
    (key) => propertyFilters[key as keyof FiltersType] !== undefined
  ).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge
              variant="destructive"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtrar Imóveis</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Listing Type */}
          <div className="space-y-3">
            <Label>Tipo de Negócio</Label>
            <Select
              value={localFilters.listingType}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  listingType: value as 'rent' | 'sale',
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="rent">Aluguel</SelectItem>
                <SelectItem value="sale">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Faixa de Preço</Label>
              <span className="text-sm text-muted-foreground">
                {formatBRL(priceRange[0])} - {formatBRL(priceRange[1])}
              </span>
            </div>
            <Slider
              min={0}
              max={5000000}
              step={50000}
              value={priceRange}
              onValueChange={handlePriceChange}
              className="py-4"
            />
          </div>

          {/* Bedrooms */}
          <div className="space-y-3">
            <Label>Quartos</Label>
            <Select
              value={localFilters.bedrooms?.toString()}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  bedrooms: value === 'all' ? undefined : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bathrooms */}
          <div className="space-y-3">
            <Label>Banheiros</Label>
            <Select
              value={localFilters.bathrooms?.toString()}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  bathrooms: value === 'all' ? undefined : parseInt(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Types */}
          <div className="space-y-3">
            <Label>Tipo de Imóvel</Label>
            <div className="space-y-2">
              {propertyTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={type.value}
                    checked={localFilters.propertyType?.includes(type.value)}
                    onCheckedChange={() => handlePropertyTypeToggle(type.value)}
                  />
                  <label
                    htmlFor={type.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="flex-col sm:flex-col gap-2 pt-6 border-t">
          <Button onClick={handleApplyFilters} className="w-full">
            Aplicar Filtros
          </Button>
          <Button
            onClick={handleClearFilters}
            variant="outline"
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
