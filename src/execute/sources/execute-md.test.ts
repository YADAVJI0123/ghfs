import { describe, expect, it } from 'vitest'
import { parseExecuteMd, parseExecuteMdLine, stringifyExecuteMd } from './execute-md'

describe('parseExecuteMdLine', () => {
  it('parses simple multi-target action', () => {
    expect(parseExecuteMdLine('close #1 #2')).toEqual({
      kind: 'multi',
      action: 'close',
      numbers: [1, 2],
    })
  })

  it('parses set-title with quoted value', () => {
    expect(parseExecuteMdLine('set-title #2 "new title"')).toEqual({
      kind: 'single',
      op: {
        action: 'set-title',
        number: 2,
        title: 'new title',
      },
    })
  })

  it('supports escaped quote and slash in quoted values', () => {
    expect(parseExecuteMdLine(String.raw`set-title #2 "a \"quoted\" title"`)).toEqual({
      kind: 'single',
      op: {
        action: 'set-title',
        number: 2,
        title: 'a "quoted" title',
      },
    })
  })

  it('parses add-tag and trims labels', () => {
    expect(parseExecuteMdLine('add-tag #3 foo, bar,baz')).toEqual({
      kind: 'single',
      op: {
        action: 'add-labels',
        number: 3,
        labels: ['foo', 'bar', 'baz'],
      },
    })
  })

  it('returns warning for malformed quoted text', () => {
    expect(parseExecuteMdLine('set-title #1 "oops')).toEqual({
      kind: 'warning',
      message: 'invalid quoted string syntax',
    })
  })

  it('returns warning for unknown command', () => {
    expect(parseExecuteMdLine('unknown #1')).toEqual({
      kind: 'warning',
      message: 'unrecognized action pattern: unknown',
    })
  })

  it('ignores comments and blank lines', () => {
    expect(parseExecuteMdLine('')).toBeUndefined()
    expect(parseExecuteMdLine('   ')).toBeUndefined()
    expect(parseExecuteMdLine('# close #1')).toBeUndefined()
  })
})

describe('stringifyExecuteMd', () => {
  it('keeps raw lines and only remaining operations', () => {
    const parsed = parseExecuteMd([
      '# header',
      'close #1 #2 #3',
      'set-title #4 "new title"',
      'add-tag #5 foo, bar',
      'unknown #6',
    ].join('\n'))

    expect(parsed.warnings).toEqual([
      'execute-md line 5: unrecognized action pattern: unknown',
    ])

    const output = stringifyExecuteMd(parsed, new Set([1, 3, 4]))
    expect(output).toBe([
      '# header',
      'close #2',
      'set-title #4 "new title"',
      'add-tag #5 foo, bar',
      'unknown #6',
      '',
    ].join('\n'))
  })
})
