import type { SyncItemState, SyncState } from '../types'
import type { ClosedIssuePolicyInput, IssuePaths, ItemSyncStats, PatchPlan, SyncContext } from './sync-repository-types'
import { rm } from 'node:fs/promises'
import { ensureDir, exists, moveFile, removeFile } from '../utils/fs'
import { getClosedIssueMarkdownPath, getClosedIssuesDir, getIssueMarkdownPath, getIssuesDir, getPrPatchPath } from './paths'
import { relativeToStorage, shouldSyncKind } from './sync-repository-utils'

export async function ensureStorageStructure(storageDirAbsolute: string): Promise<void> {
  await ensureDir(getIssuesDir(storageDirAbsolute))
  await ensureDir(getClosedIssuesDir(storageDirAbsolute))
}

export async function resolveIssuePaths(storageDirAbsolute: string, number: number, state: 'open' | 'closed'): Promise<IssuePaths> {
  const closedPath = getClosedIssueMarkdownPath(storageDirAbsolute, number)
  const openPath = getIssueMarkdownPath(storageDirAbsolute, number, 'open')
  const hasClosedFile = await exists(closedPath)
  const hasOpenFile = await exists(openPath)
  const targetPath = getIssueMarkdownPath(storageDirAbsolute, number, state)
  const hasTargetFile = state === 'open' ? hasOpenFile : hasClosedFile

  return {
    openPath,
    closedPath,
    targetPath,
    patchPath: getPrPatchPath(storageDirAbsolute, number),
    hasOpenFile,
    hasClosedFile,
    hasLocalFile: hasOpenFile || hasClosedFile,
    hasTargetFile,
  }
}

export async function handleClosedIssueByPolicy(input: ClosedIssuePolicyInput): Promise<ItemSyncStats | undefined> {
  const { context, number, kind, state, paths } = input
  if (state !== 'closed')
    return undefined

  if (context.config.sync.closed === false) {
    if (paths.hasOpenFile)
      await removeFile(paths.openPath)
    if (paths.hasClosedFile)
      await removeFile(paths.closedPath)

    let patchesDeleted = 0
    if (kind === 'pull')
      patchesDeleted += await removePatchIfExists(context.storageDirAbsolute, number)

    delete context.syncState.items[String(number)]
    return {
      written: 0,
      moved: 0,
      patchesWritten: 0,
      patchesDeleted,
    }
  }

  if (context.config.sync.closed === 'existing' && !paths.hasLocalFile) {
    let patchesDeleted = 0
    if (kind === 'pull' && context.config.sync.patches !== 'all')
      patchesDeleted += await removePatchIfExists(context.storageDirAbsolute, number)

    delete context.syncState.items[String(number)]
    return {
      written: 0,
      moved: 0,
      patchesWritten: 0,
      patchesDeleted,
    }
  }

  return undefined
}

export async function shouldSkipIssueSync(
  tracked: SyncItemState | undefined,
  issueUpdatedAt: string,
  paths: IssuePaths,
  patchPlan: PatchPlan,
): Promise<boolean> {
  if (!tracked)
    return false
  if (tracked.lastUpdatedAt !== issueUpdatedAt)
    return false
  if (!paths.hasTargetFile)
    return false

  if (patchPlan.shouldWritePatch)
    return await exists(paths.patchPath)

  return true
}

export async function moveMarkdownByState(paths: IssuePaths, state: 'open' | 'closed'): Promise<number> {
  if (state === 'open' && paths.hasClosedFile) {
    await moveFile(paths.closedPath, paths.openPath)
    return 1
  }

  if (state === 'closed' && paths.hasOpenFile) {
    await moveFile(paths.openPath, paths.closedPath)
    return 1
  }

  return 0
}

export function updateTrackedItem(
  context: SyncContext,
  number: number,
  kind: 'issue' | 'pull',
  state: 'open' | 'closed',
  issueUpdatedAt: string,
  markdownPath: string,
  patchPath: string | undefined,
): void {
  context.syncState.items[String(number)] = {
    number,
    kind,
    state,
    lastUpdatedAt: issueUpdatedAt,
    lastSyncedAt: context.syncedAt,
    filePath: relativeToStorage(context.storageDirAbsolute, markdownPath),
    patchPath: patchPath ? relativeToStorage(context.storageDirAbsolute, patchPath) : undefined,
  }
}

export async function pruneTrackedClosedItems(storageDirAbsolute: string, syncState: SyncState, sync: SyncContext['config']['sync']): Promise<number> {
  await rm(getClosedIssuesDir(storageDirAbsolute), { recursive: true, force: true })
  await ensureDir(getClosedIssuesDir(storageDirAbsolute))

  let patchesDeleted = 0
  for (const item of Object.values(syncState.items)) {
    if (item.state !== 'closed')
      continue
    if (!shouldSyncKind(sync, item.kind))
      continue
    if (item.kind === 'pull')
      patchesDeleted += await removePatchIfExists(storageDirAbsolute, item.number)
    delete syncState.items[String(item.number)]
  }

  return patchesDeleted
}

export async function pruneMissingOpenTrackedItems(storageDirAbsolute: string, syncState: SyncState, openNumbers: Set<number>, sync: SyncContext['config']['sync']): Promise<number> {
  let patchesDeleted = 0

  for (const item of Object.values(syncState.items)) {
    if (item.state !== 'open')
      continue
    if (!shouldSyncKind(sync, item.kind))
      continue
    if (openNumbers.has(item.number))
      continue

    await removeFile(getIssueMarkdownPath(storageDirAbsolute, item.number, 'open'))
    if (item.kind === 'pull')
      patchesDeleted += await removePatchIfExists(storageDirAbsolute, item.number)
    delete syncState.items[String(item.number)]
  }

  return patchesDeleted
}

export async function removePatchIfExists(storageDirAbsolute: string, number: number): Promise<number> {
  const patchPath = getPrPatchPath(storageDirAbsolute, number)
  if (!await exists(patchPath))
    return 0
  await removeFile(patchPath)
  return 1
}
