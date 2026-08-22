import type { Package } from '../api/types'

/**
 * Wizard state and the rules that gate it.
 *
 * TODO(fatih): this file is yours. It is the piece the brief weighs most on the
 * frontend side ("how wizard state, draft persistence and step gating are modelled"),
 * so it is worth doing deliberately.
 *
 * What belongs here:
 *
 *  1. `WizardState` — packageId, status, propertyId, inclusionIds, the details
 *     fields, the current step, and a `dirty` flag for the unsaved-changes warning.
 *     Keep `price` a string: an empty input is '' , not 0.
 *
 *  2. `reducer(state, action)` — SELECT_PROPERTY, TOGGLE_INCLUSION, SET_DETAILS,
 *     GOTO_STEP, LOAD_DRAFT, MARK_SAVED. Every mutation sets dirty; LOAD_DRAFT and
 *     MARK_SAVED clear it.
 *
 *  3. Pure validators, exported so they can be tested without rendering anything:
 *       detailErrors(details)   -> { field: message } mirroring the server rules
 *       isStepValid(state, i)   -> boolean
 *       canGoTo(state, i)       -> back is always allowed; forward only if every
 *                                  earlier step is valid
 *     The stepper, the Next button and the Review step must all read from these —
 *     one source of truth, not three copies of the same rule.
 *
 *  4. `fromPackage(pkg)` — turn a GET /packages/{id} response into state, so a
 *     reopened draft lands the user back where they left off.
 *
 *  5. `toPayload(state)` — the DraftPayload the save call sends.
 *
 * Note on duplication: these rules also exist on the server. That is deliberate —
 * the API is the source of truth and rejects bad data regardless; this copy exists
 * only so the user finds out before they press Publish. Say so in the README.
 */

export type WizardStep = 0 | 1 | 2 | 3

export const STEP_LABELS = ['Property', 'Inclusions', 'Details', 'Review'] as const

export type WizardState = {
  packageId: number | null
  // ...
}

export function fromPackage(_pkg: Package): WizardState {
  throw new Error('not implemented')
}
