# Repository Management Scripts

This directory contains scripts for managing the hostel-erp repository.

## set-default-branch.sh / set-default-branch.py

These scripts automate the process of changing the repository's default branch to 'dev'.

### Usage

#### Using Python (Recommended):
```bash
export GITHUB_TOKEN=your_token_here
python3 scripts/set-default-branch.py
```

#### Using Bash:
```bash
export GITHUB_TOKEN=your_token_here
chmod +x scripts/set-default-branch.sh
./scripts/set-default-branch.sh
```

### Requirements

- A GitHub Personal Access Token with `repo` scope
- Admin access to the repository
- The target branch ('dev') must exist in the repository

For detailed instructions, see [../docs/CHANGE_DEFAULT_BRANCH.md](../docs/CHANGE_DEFAULT_BRANCH.md)
