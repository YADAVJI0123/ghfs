import type { PendingAction } from './actions'

export type { PendingAction, PendingActionAlias, PendingActionInput } from './actions'

export interface PendingOpBase {
  number: number
  action: PendingAction
  ifUnchangedSince?: string
}

export interface PendingTitleOp extends PendingOpBase {
  action: 'set-title'
  title: string
}

export interface PendingBodyOp extends PendingOpBase {
  action: 'set-body'
  body: string
}

export interface PendingCommentOp extends PendingOpBase {
  action: 'add-comment' | 'close-with-comment'
  body: string
}

export interface PendingLabelsOp extends PendingOpBase {
  action: 'add-labels' | 'remove-labels' | 'set-labels'
  labels: string[]
}

export interface PendingAssigneesOp extends PendingOpBase {
  action: 'add-assignees' | 'remove-assignees' | 'set-assignees'
  assignees: string[]
}

export interface PendingSetMilestoneOp extends PendingOpBase {
  action: 'set-milestone'
  milestone: string | number
}

export interface PendingLockOp extends PendingOpBase {
  action: 'lock'
  reason?: 'resolved' | 'off-topic' | 'too heated' | 'too-heated' | 'spam'
}

export interface PendingReviewersOp extends PendingOpBase {
  action: 'request-reviewers' | 'remove-reviewers'
  reviewers: string[]
}

export interface PendingSimpleOp extends PendingOpBase {
  action: 'close' | 'reopen' | 'clear-milestone' | 'unlock' | 'mark-ready-for-review' | 'convert-to-draft'
}

export type PendingOp
  = | PendingSimpleOp
    | PendingTitleOp
    | PendingBodyOp
    | PendingCommentOp
    | PendingLabelsOp
    | PendingAssigneesOp
    | PendingSetMilestoneOp
    | PendingLockOp
    | PendingReviewersOp

export type PendingFile = PendingOp[]

export const PR_ONLY_ACTIONS: PendingAction[] = [
  'request-reviewers',
  'remove-reviewers',
  'mark-ready-for-review',
  'convert-to-draft',
]

export const ACTIONS_WITH_BODY: PendingAction[] = ['set-body', 'add-comment', 'close-with-comment']
export const ACTIONS_WITH_LABELS: PendingAction[] = ['add-labels', 'remove-labels', 'set-labels']
export const ACTIONS_WITH_ASSIGNEES: PendingAction[] = ['add-assignees', 'remove-assignees', 'set-assignees']
export const ACTIONS_WITH_REVIEWERS: PendingAction[] = ['request-reviewers', 'remove-reviewers']
