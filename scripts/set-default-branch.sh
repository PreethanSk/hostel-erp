#!/bin/bash

# Script to set the default branch to 'dev' for the hostel-erp repository
# This script uses the GitHub API to change the default branch

REPO_OWNER="PreethanSk"
REPO_NAME="hostel-erp"
NEW_DEFAULT_BRANCH="dev"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable is not set"
    echo "Please set it using: export GITHUB_TOKEN=your_token_here"
    echo ""
    echo "To create a token, go to: https://github.com/settings/tokens"
    echo "Required permissions: 'repo' scope"
    exit 1
fi

echo "Checking if '$NEW_DEFAULT_BRANCH' branch exists..."

# Check if the branch exists
BRANCH_CHECK=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/$NEW_DEFAULT_BRANCH")

if echo "$BRANCH_CHECK" | grep -q '"message": "Not Found"'; then
    echo "Error: Branch '$NEW_DEFAULT_BRANCH' does not exist in the repository"
    exit 1
fi

echo "Branch '$NEW_DEFAULT_BRANCH' exists. Proceeding to set it as default..."

# Update the default branch
RESPONSE=$(curl -s -X PATCH \
    -H "Authorization: Bearer $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME" \
    -d "{\"default_branch\":\"$NEW_DEFAULT_BRANCH\"}")

# Check if the update was successful
if echo "$RESPONSE" | grep -q '"default_branch": "'$NEW_DEFAULT_BRANCH'"'; then
    echo "✅ Success! The default branch has been changed to '$NEW_DEFAULT_BRANCH'"
    echo ""
    echo "You can verify this at: https://github.com/$REPO_OWNER/$REPO_NAME/settings/branches"
else
    echo "❌ Failed to update the default branch"
    echo "Response: $RESPONSE"
    exit 1
fi
