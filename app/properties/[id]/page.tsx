import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatBRL, formatArea, formatCEP } from '@/lib/utils/brazilian-formatters'
import Link from 'next/link'
import { ArrowLeft, MapPin, Home, BedDouble, Bath, Calendar } from 'lucide-react'
import type { Database } from '@/types/database'

type Property = Database['public']['Tables']['properties']['Row']

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const property: Property = data

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'sold':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'rented':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string | null) => {
    const statuses: Record<string, string> = {
      available: 'Disponível',
      sold: 'Vendido',
      rented: 'Alugado',
      pending: 'Pendente',
      active: 'Ativo',
    }
    return status ? statuses[status] || status : 'N/A'
  }

  const getTypeText = (type: string | null) => {
    const types: Record<string, string> = {
      apartment: 'Apartamento',
      house: 'Casa',
      commercial: 'Comercial',
      land: 'Terreno',
      farm: 'Chácara/Fazenda',
    }
    return type ? types[type] || type : 'N/A'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/properties"
          className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para imóveis
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Images */}
          {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
            <div className="h-96 bg-gray-200 dark:bg-gray-700">
              <img
                src={property.images[0] as string}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-96 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900 flex items-center justify-center">
              <Home className="w-32 h-32 text-indigo-300 dark:text-indigo-600" />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>
                    {property.address_neighborhood}, {property.address_city} - {property.address_state},{' '}
                    {property.address_zipcode && formatCEP(property.address_zipcode)}
                  </span>
                </div>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                  property.status
                )}`}
              >
                {getStatusText(property.status)}
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                {property.price_total ? formatBRL(Number(property.price_total)) : property.price_monthly ? formatBRL(Number(property.price_monthly)) : 'Preço sob consulta'}
              </p>
              {property.price_monthly && property.listing_type === 'rent' && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Aluguel mensal
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Home className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Área</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {property.area_total ? formatArea(Number(property.area_total)) : 'N/A'}
                </p>
              </div>
              {property.bedrooms !== null && (
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <BedDouble className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Quartos
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {property.bedrooms}
                  </p>
                </div>
              )}
              {property.bathrooms !== null && (
                <div className="text-center">
                  <div className="flex justify-center mb-2">
                    <Bath className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Banheiros
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {property.bathrooms}
                  </p>
                </div>
              )}
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tipo</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getTypeText(property.property_type)}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Descrição
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.features && Array.isArray(property.features) && property.features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Comodidades
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature: any, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="flex gap-4">
              <Link
                href={`/chat?property=${property.id}`}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-center font-semibold"
              >
                Agendar Visita com IA
              </Link>
              <Link
                href="/chat"
                className="flex-1 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 px-6 py-3 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors text-center font-semibold"
              >
                Falar com Assistente
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
