import type { DraftPayload, Package, PackageStatus } from '../api/types'
import z from 'zod'
/**
 * Wizard state and the rules that gate it.
 *
 * State lives in one reducer, and the gating rules are pure functions so the stepper,
 * the Next button and the Publish button all read the same predicate instead of each
 * repeating it. Being pure also means they can be tested without rendering anything.
 *
 * The rules mirror the ones the API enforces on publish. That duplication is deliberate:
 * the server decides, this copy only exists so the user finds out before pressing Publish.
 */

export type WizardStep = 0 | 1 | 2 | 3

export const STEP_LABELS = ['Property', 'Inclusions', 'Details', 'Review'] as const
export const todayIso = () => new Date().toISOString().slice(0, 10)
export type WizardState = {
  packageId: number | null
  propertyId: number | null
  title: string
  subtitle: string
  description: string
  price: string
  startDate: string
  endDate: string
  status: PackageStatus
  inclusionIds: number[]
  step: WizardStep
  dirty: boolean

}

export type WizardAction =
  | { type: 'SELECT_PROPERTY', payload: number }
  | { type: 'TOGGLE_INCLUSION', payload: number }
  | { type: 'SET_DETAILS', payload: Partial<Pick<WizardState, 'title' | 'subtitle' | 'description' | 'price' | 'startDate' | 'endDate'>> }
  | { type: 'GOTO_STEP', payload: WizardStep }
  | { type: 'LOAD_DRAFT', payload: Package }
  | { type: 'MARK_SAVED', packageId: number }

export function fromPackage(pkg: Package): WizardState {
  const restored: WizardState = {
    packageId: pkg.id,
    propertyId: pkg.property?.id ?? null,
    title: pkg.title ?? '',
    subtitle: pkg.subtitle ?? '',
    description: pkg.description ?? '',
    price: pkg.price ?? '',
    startDate: pkg.start_date ?? '',
    endDate: pkg.end_date ?? '',
    status: pkg.status,
    inclusionIds: pkg.inclusions.map((i) => i.id),
    step: 0,
    dirty: false,
  }

  // Reopen a draft where it still needs work; a complete one opens on Review.
  // `??` and not `||`: step 0 is a legitimate answer and would be swallowed by `||`.
  const step = ([0, 1, 2] as const).find((i) => !isStepValid(restored, i)) ?? 3

  return { ...restored, step }
}
export const initialState: WizardState = {
  packageId: null,
  propertyId: null,
  title: '',
  subtitle: '',
  description: '',
  price: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  inclusionIds: [],
  step: 0,
  dirty: false
}

export function reducer(
  state: WizardState,
  action: WizardAction
): WizardState {
  switch (action.type) {
    case 'SELECT_PROPERTY':
      return { ...state, propertyId: action.payload, dirty: true }
    case 'TOGGLE_INCLUSION':
      return { ...state, inclusionIds: state.inclusionIds.includes(action.payload) ? state.inclusionIds.filter(id => id !== action.payload) : [...state.inclusionIds, action.payload], dirty: true }
    case 'SET_DETAILS':
      return { ...state, ...action.payload, dirty: true }
    case 'GOTO_STEP':
      return { ...state, step: action.payload }
    case 'LOAD_DRAFT':
      return fromPackage(action.payload)
    case 'MARK_SAVED':
      return { ...state, packageId: action.packageId, dirty: false }
    default:
      return state
  }
}
const detailsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.').max(100, 'Title must be at most 100 characters long.'),
  subtitle: z.string().max(255, 'Subtitle must be at most 255 characters long.'),
  description: z.string(),
  price: z.string().refine(value => {
    const price = Number(value)
    return !isNaN(price) && price > 0
  }, 'Price must be a positive number.'),
  startDate: z.string()
    .min(1, 'Start date is required.')
    .refine((v) => v >= todayIso(), 'Start date cannot be in the past.'),
  endDate: z.string().refine(value => {
    const date = new Date(value)
    return !isNaN(date.getTime())
  }, 'Please enter a valid end date.')

})
  .refine((d) => d.endDate > d.startDate, {
    path: ['endDate'],
    message: 'End date must be after the start date.',
  })


export function detailErrors(state: WizardState) {
  const result = detailsSchema.safeParse(state)
  if (result.success) return {}

  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = String(issue.path[0])
    errors[key] ??= issue.message
  }
  return errors

}
export function isStepValid(state: WizardState, step: WizardStep): boolean {
  switch (step) {
    case 0: return state.propertyId !== null
    case 1: return state.inclusionIds.length > 0
    case 2: return Object.keys(detailErrors(state)).length === 0
    case 3: return ([0, 1, 2] as const).every((i) => isStepValid(state, i))
    default: return false
  }
}

export function canGoTo(state: WizardState, step: WizardStep): boolean {
  if (step <= state.step) return true

  return Array.from({ length: step }, (_, i) => i as WizardStep)
    .every((i) => isStepValid(state, i))
}

/**
 * State to the shape the draft endpoints accept.
 *
 * Empty inputs go out as null rather than '': the API validates `start_date`
 * and `price` by type, and an empty string is neither a date nor a number.
 */
export function toPayload(state: WizardState): DraftPayload {
  return {
    property_id: state.propertyId,
    title: state.title || null,
    subtitle: state.subtitle || null,
    description: state.description || null,
    price: state.price || null,
    start_date: state.startDate || null,
    end_date: state.endDate || null,
    inclusions: state.inclusionIds,
  }
}
