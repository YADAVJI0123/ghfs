import type { ExecutionResult } from './execution'
import type { IssueKind, IssueState } from './issue'

export interface SyncItemState {
  number: number
  kind: IssueKind
  state: IssueState
  lastUpdatedAt: string
  lastSyncedAt: string
  filePath: string
  patchPath?: string
}

export interface SyncState {
  version: 1
  repo?: string
  lastSyncedAt?: string
  lastSince?: string
  items: Record<string, SyncItemState>
  executions: ExecutionResult[]
}
