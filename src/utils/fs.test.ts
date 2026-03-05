import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { pathExists } from './fs'

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map(dir => rm(dir, { recursive: true, force: true })))
})

describe('pathExists', () => {
  it('returns true for existing paths', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ghfs-utils-fs-'))
    tempDirs.push(dir)

    const file = join(dir, 'file.txt')
    await writeFile(file, 'ok', 'utf8')

    await expect(pathExists(file)).resolves.toBe(true)
  })

  it('returns false for missing paths', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ghfs-utils-fs-'))
    tempDirs.push(dir)

    await expect(pathExists(join(dir, 'missing.txt'))).resolves.toBe(false)
  })
})
