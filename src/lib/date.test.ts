import { describe, expect, it } from 'vitest'
import { today } from './date'

describe('today', () => {
  it('returns a YYYY-MM-DD calendar stamp for the current day', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(today()).toBe(new Date().toISOString().slice(0, 10))
  })
})
