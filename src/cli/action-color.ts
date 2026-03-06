import type { ActionName } from '../execute/actions'
import c from 'ansis'
import { ACTIONS_COLOR_HEX } from '../execute/actions'

export function colorizeAction(action: string, enabled = true): string {
  if (!enabled)
    return action

  const colorHex = ACTIONS_COLOR_HEX[action as ActionName]
  if (!colorHex)
    return c.white(action)

  return c.hex(colorHex)(action)
}

export interface CliOperationDisplayInput {
  action: string
  number: number
  title?: string
  body?: string
  labels?: string[]
  assignees?: string[]
  milestone?: string | number
  reviewers?: string[]
  reason?: string
}

export interface DescribeCliOperationOptions {
  tty?: boolean
  repo?: string
}

export function describeCliOperation(op: CliOperationDisplayInput, options: DescribeCliOperationOptions = {}): string {
  const tty = options.tty ?? false
  const issueRef = formatIssueRef(op.number, options.repo, tty)
  const action = colorizeAction(op.action, tty)
  const values = formatOperationValues(op)

  if (!values)
    return `${issueRef} ${action}`

  return `${issueRef} ${action} ${values}`
}

function formatIssueRef(number: number, repo: string | undefined, tty: boolean): string {
  const text = `#${number}`
  if (!tty || !repo || !repo.includes('/'))
    return text

  return formatTerminalLink(text, `https://github.com/${repo}/issues/${number}`)
}

function formatTerminalLink(text: string, url: string): string {
  return `\u001B]8;;${url}\u001B\\${text}\u001B]8;;\u001B\\`
}

function formatOperationValues(op: CliOperationDisplayInput): string | undefined {
  switch (op.action) {
    case 'set-title':
      return wrapTextValue(op.title)
    case 'set-body':
    case 'add-comment':
    case 'close-with-comment':
      return wrapTextValue(op.body)
    case 'add-labels':
    case 'remove-labels':
    case 'set-labels':
      return joinValues(op.labels)
    case 'add-assignees':
    case 'remove-assignees':
    case 'set-assignees':
      return joinValues(op.assignees)
    case 'set-milestone':
      return op.milestone != null ? String(op.milestone) : undefined
    case 'request-reviewers':
    case 'remove-reviewers':
      return joinValues(op.reviewers)
    case 'lock':
      return op.reason
    default:
      return undefined
  }
}

function joinValues(values: string[] | undefined): string | undefined {
  if (!values || values.length === 0)
    return undefined
  return values.join(', ')
}

function wrapTextValue(value: string | undefined): string | undefined {
  if (!value)
    return undefined
  const normalized = value.trim()
  if (normalized.length <= 48)
    return normalized
  return `${normalized.slice(0, 45)}...`
}
