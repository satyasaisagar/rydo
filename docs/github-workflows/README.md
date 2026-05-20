# GitHub Actions Workflows

These workflow files need to be moved to `.github/workflows/` to activate CI/CD.

Your token didn't have the `workflow` scope needed to push them directly.

## Setup Instructions

```bash
mkdir -p .github/workflows
cp docs/github-workflows/ci-cd.yml    .github/workflows/
cp docs/github-workflows/pr-checks.yml .github/workflows/
git add .github/workflows/
git commit -m "ci: activate GitHub Actions workflows"
git push
```

Or regenerate your token at https://github.com/settings/tokens
with the **workflow** scope checked, then run:
```bash
git push origin main
```
