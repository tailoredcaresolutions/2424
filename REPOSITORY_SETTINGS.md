# GitHub Repository Settings Configuration

This document outlines the required repository settings to enable the automation workflows.

---

## 🔧 Required Repository Settings

### 1. General Settings

**Navigate to:** Settings → General

**Actions Permissions:**
- ✅ Enable "Allow all actions and reusable workflows"
- ✅ Enable "Allow GitHub Actions to create and approve pull requests"

**Workflow Permissions:**
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create and approve pull requests

### 2. Branch Protection Rules

**Navigate to:** Settings → Branches → Add branch protection rule

**Branch name pattern:** `main`

**Required settings:**
- ✅ Require a pull request before merging
- ✅ Require approvals: 1
- ☐ Dismiss stale pull request approvals when new commits are pushed (optional)
- ✅ Require status checks to pass before merging
  - Add required checks:
    - `auto-approve` (optional)
    - Any CI/CD checks you have
- ☐ Require conversation resolution before merging (optional)
- ✅ Include administrators (recommended)
- ✅ Allow force pushes: No
- ✅ Allow deletions: No

**Optional but recommended:**
- ☐ Require linear history (for cleaner history)
- ☐ Require deployments to succeed before merging
- ☐ Lock branch (for production branches)

### 3. Merge Button Settings

**Navigate to:** Settings → General → Pull Requests

**Allow merge commits:**
- ☐ Disabled (we use squash merge)

**Allow squash merging:**
- ✅ Enabled
- Select: "Default to pull request title"

**Allow rebase merging:**
- ☐ Disabled (optional)

**Automatically delete head branches:**
- ✅ Enabled (our cleanup workflow handles this too)

**Allow auto-merge:**
- ✅ Enabled (required for auto-merge workflow)

### 4. Dependabot Settings

**Navigate to:** Settings → Code security and analysis

**Dependabot alerts:**
- ✅ Enabled

**Dependabot security updates:**
- ✅ Enabled

**Dependabot version updates:**
- ✅ Enabled (configured via `.github/dependabot.yml`)

**Grouped security updates:**
- ✅ Enabled (optional, groups related security updates)

### 5. Actions Settings

**Navigate to:** Settings → Actions → General

**Actions permissions:**
- ✅ Allow all actions and reusable workflows

**Workflow permissions:**
- Select: "Read and write permissions"
- ✅ Check: "Allow GitHub Actions to create and approve pull requests"

**Fork pull request workflows:**
- Select: "Require approval for first-time contributors" (recommended)

### 6. Secrets and Variables

**Navigate to:** Settings → Secrets and variables → Actions

**Repository secrets:**
- `GITHUB_TOKEN` is automatically available (no need to add)

**Repository variables:**
- None required for basic automation

### 7. Labels

**Navigate to:** Issues → Labels

**Required labels** (auto-label workflow will use these):

Create these labels if they don't exist:

**Type Labels:**
- `bug` - #d73a4a - Something isn't working
- `enhancement` - #a2eeef - New feature or request
- `documentation` - #0075ca - Documentation improvements
- `tests` - #17e672 - Testing improvements
- `chore` - #fef2c0 - Maintenance tasks
- `performance` - #ff9800 - Performance improvements
- `refactor` - #9c27b0 - Code refactoring
- `breaking-change` - #d93f0b - Breaking changes

**Category Labels:**
- `dependencies` - #0366d6 - Dependency updates
- `frontend` - #1d76db - Frontend changes
- `backend` - #0e8a16 - Backend changes
- `ci-cd` - #34495e - CI/CD changes
- `configuration` - #b60205 - Configuration changes
- `database` - #5319e7 - Database changes
- `security` - #b60205 - Security-related
- `ui-ux` - #ffd86e - UI/UX improvements
- `compliance` - #c5def5 - Compliance-related
- `accessibility` - #7057ff - Accessibility improvements

**Size Labels:**
- `size/xs` - #c2e0c6 - Extra small changes
- `size/s` - #84b6eb - Small changes
- `size/m` - #fbca04 - Medium changes
- `size/l` - #f9d0c4 - Large changes
- `size/xl` - #d73a4a - Extra large changes

**Automation Labels:**
- `automated` - #ededed - Automated PR
- `auto-merge` - #0e8a16 - Enable auto-merge

---

## 🚀 Quick Setup Script

If you prefer to create labels via CLI:

```bash
# Install GitHub CLI if not already installed
# brew install gh (macOS)
# Or download from: https://cli.github.com/

# Login to GitHub
gh auth login

# Create labels
gh label create "bug" --color d73a4a --description "Something isn't working"
gh label create "enhancement" --color a2eeef --description "New feature or request"
gh label create "documentation" --color 0075ca --description "Documentation improvements"
gh label create "tests" --color 17e672 --description "Testing improvements"
gh label create "chore" --color fef2c0 --description "Maintenance tasks"
gh label create "performance" --color ff9800 --description "Performance improvements"
gh label create "refactor" --color 9c27b0 --description "Code refactoring"
gh label create "breaking-change" --color d93f0b --description "Breaking changes"
gh label create "dependencies" --color 0366d6 --description "Dependency updates"
gh label create "frontend" --color 1d76db --description "Frontend changes"
gh label create "backend" --color 0e8a16 --description "Backend changes"
gh label create "ci-cd" --color 34495e --description "CI/CD changes"
gh label create "configuration" --color b60205 --description "Configuration changes"
gh label create "database" --color 5319e7 --description "Database changes"
gh label create "security" --color b60205 --description "Security-related"
gh label create "ui-ux" --color ffd86e --description "UI/UX improvements"
gh label create "compliance" --color c5def5 --description "Compliance-related"
gh label create "accessibility" --color 7057ff --description "Accessibility improvements"
gh label create "size/xs" --color c2e0c6 --description "Extra small changes"
gh label create "size/s" --color 84b6eb --description "Small changes"
gh label create "size/m" --color fbca04 --description "Medium changes"
gh label create "size/l" --color f9d0c4 --description "Large changes"
gh label create "size/xl" --color d73a4a --description "Extra large changes"
gh label create "automated" --color ededed --description "Automated PR"
gh label create "auto-merge" --color 0e8a16 --description "Enable auto-merge"
```

---

## ✅ Verification Checklist

After configuring settings, verify:

### Repository Settings
- [ ] Actions enabled with read/write permissions
- [ ] Auto-merge enabled for pull requests
- [ ] Automatically delete head branches enabled
- [ ] Squash merge enabled (others disabled)

### Branch Protection
- [ ] `main` branch protected
- [ ] Require PR before merging
- [ ] Require 1 approval
- [ ] Status checks required

### Dependabot
- [ ] Alerts enabled
- [ ] Security updates enabled
- [ ] Version updates enabled
- [ ] Configuration file committed (`.github/dependabot.yml`)

### Workflows
- [ ] All workflow files committed
- [ ] Workflows appear in Actions tab
- [ ] No syntax errors in workflows

### Labels
- [ ] All required labels created
- [ ] Labels have correct colors
- [ ] Labels have descriptions

---

## 🧪 Test the Automation

### Test Auto-Label
1. Create a test branch
2. Make a small change to a file
3. Create a PR with conventional commit title (e.g., `feat: test`)
4. Verify labels are applied automatically

### Test Auto-Approve (if you have Dependabot)
1. Wait for Dependabot to create a PR
2. Verify it's auto-approved if minor/patch
3. Check for `auto-merge` label

### Test Auto-Merge
1. Create a test PR
2. Get it approved
3. Add `auto-merge` label
4. Verify it merges when checks pass

### Test Branch Cleanup
1. Merge a PR to main
2. Verify branches are deleted automatically

---

## 🔍 Monitoring

**Check workflow status:**
- Navigate to: Actions tab
- View recent workflow runs
- Check for any failures

**Monitor Dependabot:**
- Navigate to: Insights → Dependency graph → Dependabot
- Review open PRs
- Check update schedule

**Review auto-merged PRs:**
- Navigate to: Pull requests → Closed
- Filter by: `label:auto-merge`
- Review merged PRs

---

## 🆘 Troubleshooting

### Workflows Not Running

**Check:**
1. Settings → Actions → Allow all actions
2. Workflow files in `.github/workflows/`
3. YAML syntax is valid
4. No errors in Actions tab

### Auto-Approve Not Working

**Check:**
1. PR author is a trusted bot
2. Version update is minor/patch (not major)
3. Workflow has `pull-requests: write` permission
4. Review workflow logs

### Auto-Merge Not Working

**Check:**
1. Auto-merge enabled in repository settings
2. PR has `auto-merge` label
3. All checks passing
4. PR has approval
5. No merge conflicts

### Labels Not Created

**Check:**
1. Labels exist in repository
2. Workflow has `pull-requests: write` permission
3. PR has file changes
4. Review workflow logs

---

## 📚 Additional Configuration (Optional)

### Team Reviewers

**Navigate to:** Settings → Manage access → Teams

**Add teams for auto-assignment:**
1. Create team (e.g., `maintainers`)
2. Assign team to repository
3. Update Dependabot config to assign team

### Notifications

**Navigate to:** Settings → Notifications

**Configure:**
- Email notifications for workflow failures
- Slack/Discord webhooks for PR activity
- Mobile app notifications

### Insights

**Navigate to:** Insights → Community

**Enable:**
- README
- Code of Conduct
- Contributing guidelines
- License
- Security policy

---

## 🔐 Security Best Practices

1. **Review auto-merged PRs weekly**
2. **Audit workflow permissions monthly**
3. **Keep workflows up to date**
4. **Monitor for security alerts**
5. **Review Dependabot PRs for major updates**
6. **Use branch protection rules**
7. **Enable required status checks**
8. **Limit who can approve PRs**

---

**Configuration Complete?** Test with a sample PR to ensure everything works!

**Questions?** Check `AUTOMATION_GUIDE.md` for detailed documentation.

**Last Updated:** 2025-10-31
