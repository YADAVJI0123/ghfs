import { describe, expect, it } from 'vitest'
import { describeAction } from './action'

describe('describeAction', () => {
  it('formats action and issue number', () => {
    expect(describeAction('close', 42)).toBe('close #42')
  })
})
