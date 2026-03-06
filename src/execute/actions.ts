export const PENDING_ACTIONS = [
  'close',
  'close-with-comment',
  'reopen',
  'set-title',
  'set-body',
  'add-comment',
  'add-labels',
  'remove-labels',
  'set-labels',
  'add-assignees',
  'remove-assignees',
  'set-assignees',
  'set-milestone',
  'clear-milestone',
  'lock',
  'unlock',
  'request-reviewers',
  'remove-reviewers',
  'mark-ready-for-review',
  'convert-to-draft',
] as const

export type PendingAction = typeof PENDING_ACTIONS[number]

export const PENDING_ACTION_ALIAS_MAP = {
  'open': 'reopen',
  'closes': 'close',
  'close-comment': 'close-with-comment',
  'comment-close': 'close-with-comment',
  'close-and-comment': 'close-with-comment',
  'comment-and-close': 'close-with-comment',
  'label': 'add-labels',
  'labels': 'add-labels',
  'tag': 'add-labels',
  'tags': 'add-labels',
  'add-tag': 'add-labels',
  'assign': 'add-assignees',
  'assignee': 'add-assignees',
  'assignees': 'add-assignees',
  'body': 'set-body',
  'title': 'set-title',
  'retitle': 'set-title',
  'ready': 'mark-ready-for-review',
  'undraft': 'mark-ready-for-review',
  'draft': 'convert-to-draft',
  'comment': 'add-comment',
} as const satisfies Record<string, PendingAction>

export type PendingActionAlias = keyof typeof PENDING_ACTION_ALIAS_MAP
export type PendingActionInput = PendingAction | PendingActionAlias

const PENDING_ACTION_SET = new Set<PendingAction>(PENDING_ACTIONS)

export const PENDING_ACTION_ALIASES = Object.keys(PENDING_ACTION_ALIAS_MAP) as PendingActionAlias[]
export const PENDING_ACTION_INPUTS = [...PENDING_ACTIONS, ...PENDING_ACTION_ALIASES] as const

export function resolvePendingAction(action: string): PendingAction | undefined {
  const normalized = normalizePendingActionInput(action)
  if (!normalized)
    return undefined

  if (PENDING_ACTION_SET.has(normalized as PendingAction))
    return normalized as PendingAction

  return PENDING_ACTION_ALIAS_MAP[normalized as PendingActionAlias]
}

export function normalizePendingActionInput(action: string): string {
  return action.trim().toLowerCase()
}
