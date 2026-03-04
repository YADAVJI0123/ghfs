import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getSyncStatePath, loadSyncState } from './state'

describe('loadSyncState', () => {
  it('normalizes legacy updatedAt to lastUpdatedAt and lastSyncedAt', async () => {
    const storageDir = await mkdtemp(join(tmpdir(), 'ghfs-sync-state-test-'))
    await writeFile(getSyncStatePath(storageDir), JSON.stringify({
      version: 1,
      lastSyncedAt: '2026-01-01T00:00:00.000Z',
      items: {
        123: {
          number: 123,
          kind: 'issue',
          state: 'open',
          updatedAt: '2026-01-03T00:00:00.000Z',
          filePath: 'issues/00123-legacy-issue.md',
        },
      },
      executions: [],
    }, null, 2), 'utf8')

    const state = await loadSyncState(storageDir)
    expect(state.items['123']).toMatchObject({
      number: 123,
      kind: 'issue',
      state: 'open',
      lastUpdatedAt: '2026-01-03T00:00:00.000Z',
      lastSyncedAt: '2026-01-01T00:00:00.000Z',
      filePath: 'issues/00123-legacy-issue.md',
    })

    await rm(storageDir, { recursive: true, force: true })
  })
})
