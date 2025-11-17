/**
 * Formats a number as Brazilian Real currency
 * @param value - The number to format
 * @returns Formatted string like "R$ 1.234.567,89"
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formats a CEP (Brazilian postal code)
 * @param cep - CEP string (with or without formatting)
 * @returns Formatted string like "12345-678"
 */
export function formatCEP(cep: string): string {
  // Remove all non-numeric characters
  const cleaned = cep.replace(/\D/g, '')

  // Format as 12345-678
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }

  return cep
}

/**
 * Formats a Brazilian phone number
 * @param phone - Phone string (with or without formatting)
 * @returns Formatted string like "(11) 98765-4321" or "(11) 3456-7890"
 */
export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format mobile: (11) 98765-4321
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }

  // Format landline: (11) 3456-7890
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }

  return phone
}

/**
 * Formats a date in Brazilian format
 * @param date - Date object or ISO string
 * @returns Formatted string like "31/12/2024"
 */
export function formatDateBR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Formats a date and time in Brazilian format
 * @param date - Date object or ISO string
 * @returns Formatted string like "31/12/2024 às 14:30"
 */
export function formatDateTimeBR(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Formats area in square meters
 * @param area - Area in m²
 * @returns Formatted string like "120 m²" or "1.234,56 m²"
 */
export function formatArea(area: number): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(area)

  return `${formatted} m²`
}

/**
 * Validates and formats a CEP input
 * @param value - Input value
 * @returns Cleaned and formatted CEP
 */
export function validateCEP(value: string): boolean {
  const cleaned = value.replace(/\D/g, '')
  return cleaned.length === 8
}

/**
 * Validates a Brazilian phone number
 * @param value - Phone number
 * @returns True if valid
 */
export function validatePhone(value: string): boolean {
  const cleaned = value.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Formats a number with Brazilian locale
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Brazilian states (UF)
 */
export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' },
] as const
