# Changing the Default Branch to 'dev'

This document provides instructions for changing the default branch of the hostel-erp repository from its current branch to 'dev'.

## Why Change the Default Branch?

The default branch is the branch that:
- Is shown when someone visits your repository
- Is used as the base branch for new pull requests
- Is cloned by default when someone runs `git clone`
- Is checked out by default in new clones

## Methods to Change the Default Branch

### Method 1: Using GitHub Actions Workflow (Recommended - Easiest)

We've created a GitHub Actions workflow that automates this process with a single click.

1. Go to the Actions tab in your repository:
   - Navigate to https://github.com/PreethanSk/hostel-erp/actions
   
2. Select the "Set Dev as Default Branch" workflow from the left sidebar

3. Click "Run workflow" button (on the right side)

4. Confirm the target branch is "dev" and click "Run workflow"

5. Wait for the workflow to complete (should take less than a minute)

6. Verify the change was successful by checking the workflow logs

**Note**: This method requires that GitHub Actions are enabled for your repository and that the bot/user running the workflow has appropriate permissions.

### Method 2: Using GitHub Web Interface (Manual but Reliable)

1. Go to the repository settings:
   - Navigate to https://github.com/PreethanSk/hostel-erp
   - Click on "Settings" (you need admin access)

2. Access the Branches section:
   - In the left sidebar, click "Branches"

3. Change the default branch:
   - Under "Default branch", you'll see the current default branch
   - Click the switch/edit icon (⇄) next to the branch name
   - Select "dev" from the dropdown
   - Click "Update"
   - Confirm the change by clicking "I understand, update the default branch"

### Method 3: Using the Provided Scripts (For Automation)

We've included two scripts that can automate this process using the GitHub API.

#### Prerequisites:
- You need a GitHub Personal Access Token with `repo` scope
- To create a token:
  1. Go to https://github.com/settings/tokens
  2. Click "Generate new token" → "Generate new token (classic)"
  3. Give it a name (e.g., "Change default branch")
  4. Select the `repo` scope (full control of private repositories)
  5. Click "Generate token" and copy it

#### Using the Python Script:

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Run the Python script
python3 scripts/set-default-branch.py
```

#### Using the Bash Script:

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Make the script executable
chmod +x scripts/set-default-branch.sh

# Run the script
./scripts/set-default-branch.sh
```

### Method 4: Using GitHub CLI (gh)

If you have the GitHub CLI installed and authenticated:

```bash
gh repo edit PreethanSk/hostel-erp --default-branch dev
```

### Method 5: Using cURL Directly

```bash
curl -X PATCH \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/PreethanSk/hostel-erp \
  -d '{"default_branch":"dev"}'
```

## After Changing the Default Branch

Once you've changed the default branch:

1. **Update local repositories**: Team members should update their local repository's default remote branch:
   ```bash
   git fetch origin
   git remote set-head origin dev
   git checkout dev
   git pull origin dev
   ```

2. **Update CI/CD**: If you have CI/CD pipelines that reference the old default branch, update them to use 'dev'

3. **Update documentation**: Update any documentation that references the old default branch

4. **Branch protection rules**: Consider applying the same branch protection rules to 'dev' that were on the previous default branch

## Verification

To verify the default branch has been changed:

1. Visit https://github.com/PreethanSk/hostel-erp
2. The 'dev' branch should be shown as the default
3. Or run: `gh repo view PreethanSk/hostel-erp --json defaultBranchRef`

## Troubleshooting

### "Permission denied" or "Not Found" errors
- Make sure you have admin access to the repository
- Verify your GitHub token has the `repo` scope
- Check that the token hasn't expired

### "Branch does not exist" error
- Ensure the 'dev' branch exists in the repository
- Push the 'dev' branch if it only exists locally:
  ```bash
  git push origin dev
  ```

## Important Notes

- ⚠️ **You need admin/owner access** to the repository to change the default branch
- ⚠️ **This does not delete the old default branch** - it only changes which branch is considered "default"
- ⚠️ **Protected branches**: If the current default branch has protection rules, consider applying similar rules to 'dev'
