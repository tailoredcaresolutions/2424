# GitHub Actions Workflows

## Overview

This repository uses GitHub Actions to automate various development and maintenance tasks. All workflows are designed to enhance productivity while maintaining security and quality standards.

---

## 🤖 Automation Workflows

### 1. Auto-Approve PRs (`auto-approve.yml`)

**Purpose:** Automatically approve pull requests from trusted sources.

**Triggers:**
- Pull request opened, reopened, synchronized, or ready for review

**What it does:**
- Auto-approves Dependabot PRs for minor/patch updates
- Auto-approves security fixes
- Auto-approves PRs from trusted bots (github-actions, renovate)
- Adds appropriate labels
- Posts approval comment

**Conditions for auto-approval:**
- PR author is a trusted bot
- For Dependabot: Only minor/patch version updates (not major)
- For security fixes: Any update that fixes vulnerabilities
- All security checks must pass

**Labels added:**
- `automated` - Marks PR as automated
- `dependencies` - For dependency updates
- `security` - For security fixes
- `auto-merge` - For safe updates eligible for auto-merge

**Security:**
- Major version updates require manual review
- Only trusted bot accounts are approved automatically
- Security vulnerabilities are flagged and prioritized

---

### 2. Auto-Merge PRs (`auto-merge.yml`)

**Purpose:** Automatically merge pull requests when all conditions are met.

**Triggers:**
- Pull request labeled/unlabeled
- Pull request synchronized or reopened
- Pull request review submitted
- Check suite completed

**What it does:**
- Checks if PR has `auto-merge` label
- Verifies all checks are passing
- Confirms PR is approved
- Checks for merge conflicts
- Enables auto-merge or merges directly
- Posts status comments

**Conditions for auto-merge:**
- ✅ PR has `auto-merge` label
- ✅ All CI checks passing
- ✅ At least one approval
- ✅ No changes requested
- ✅ No merge conflicts
- ✅ PR is not a draft

**Merge strategy:** Squash and merge (creates clean history)

**Safety features:**
- Waits 10 seconds to ensure all checks complete
- Only merges when explicitly labeled
- Respects branch protection rules

---

### 3. Auto-Label PRs (`auto-label.yml`)

**Purpose:** Automatically categorize pull requests based on content.

**Triggers:**
- Pull request opened, reopened, or synchronized

**What it does:**
- Analyzes changed files
- Parses PR title (conventional commits)
- Examines PR description
- Applies relevant labels
- Posts comment explaining labels

**Label categories:**

**By file type:**
- `documentation` - Markdown, docs folder
- `tests` - Test files, test directories
- `frontend` - App, components, styles
- `backend` - Server, API files
- `configuration` - Config files, JSON, YAML
- `dependencies` - package.json, lock files
- `ci-cd` - GitHub workflows, actions
- `database` - SQL, migrations, database files
- `security` - Auth, encryption, security files
- `ui-ux` - Styles, themes, public assets

**By commit type (Conventional Commits):**
- `bug` - fix: prefix
- `enhancement` - feat: prefix
- `documentation` - docs: prefix
- `tests` - test: prefix
- `chore` - chore: prefix
- `performance` - perf: prefix
- `refactor` - refactor: prefix
- `breaking-change` - Major changes

**By size:**
- `size/xs` - < 10 lines changed
- `size/s` - < 50 lines changed
- `size/m` - < 200 lines changed
- `size/l` - < 500 lines changed
- `size/xl` - ≥ 500 lines changed

**Special labels:**
- `compliance` - PHIPA, healthcare-related
- `accessibility` - WCAG, a11y improvements

---

### 4. Branch Cleanup (`cleanup-branches.yml`)

**Purpose:** Automatically delete all branches (except `main`) when a pull request is merged.

**Triggers:**
- Pull request closed (only if merged)

**What it does:**
1. Fetches all branches from repository
2. Identifies remote branches (excluding `main`)
3. Deletes all other branches
4. Reports results

**Protected branch:**
- `main` is always preserved

**Usage:**
- Runs automatically on PR merge
- No manual intervention required
- Keeps repository clean

**Troubleshooting:**
- Check `contents: write` permission
- Verify branches aren't protected in settings
- Review workflow logs in Actions tab

---

### 5. Dependabot Updates (`dependabot.yml`)

**Purpose:** Automatically check for and create PRs for dependency updates.

**Schedule:** Weekly on Mondays at 9:00 AM (America/Toronto)

**What it monitors:**
- NPM dependencies (frontend)
- NPM dependencies (backend)
- GitHub Actions versions

**Update strategy:**
- Groups minor/patch updates together
- Separates major version updates
- Prioritizes security updates
- Limits open PRs (10 frontend, 5 backend, 5 actions)

**Labels applied:**
- `dependencies`
- `automated`
- `backend` (for backend updates)
- `github-actions` (for action updates)

**Ignore rules:**
- Major version updates require manual review
- Allows all other dependency types

**Reviewers/Assignees:**
- `tailoredcaresolutions/maintainers` team

---

## 🔒 Security Considerations

### Trusted Sources
Only these accounts can trigger auto-approval:
- `dependabot[bot]`
- `github-actions[bot]`
- `renovate[bot]`

### Review Requirements
- Major version updates: Always require manual review
- Breaking changes: Always require manual review
- Security fixes: Auto-approved but checks still required
- Code changes: Require manual approval

### Permissions
All workflows use minimal required permissions:
- `auto-approve.yml`: `pull-requests: write`, `contents: read`
- `auto-merge.yml`: `contents: write`, `pull-requests: write`, `checks: read`
- `auto-label.yml`: `pull-requests: write`, `contents: read`
- `cleanup-branches.yml`: `contents: write`

---

## 📋 Usage Guide

### For Contributors

**To enable auto-merge on your PR:**
1. Ensure all tests pass
2. Get at least one approval
3. Add the `auto-merge` label
4. Workflow will merge automatically when ready

**To skip auto-approval:**
- Don't use trusted bot accounts
- For manual review, remove `auto-merge` label

**PR Title Format (for auto-labeling):**
Use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: Add new feature` → `enhancement`
- `fix: Resolve bug` → `bug`
- `docs: Update README` → `documentation`
- `test: Add unit tests` → `tests`
- `chore: Update dependencies` → `chore`
- `perf: Optimize performance` → `performance`
- `refactor: Restructure code` → `refactor`
- `ci: Update workflow` → `ci-cd`
- `style: Improve UI` → `ui-ux`

### For Maintainers

**Configure Dependabot:**
- Edit `.github/dependabot.yml`
- Adjust schedules, limits, ignore rules
- Add/remove package ecosystems

**Modify Auto-Approval Rules:**
- Edit `.github/workflows/auto-approve.yml`
- Update `TRUSTED_BOTS` list
- Adjust version check logic
- Change approval criteria

**Modify Auto-Merge Rules:**
- Edit `.github/workflows/auto-merge.yml`
- Change merge strategy (squash, merge, rebase)
- Adjust eligibility criteria
- Update check requirements

**Customize Auto-Labels:**
- Edit `.github/workflows/auto-label.yml`
- Add new file patterns
- Update label mappings
- Adjust size thresholds

---

## 🧪 Testing Workflows

### Test Auto-Approval
1. Create a branch from Dependabot PR
2. Push changes to trigger workflow
3. Check Actions tab for approval
4. Verify label is added

### Test Auto-Merge
1. Create a test PR
2. Add `auto-merge` label
3. Get approval
4. Watch it merge automatically

### Test Auto-Label
1. Create PR with different file types
2. Check labels applied
3. Verify size label accuracy

### Test Branch Cleanup
1. Create test branch
2. Make small change
3. Create and merge PR to `main`
4. Verify branch deleted

---

## 🐛 Troubleshooting

### Auto-Approval Not Working
- Check if author is in `TRUSTED_BOTS` list
- Verify PR is for minor/patch update (not major)
- Review workflow logs for errors
- Check repository permissions

### Auto-Merge Not Triggering
- Verify `auto-merge` label is present
- Check if all checks are passing
- Ensure PR has approval
- Verify no merge conflicts
- Check if PR is draft

### Labels Not Applied
- Check workflow permissions
- Verify PR files are being detected
- Review workflow logs
- Ensure jq is available (for summary)

### Branches Not Deleted
- Check `contents: write` permission
- Verify branches aren't protected
- Review cleanup workflow logs
- Check if PR was actually merged

---

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Dependabot Configuration](https://docs.github.com/en/code-security/dependabot)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

## 🔄 Maintenance

**Weekly:**
- Review auto-merged PRs
- Check for failed workflows
- Monitor Dependabot updates

**Monthly:**
- Review automation effectiveness
- Update trusted bot list if needed
- Adjust label mappings
- Review security updates

**Quarterly:**
- Audit workflow permissions
- Update GitHub Actions versions
- Review and optimize workflows
- Update documentation

---

**Last Updated:** 2025-10-31
