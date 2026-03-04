import type { Octokit } from 'octokit'
import type { GitHubComment, GitHubIssue, GitHubPull, IssueCandidates, SyncContext } from './sync-repository-types'
import { resolvePaginateState } from './sync-repository-utils'

export async function fetchIssueCandidatesByPagination(context: SyncContext, since: string | undefined): Promise<IssueCandidates> {
  if (context.config.sync.closed === false) {
    const openIssues = await paginateIssues(context, 'open', since)
    if (!since) {
      return {
        issues: openIssues,
        scanned: openIssues.length,
        allOpenNumbers: new Set(openIssues.map(issue => issue.number)),
      }
    }

    const recentlyClosedIssues = await paginateIssues(context, 'closed', since)
    return {
      issues: [...openIssues, ...recentlyClosedIssues],
      scanned: openIssues.length + recentlyClosedIssues.length,
    }
  }

  const state = resolvePaginateState(context.config.sync.closed)
  const issues = await paginateIssues(context, state, since)
  return {
    issues,
    scanned: issues.length,
  }
}

export async function fetchIssueCandidatesByNumbers(context: SyncContext, numbers: number[]): Promise<IssueCandidates> {
  const issues = await getIssuesByNumbers(context.octokit, context.owner, context.repo, numbers)
  return {
    issues,
    scanned: issues.length,
  }
}

export async function fetchIssueComments(context: SyncContext, number: number): Promise<GitHubComment[]> {
  return await context.octokit.paginate(context.octokit.rest.issues.listComments, {
    owner: context.owner,
    repo: context.repo,
    issue_number: number,
    per_page: 100,
  }) as GitHubComment[]
}

export async function getPullMetadata(octokit: Octokit, owner: string, repo: string, number: number): Promise<{ isDraft: boolean, merged: boolean, mergedAt: string | null, baseRef: string, headRef: string, requestedReviewers: string[] }> {
  const result = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: number,
  })

  const pull = result.data as GitHubPull
  return {
    isDraft: pull.draft,
    merged: pull.merged,
    mergedAt: pull.merged_at,
    baseRef: pull.base.ref,
    headRef: pull.head.ref,
    requestedReviewers: pull.requested_reviewers.map(reviewer => reviewer.login),
  }
}

export async function downloadPullPatch(octokit: Octokit, owner: string, repo: string, number: number): Promise<string> {
  const result = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: number,
    mediaType: {
      format: 'patch',
    },
  })

  if (typeof result.data === 'string')
    return result.data

  throw new Error(`Unexpected patch response for pull #${number}`)
}

async function paginateIssues(context: SyncContext, state: 'open' | 'closed' | 'all', since: string | undefined): Promise<GitHubIssue[]> {
  return await context.octokit.paginate(context.octokit.rest.issues.listForRepo, {
    owner: context.owner,
    repo: context.repo,
    state,
    sort: 'updated',
    direction: 'asc',
    per_page: 100,
    since,
  }) as GitHubIssue[]
}

async function getIssuesByNumbers(octokit: Octokit, owner: string, repo: string, numbers: number[]): Promise<GitHubIssue[]> {
  const issues = await Promise.all(
    numbers.map(async (number) => {
      const result = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: number,
      })
      return result.data as GitHubIssue
    }),
  )

  return issues.sort((a, b) => a.number - b.number)
}
