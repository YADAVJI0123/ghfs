import { describe, expect, it } from 'vitest'
import { PENDING_ACTION_ALIAS_MAP, PENDING_ACTION_ALIASES, PENDING_ACTIONS, resolvePendingAction } from './actions'

describe('resolvePendingAction', () => {
  it('resolves canonical action names case-insensitively', () => {
    for (const action of PENDING_ACTIONS) {
      expect(resolvePendingAction(action)).toBe(action)
      expect(resolvePendingAction(action.toUpperCase())).toBe(action)
    }
  })

  it('resolves aliases case-insensitively', () => {
    for (const alias of PENDING_ACTION_ALIASES) {
      expect(resolvePendingAction(alias)).toBe(PENDING_ACTION_ALIAS_MAP[alias])
      expect(resolvePendingAction(alias.toUpperCase())).toBe(PENDING_ACTION_ALIAS_MAP[alias])
    }
  })

  it('returns undefined for unknown actions', () => {
    expect(resolvePendingAction('unknown')).toBeUndefined()
    expect(resolvePendingAction('')).toBeUndefined()
    expect(resolvePendingAction('   ')).toBeUndefined()
  })
})
