import { describe, expect, it } from 'vitest'
import { canGoTo, detailErrors, initialState, isStepValid, reducer } from './state'
import type { WizardState } from './state'

/**
 * The rules under test come from the brief, not from the implementation:
 * a title of 5–100 characters, a price above zero, a start date that is not in
 * the past, an end date after the start, and at least one inclusion to publish.
 */

const shiftDays = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

const complete: WizardState = {
  ...initialState,
  propertyId: 1,
  inclusionIds: [1, 9],
  title: 'Aegean Slow Week',
  description: '',
  price: '1240.00',
  startDate: shiftDays(10),
  endDate: shiftDays(17),
}

describe('detail rules', () => {
  it('accepts a package that satisfies every rule', () => {
    expect(detailErrors(complete)).toEqual({})
  })

  it('rejects a title shorter than 5 or longer than 100 characters', () => {
    expect(detailErrors({ ...complete, title: 'abcd' })).toHaveProperty('title')
    expect(detailErrors({ ...complete, title: 'a'.repeat(101) })).toHaveProperty('title')
    expect(detailErrors({ ...complete, title: 'a'.repeat(100) })).toEqual({})
  })

  it('requires a price above zero', () => {
    expect(detailErrors({ ...complete, price: '0' })).toHaveProperty('price')
    expect(detailErrors({ ...complete, price: '' })).toHaveProperty('price')
    expect(detailErrors({ ...complete, price: '0.01' })).toEqual({})
  })

  it('refuses a start date in the past but accepts today', () => {
    expect(detailErrors({ ...complete, startDate: shiftDays(-1) })).toHaveProperty('startDate')
    expect(detailErrors({ ...complete, startDate: shiftDays(0) })).toEqual({})
  })

  it('requires the end date to be after the start date', () => {
    const sameDay = { ...complete, startDate: shiftDays(10), endDate: shiftDays(10) }
    expect(detailErrors(sameDay)).toHaveProperty('endDate')
    expect(detailErrors({ ...sameDay, endDate: shiftDays(11) })).toEqual({})
  })

  it('leaves the description optional, as the API does', () => {
    expect(detailErrors({ ...complete, description: '' })).toEqual({})
  })

  it('leaves the subtitle optional but caps it at 255 characters', () => {
    expect(detailErrors({ ...complete, subtitle: '' })).toEqual({})
    expect(detailErrors({ ...complete, subtitle: 'a'.repeat(255) })).toEqual({})
    expect(detailErrors({ ...complete, subtitle: 'a'.repeat(256) })).toHaveProperty('subtitle')
  })
})

describe('step gating', () => {
  it('holds an empty wizard on the property step', () => {
    expect(isStepValid(initialState, 0)).toBe(false)
    expect(canGoTo(initialState, 1)).toBe(false)
  })

  it('does not unlock the inclusions step on a property alone', () => {
    const withProperty = { ...initialState, propertyId: 1 }
    expect(isStepValid(withProperty, 0)).toBe(true)
    expect(canGoTo(withProperty, 1)).toBe(true)
    expect(isStepValid(withProperty, 1)).toBe(false)
    expect(canGoTo(withProperty, 2)).toBe(false)
  })

  it('treats every step of a complete package as valid', () => {
    expect(([0, 1, 2, 3] as const).map((step) => isStepValid(complete, step)))
      .toEqual([true, true, true, true])
  })

  it('lets the user go back to a completed step at any time', () => {
    const onReview = { ...complete, step: 3 as const }
    expect(canGoTo(onReview, 0)).toBe(true)
    expect(canGoTo(onReview, 2)).toBe(true)
  })

  it('closes the review step while an earlier step is unfinished', () => {
    expect(isStepValid({ ...complete, inclusionIds: [] }, 3)).toBe(false)
  })
})

describe('reducer', () => {
  it('marks the draft dirty when the package changes', () => {
    expect(reducer(initialState, { type: 'SELECT_PROPERTY', payload: 1 }).dirty).toBe(true)
    expect(reducer(initialState, { type: 'SET_DETAILS', payload: { title: 'x' } }).dirty).toBe(true)
  })

  it('does not mark the draft dirty for navigation alone', () => {
    expect(reducer(initialState, { type: 'GOTO_STEP', payload: 1 }).dirty).toBe(false)
  })

  it('adds and removes an inclusion with the same action', () => {
    const added = reducer(initialState, { type: 'TOGGLE_INCLUSION', payload: 4 })
    expect(added.inclusionIds).toEqual([4])
    expect(reducer(added, { type: 'TOGGLE_INCLUSION', payload: 4 }).inclusionIds).toEqual([])
  })

  it('clears the dirty flag once the draft is saved', () => {
    const edited = reducer(initialState, { type: 'SELECT_PROPERTY', payload: 1 })
    const saved = reducer(edited, { type: 'MARK_SAVED', packageId: 12 })
    expect(saved).toMatchObject({ packageId: 12, dirty: false, propertyId: 1 })
  })
})
