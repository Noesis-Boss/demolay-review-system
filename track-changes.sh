#!/bin/bash
# Track changes from Zo Space routes to GitHub

set -e

echo "📦 Tracking DeMolay Review System changes..."

# Copy latest routes from space
mkdir -p api pages
cp /__substrate/space/routes/api/* api/ 2>/dev/null || true
cp /__substrate/space/routes/pages/* pages/ 2>/dev/null || true

# Check for changes
if git diff --quiet && git diff --staged --quiet; then
    echo "✅ No changes to track"
    exit 0
fi

# Add all changes
git add -A

# Commit with timestamp
COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
git commit -m "$COMMIT_MSG"

# Push to GitHub
git push origin master

echo "✅ Changes tracked and pushed to GitHub"
echo "🔗 https://github.com/Noesis-Boss/demolay-review-system"
