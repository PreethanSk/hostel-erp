#!/usr/bin/env python3
"""
Script to set the default branch to 'dev' for the hostel-erp repository.
This script uses the GitHub API to change the default branch.

Requirements:
    - requests library (install with: pip install requests)
"""

import os
import sys

try:
    import requests
except ImportError:
    print("❌ Error: 'requests' library is not installed")
    print("\nPlease install it using:")
    print(f"  {sys.executable} -m pip install requests")
    print("\nOr add it to your requirements.txt file")
    sys.exit(1)

REPO_OWNER = "PreethanSk"
REPO_NAME = "hostel-erp"
NEW_DEFAULT_BRANCH = "dev"

def set_default_branch():
    """Set the default branch using GitHub API."""
    
    # Check if GITHUB_TOKEN is set
    github_token = os.environ.get('GITHUB_TOKEN')
    if not github_token:
        print("❌ Error: GITHUB_TOKEN environment variable is not set")
        print("\nPlease set it using: export GITHUB_TOKEN=your_token_here")
        print("\nTo create a token:")
        print("1. Go to: https://github.com/settings/tokens")
        print("2. Click 'Generate new token' → 'Generate new token (classic)'")
        print("3. Give it a name and select 'repo' scope")
        print("4. Generate and copy the token")
        return False
    
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    # Check if the branch exists
    print(f"Checking if '{NEW_DEFAULT_BRANCH}' branch exists...")
    branch_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/branches/{NEW_DEFAULT_BRANCH}"
    
    try:
        branch_response = requests.get(branch_url, headers=headers)
        if branch_response.status_code == 404:
            print(f"❌ Error: Branch '{NEW_DEFAULT_BRANCH}' does not exist in the repository")
            return False
        elif branch_response.status_code != 200:
            print(f"❌ Error checking branch: {branch_response.status_code}")
            print(f"Response: {branch_response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    print(f"✓ Branch '{NEW_DEFAULT_BRANCH}' exists")
    
    # Update the default branch
    print(f"\nSetting '{NEW_DEFAULT_BRANCH}' as the default branch...")
    repo_url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}"
    data = {"default_branch": NEW_DEFAULT_BRANCH}
    
    try:
        response = requests.patch(repo_url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('default_branch') == NEW_DEFAULT_BRANCH:
                print(f"✅ Success! The default branch has been changed to '{NEW_DEFAULT_BRANCH}'")
                print(f"\nYou can verify this at:")
                print(f"https://github.com/{REPO_OWNER}/{REPO_NAME}/settings/branches")
                return True
            else:
                print("❌ Unexpected response - default branch might not have been changed")
                print(f"Current default branch: {result.get('default_branch')}")
                return False
        else:
            print(f"❌ Failed to update default branch. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    print(f"{'='*60}")
    print(f"GitHub Default Branch Updater")
    print(f"{'='*60}")
    print(f"Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"New default branch: {NEW_DEFAULT_BRANCH}")
    print(f"{'='*60}\n")
    
    success = set_default_branch()
    sys.exit(0 if success else 1)
