import { NextResponse } from 'next/server'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  message?: string
  meta?: PaginationMeta
  stats?: Record<string, number>
}

export interface ApiErrorResponse {
  success: false
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function successResponse<T>(
  data: T,
  status = 200,
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true as const, data }, { status })
}

export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
  extras?: { stats?: Record<string, number> },
): NextResponse<ApiSuccessResponse<T[]>> {
  return NextResponse.json({
    success: true as const,
    data,
    meta,
    ...extras,
  })
}

export function messageResponse(
  message: string,
  status = 200,
): NextResponse<ApiSuccessResponse<undefined> & { message: string }> {
  return NextResponse.json(
    { success: true as const, data: undefined, message },
    { status },
  )
}

export function errorResponse(
  message: string,
  status = 400,
): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false as const, message }, { status })
}
