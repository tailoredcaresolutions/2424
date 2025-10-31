# Repository Automation Guide

**Automated PR Approval, Merging, and Management**

This repository uses GitHub Actions to automate pull request workflows, dependency updates, and branch management. This guide explains how the automation works and how to use it effectively.

---

## 🎯 Overview

The automation system consists of:

1. **Dependabot** - Automatic dependency updates
2. **Auto-Approve** - Automatic PR approvals for trusted sources
3. **Auto-Merge** - Automatic PR merging when conditions are met
4. **Auto-Label** - Automatic PR categorization
5. **Branch Cleanup** - Automatic branch deletion after merge

---

## 🚀 Quick Start

### For a Typical Development Workflow

1. **Create your PR** with a conventional commit title:
   ```
   feat: Add user authentication
   fix: Resolve login bug
   docs: Update API documentation
   ```

2. **Labels are applied automatically** based on files changed

3. **Request review** from maintainers

4. **Once approved**, add the `auto-merge` label to merge automatically

5. **After merge**, all branches except `main` are automatically deleted

### For Dependabot PRs

1. **Dependabot creates PR** for dependency updates (weekly)
2. **Auto-approval** triggers for minor/patch updates
3. **Add `auto-merge` label** if you want automatic merging
4. **Checks pass** → PR merges automatically
5. **Branch cleanup** happens automatically

---

## 📋 Detailed Workflow Descriptions

### 1. Dependabot Configuration

**File:** `.github/dependabot.yml`

**What it does:**
- Checks for dependency updates weekly (Monday 9 AM Toronto time)
- Creates PRs for npm dependencies (frontend and backend)
- Updates GitHub Actions versions
- Groups minor/patch updates together
- Separates major updates for manual review

**Configuration:**
```yaml
Schedule: Weekly (Mondays at 9:00 AM Toronto time)
Max PRs: 10 (frontend), 5 (backend), 5 (actions)
Update Types: All (but major versions flagged for review)
Labels: dependencies, automated
```

**Ignore Rules:**
- Major version updates require manual approval
- All other updates are automated

---

### 2. Auto-Approve Workflow

**File:** `.github/workflows/auto-approve.yml`

**When it runs:**
- PR opened, reopened, synchronized, or ready for review

**What it approves:**
- ✅ Dependabot PRs (minor/patch versions only)
- ✅ Security fixes (all versions)
- ✅ GitHub Actions bot PRs
- ✅ Renovate bot PRs

**What it DOESN'T approve:**
- ❌ Major version updates
- ❌ Manual code changes
- ❌ PRs from unknown authors

**Labels added:**
- `automated` - Marks as automated PR
- `dependencies` - For dependency updates
- `security` - For security fixes
- `auto-merge` - For safe updates

**Security checks:**
- Verifies author is trusted bot
- Checks version increment type
- Scans for security vulnerabilities
- Only approves if conditions met

---

### 3. Auto-Merge Workflow

**File:** `.github/workflows/auto-merge.yml`

**When it runs:**
- PR labeled/unlabeled
- PR synchronized/reopened
- PR review submitted
- Check suite completed

**Conditions for auto-merge:**
1. ✅ PR has `auto-merge` label
2. ✅ All CI checks passing
3. ✅ At least one approval
4. ✅ No changes requested
5. ✅ No merge conflicts
6. ✅ PR is not a draft

**Merge strategy:** Squash and merge (clean commit history)

**Safety features:**
- 10-second wait to ensure checks complete
- Only triggers with explicit label
- Respects branch protection rules
- Posts status comments

**How to use:**
1. Get your PR approved
2. Ensure all checks pass
3. Add `auto-merge` label
4. Workflow handles the rest

---

### 4. Auto-Label Workflow

**File:** `.github/workflows/auto-label.yml`

**When it runs:**
- PR opened, reopened, or synchronized

**Labels by file type:**

| Pattern | Label |
|---------|-------|
| `*.md`, `docs/` | `documentation` |
| `*.test.js`, `tests/` | `tests` |
| `app/`, `components/` | `frontend` |
| `backend/`, `server/` | `backend` |
| `.github/workflows/` | `ci-cd` |
| `package.json` | `dependencies` |
| `auth/`, `security/` | `security` |
| `styles/`, `public/` | `ui-ux` |

**Labels by commit type:**

| Prefix | Label |
|--------|-------|
| `feat:` | `enhancement` |
| `fix:` | `bug` |
| `docs:` | `documentation` |
| `test:` | `tests` |
| `chore:` | `chore` |
| `perf:` | `performance` |
| `refactor:` | `refactor` |
| `ci:` | `ci-cd` |

**Labels by size:**

| Lines Changed | Label |
|--------------|-------|
| < 10 | `size/xs` |
| < 50 | `size/s` |
| < 200 | `size/m` |
| < 500 | `size/l` |
| ≥ 500 | `size/xl` |

---

### 5. Branch Cleanup Workflow

**File:** `.github/workflows/cleanup-branches.yml`

**When it runs:**
- After a PR is merged to `main`

**What it does:**
1. Fetches all branches
2. Identifies branches (excludes `main`)
3. Deletes all other branches
4. Reports results

**Protected:**
- `main` branch is never deleted

**Use case:**
- Keeps repository clean
- Prevents branch clutter
- Automatic maintenance

---

## 🔒 Security & Trust

### Trusted Bot Accounts

Only these accounts trigger auto-approval:
```
dependabot[bot]
github-actions[bot]
renovate[bot]
```

### Review Requirements

| Change Type | Auto-Approve | Auto-Merge | Manual Review |
|-------------|--------------|------------|---------------|
| Dependency patch | ✅ | ✅ (with label) | Optional |
| Dependency minor | ✅ | ✅ (with label) | Optional |
| Dependency major | ❌ | ❌ | Required |
| Security fix | ✅ | ✅ (with label) | Recommended |
| Code changes | ❌ | ✅ (when approved) | Required |
| Breaking changes | ❌ | ❌ | Required |

### Permission Model

| Workflow | Permissions |
|----------|-------------|
| Auto-Approve | `pull-requests: write`, `contents: read` |
| Auto-Merge | `contents: write`, `pull-requests: write`, `checks: read` |
| Auto-Label | `pull-requests: write`, `contents: read` |
| Cleanup | `contents: write` |

**Principle:** Minimal permissions for each task

---

## 🎯 Best Practices

### For Contributors

**DO:**
- ✅ Use conventional commit prefixes (`feat:`, `fix:`, etc.)
- ✅ Add `auto-merge` label when you want automatic merging
- ✅ Ensure all tests pass before requesting merge
- ✅ Keep PRs focused and small
- ✅ Review auto-applied labels

**DON'T:**
- ❌ Force-push after approval (requires re-review)
- ❌ Add `auto-merge` label to draft PRs
- ❌ Mix unrelated changes in one PR
- ❌ Bypass required checks

### For Maintainers

**DO:**
- ✅ Review Dependabot major updates manually
- ✅ Monitor auto-merged PRs weekly
- ✅ Update trusted bot list as needed
- ✅ Audit automation effectiveness monthly
- ✅ Keep workflows up to date

**DON'T:**
- ❌ Auto-merge breaking changes
- ❌ Skip security review for security updates
- ❌ Ignore failed auto-merge attempts
- ❌ Disable workflows without documentation

---

## 🛠️ Configuration

### Enable/Disable Auto-Merge for a PR

**Enable:**
```bash
# Via GitHub CLI
gh pr edit <PR_NUMBER> --add-label "auto-merge"

# Via Web UI
Add "auto-merge" label to PR
```

**Disable:**
```bash
# Via GitHub CLI
gh pr edit <PR_NUMBER> --remove-label "auto-merge"

# Via Web UI
Remove "auto-merge" label from PR
```

### Adjust Dependabot Schedule

Edit `.github/dependabot.yml`:
```yaml
schedule:
  interval: "weekly"    # or "daily", "monthly"
  day: "monday"         # day of week
  time: "09:00"        # time of day
  timezone: "America/Toronto"
```

### Modify Trusted Bots

Edit `.github/workflows/auto-approve.yml`:
```yaml
TRUSTED_BOTS="dependabot[bot] github-actions[bot] renovate[bot] your-bot[bot]"
```

### Change Merge Strategy

Edit `.github/workflows/auto-merge.yml`:
```javascript
mergeMethod: 'SQUASH'  // or 'MERGE', 'REBASE'
```

---

## 🐛 Troubleshooting

### Auto-Approval Not Working

**Symptoms:**
- Dependabot PR not approved
- Workflow runs but doesn't approve

**Solutions:**
1. Check if PR is from trusted bot
2. Verify it's minor/patch update (not major)
3. Review workflow logs in Actions tab
4. Check repository permissions
5. Ensure workflow file syntax is correct

**Debug steps:**
```bash
# Check workflow logs
gh run list --workflow=auto-approve.yml
gh run view <RUN_ID> --log

# Check PR labels
gh pr view <PR_NUMBER> --json labels
```

---

### Auto-Merge Not Triggering

**Symptoms:**
- PR has `auto-merge` label but doesn't merge
- Workflow runs but merge doesn't happen

**Solutions:**
1. Verify `auto-merge` label is present
2. Check all CI checks are passing
3. Ensure PR has at least one approval
4. Verify no merge conflicts exist
5. Confirm PR is not a draft

**Debug steps:**
```bash
# Check PR status
gh pr view <PR_NUMBER>

# Check checks status
gh pr checks <PR_NUMBER>

# View merge status
gh pr view <PR_NUMBER> --json mergeable,mergeStateStatus
```

---

### Labels Not Applied

**Symptoms:**
- PR opened but no labels added
- Workflow runs but labels missing

**Solutions:**
1. Check workflow permissions
2. Verify file patterns in workflow
3. Review workflow logs
4. Ensure PR has file changes

**Debug steps:**
```bash
# Check workflow execution
gh run list --workflow=auto-label.yml

# View PR files
gh pr view <PR_NUMBER> --json files

# Check labels
gh pr view <PR_NUMBER> --json labels
```

---

### Branches Not Deleted

**Symptoms:**
- PR merged but branches remain
- Cleanup workflow doesn't run

**Solutions:**
1. Check if PR was merged (not just closed)
2. Verify `contents: write` permission
3. Check if branches are protected
4. Review cleanup workflow logs

**Debug steps:**
```bash
# List branches
gh repo view --json defaultBranchRef,refs

# Check workflow logs
gh run list --workflow=cleanup-branches.yml
```

---

## 📊 Monitoring & Reporting

### View Automation Activity

**GitHub Web UI:**
1. Go to repository
2. Click "Actions" tab
3. Filter by workflow name
4. Review run history and logs

**GitHub CLI:**
```bash
# List recent workflow runs
gh run list --limit 20

# View specific workflow
gh run view <RUN_ID> --log

# Check PR status
gh pr status

# View all open PRs
gh pr list --state open
```

### Weekly Review Checklist

- [ ] Review auto-merged PRs (check for issues)
- [ ] Check failed workflow runs
- [ ] Review Dependabot updates
- [ ] Audit new labels created
- [ ] Check branch cleanup effectiveness
- [ ] Review security updates

### Monthly Audit Checklist

- [ ] Review automation effectiveness
- [ ] Update trusted bot list if needed
- [ ] Adjust label mappings
- [ ] Update dependency ignore rules
- [ ] Review and optimize workflows
- [ ] Update documentation

---

## 📚 Additional Resources

### GitHub Documentation
- [GitHub Actions](https://docs.github.com/en/actions)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)
- [Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Auto-merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request)

### Conventional Commits
- [Specification](https://www.conventionalcommits.org/)
- [Examples](https://www.conventionalcommits.org/en/v1.0.0/#examples)

### Workflow Files
- `.github/dependabot.yml` - Dependency updates
- `.github/workflows/auto-approve.yml` - PR auto-approval
- `.github/workflows/auto-merge.yml` - PR auto-merge
- `.github/workflows/auto-label.yml` - PR auto-labeling
- `.github/workflows/cleanup-branches.yml` - Branch cleanup
- `.github/workflows/README.md` - Workflow documentation

---

## 🔄 Maintenance Schedule

### Daily
- Monitor auto-merge activity
- Check for failed workflows

### Weekly
- Review auto-merged PRs
- Audit Dependabot updates
- Check for security alerts

### Monthly
- Review automation effectiveness
- Update workflows if needed
- Audit permissions
- Update documentation

### Quarterly
- Major workflow review
- Update GitHub Actions versions
- Review security best practices
- Performance optimization

---

**Questions?** Open an issue or contact the maintainers team.

**Last Updated:** 2025-10-31
