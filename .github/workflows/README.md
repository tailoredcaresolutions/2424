# Branch Cleanup Workflow

## Overview
This GitHub Actions workflow automatically deletes all branches (except `main`) when a pull request is merged to the main branch.

## How It Works

### Trigger
The workflow is triggered when a pull request to the `main` branch is closed. It only runs if the pull request was actually merged (not just closed without merging).

### Process
1. **Checkout**: Fetches all branches from the repository
2. **Configure Git**: Sets up git with GitHub Actions bot credentials
3. **Delete Branches**: 
   - Lists all remote branches
   - Filters out `main` branch
   - Deletes all other branches
   - Reports any failures (e.g., protected branches)
4. **Summary**: Creates a summary showing which branches were deleted and which remain

### Protected Branch
The `main` branch is always preserved and will never be deleted by this workflow.

### Permissions
The workflow requires `contents: write` permission to delete branches.

## Usage

This workflow runs automatically. No manual intervention is required.

### To trigger the cleanup:
1. Create a pull request to merge any branch into `main`
2. Merge the pull request
3. The workflow will automatically delete all other branches (except `main`)

## Branch Protection

If you want to keep certain branches, you can:
1. Add branch protection rules in GitHub repository settings
2. Modify the workflow to exclude specific branch patterns in the `grep` command

## Testing

To test this workflow:
1. Create a test branch
2. Make a small change and commit it
3. Create a pull request to `main`
4. Merge the pull request
5. Check the Actions tab to see the workflow run
6. Verify that branches were deleted (except `main`)

## Troubleshooting

If branches are not being deleted:
- Check that the workflow has `contents: write` permissions
- Verify that the branches are not protected in repository settings
- Review the workflow logs in the Actions tab
