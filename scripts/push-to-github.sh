#!/bin/bash
# ─────────────────────────────────────────────────────────
# Push Rydo to GitHub
# Usage: ./scripts/push-to-github.sh <github-username> [repo-name]
# ─────────────────────────────────────────────────────────
set -euo pipefail

USERNAME=${1:-""}
REPO=${2:-"rydo"}

if [ -z "$USERNAME" ]; then
  echo "Usage: ./scripts/push-to-github.sh <github-username> [repo-name]"
  echo "Example: ./scripts/push-to-github.sh johndoe rydo"
  exit 1
fi

REMOTE="https://github.com/${USERNAME}/${REPO}.git"
echo "🚀 Pushing to: ${REMOTE}"

git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"
git branch -M main
git push -u origin main

echo ""
echo "✅ Rydo pushed to GitHub!"
echo "   https://github.com/${USERNAME}/${REPO}"
