export type PackageStatus = 'draft' | 'published'

export type Property = {
  id: number
  name: string
  location: string
  nightly_rate: number
}

export type Inclusion = {
  id: number
  name: string
  category: string
  price: number
}

/** Row shape for the packages list. */
export type PackageListItem = {
  id: number
  status: PackageStatus
  title: string | null
  price: string | null
  start_date: string | null
  end_date: string | null
  property: Property | null
  inclusions_count: number
  updated_at: string
}

/** Full package, as returned by GET /packages/{id} — what a draft restores from. */
export type Package = {
  id: number
  status: PackageStatus
  title: string | null
  subtitle: string | null
  description: string | null
  price: string | null
  start_date: string | null
  end_date: string | null
  property: Property | null
  inclusions: Inclusion[]
  published_at: string | null
  updated_at: string
}

/** Everything the server accepts on a draft. Every field is optional by design. */
export type DraftPayload = {
  property_id?: number | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  price?: number | string | null
  start_date?: string | null
  end_date?: string | null
  inclusions?: number[]
}
