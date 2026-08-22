import { describe, it } from 'vitest'

/**
 * TODO(fatih): the one frontend test the brief asks for — step gating.
 *
 * Worth covering:
 *   - an empty draft cannot leave step 1
 *   - a property alone does not unlock Review
 *   - a complete draft reports every step valid
 *   - a start date in the past invalidates the details step
 *
 * These are pure function calls; no rendering, no DOM.
 */
describe('step gating', () => {
  it.todo('blocks forward navigation until the current step is valid')
})
