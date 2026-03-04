import type { SyncState } from '../types'
import { appendExecution, loadSyncState, saveSyncState } from './state'

export async function appendExecutionResult(storageDirAbsolute: string, result: NonNullable<SyncState['executions']>[number]): Promise<void> {
  const state = await loadSyncState(storageDirAbsolute)
  await saveSyncState(storageDirAbsolute, appendExecution(state, result))
}
