import type { DraftPayload, Inclusion, Package, PackageListItem, Property } from './types'

/**
 * A failed request, carrying the server's own error shape.
 *
 * `fieldErrors` is Laravel's 422 `errors` object: one key per field or rule,
 * which is what lets the wizard point at the step that needs attention rather
 * than showing one opaque message.
 */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }

  get isValidation() {
    return this.status === 422
  }

  /** The package was published; the server refuses to change it. */
  get isConflict() {
    return this.status === 409
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message ?? `Request failed with status ${response.status}`,
      body?.errors ?? {},
    )
  }

  return (body?.data ?? body) as T
}

export const api = {
  properties: (search = '') =>
    request<Property[]>(`/properties${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  inclusions: () => request<Inclusion[]>('/inclusions'),

  packages: () => request<PackageListItem[]>('/packages'),

  package: (id: number) => request<Package>(`/packages/${id}`),

  createPackage: (payload: DraftPayload) =>
    request<Package>('/packages', { method: 'POST', body: JSON.stringify(payload) }),

  updatePackage: (id: number, payload: DraftPayload) =>
    request<Package>(`/packages/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  publishPackage: (id: number) =>
    request<Package>(`/packages/${id}/publish`, { method: 'POST' }),

  reset: () => request<void>('/dev/reset', { method: 'POST' }),
}
