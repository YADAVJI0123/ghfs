# ghfs

GitHub issues/PRs as filesystem, for offline view and operations in batch. Designed for human and agents.

> [!IMPORTANT]
> Still working in progress, not usable yet.

```bash
pnpm install @ghfs/cli
```

and then run the command inside a repository directory:

```bash
ghfs
```

It will sync the open issues and pull requests to the local filesystem under `.ghfs` directory, like:

```txt
.ghfs/
  issues/
    <number>.md
  pulls/
    <number>.md
    <number>.patch
```

Where you can view them, or ask your local agent to summarize them for you.

## Execute operations

`ghfs` also allows you to take actions on the issues and pull requests in batch.

Create a `.ghfs/execute.yml` file with the following content:

```yaml
# close the issue #123
- action: close
  number: 123

# change the title of the issue #125 to "New title"
- action: set-title
  number: 125
  title: New title

# add the labels "bug" and "feature" to the issue #125
- action: add-labels
  number: 125
  labels: [bug, feature]
```

Then run

```bash
ghfs execute
```

to execute the operations in batch.

> TODO: directly editing the `<number>.md` file to apply the operations will be rolled out in the future.

## Configuration

You can configure by creating a `ghfs.config.ts` file in the root of the repository.

```ts
import type { GhfsUserConfig } from '@ghfs/cli'

export default defineConfig({
  repo: 'owner/name',
  // other options...
})
```

## TODOs

- [ ] `execute.md` file with human-friendly instructions (`close #123 #234`, `set-title #125 "New title"`).
- [ ] Directly editing the `<number>.md` file to apply the operations.
- [ ] Add a VS Code extension for guided sync/execute.
- [ ] Documentation.
- [ ] Agent Skills.
