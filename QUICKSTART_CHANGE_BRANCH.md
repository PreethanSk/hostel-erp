# How to Set 'dev' as the Default Branch

## Current Status
- **Current default branch**: old-code
- **Target default branch**: dev
- **Branch 'dev' exists**: ✅ Yes

## Quick Start (Easiest Method)

### Option 1: Use GitHub Actions Workflow (Recommended)

1. Go to your repository's Actions tab:
   https://github.com/PreethanSk/hostel-erp/actions

2. Click on "Set Dev as Default Branch" in the left sidebar

3. Click the "Run workflow" button

4. Confirm target branch is "dev" and click "Run workflow"

5. Wait ~1 minute for completion

That's it! The workflow will automatically change the default branch to 'dev'.

### Option 2: Use GitHub Web Interface

1. Go to: https://github.com/PreethanSk/hostel-erp/settings/branches

2. Under "Default branch", click the switch icon (⇄)

3. Select "dev" from dropdown

4. Click "Update" and confirm

## What Was Created

This PR includes:

### 📁 Files Added:

1. **`.github/workflows/set-default-branch.yml`**
   - GitHub Actions workflow for one-click default branch change
   - Can be triggered manually from the Actions tab
   - Automatically verifies branch exists before making changes

2. **`scripts/set-default-branch.py`**
   - Python script for automation using GitHub API
   - Requires GITHUB_TOKEN environment variable
   - Includes error checking and helpful messages

3. **`scripts/set-default-branch.sh`**
   - Bash script alternative to Python script
   - Same functionality as Python version
   - Requires GITHUB_TOKEN environment variable

4. **`docs/CHANGE_DEFAULT_BRANCH.md`**
   - Comprehensive documentation
   - Multiple methods to change default branch
   - Troubleshooting guide
   - Post-change instructions for team

5. **`scripts/README.md`**
   - Quick reference for using the scripts
   - Usage examples

### 📝 Files Modified:

1. **`README.md`**
   - Added link to change default branch documentation

## After Changing the Default Branch

Once you've successfully changed the default branch to 'dev', inform your team members to update their local repositories:

```bash
git fetch origin
git remote set-head origin dev
git checkout dev
git pull origin dev
```

## Need Help?

See the full documentation at: `docs/CHANGE_DEFAULT_BRANCH.md`

This document includes:
- Detailed instructions for all methods
- Prerequisites and requirements
- Troubleshooting guide
- Next steps for team coordination
