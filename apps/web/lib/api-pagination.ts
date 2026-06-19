import { NextRequest } from 'next/server'
import { PaginationMeta } from './api-response'

export interface PaginationParams {
  page: number
  limit: number
}

export function parsePaginationParams(request: NextRequest): PaginationParams {
  const searchParams = request.nextUrl.searchParams
  return {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  }
}

export function paginateArray<T>(items: T[], params: PaginationParams): T[] {
  const startIndex = (params.page - 1) * params.limit
  return items.slice(startIndex, startIndex + params.limit)
}

export function buildPaginationMeta(
  filteredTotal: number,
  params: PaginationParams,
): PaginationMeta {
  return {
    page: params.page,
    limit: params.limit,
    total: filteredTotal,
    totalPages: Math.ceil(filteredTotal / params.limit),
  }
}

export function filterBySearch<T>(
  items: T[],
  search: string | null,
  fields: (keyof T)[],
): T[] {
  if (!search) return items
  const searchLower = search.toLowerCase()
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field]
      return typeof value === 'string' && value.toLowerCase().includes(searchLower)
    }),
  )
}

export function filterByField<T>(
  items: T[],
  value: string | null,
  field: keyof T,
): T[] {
  if (!value || value === 'all') return items
  return items.filter((item) => item[field] === value)
}
