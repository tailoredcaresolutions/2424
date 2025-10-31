#!/bin/bash

# GitHub Labels Setup Script
# Creates all required labels for automation workflows
# Requires: GitHub CLI (gh) - Install from https://cli.github.com/

set -e

echo "🏷️  GitHub Labels Setup Script"
echo "================================"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "📥 Install from: https://cli.github.com/"
    echo ""
    echo "macOS: brew install gh"
    echo "Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "Windows: See https://github.com/cli/cli#windows"
    exit 1
fi

echo "✅ GitHub CLI found"
echo ""

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Not authenticated with GitHub"
    echo "Running: gh auth login"
    gh auth login
fi

echo "✅ Authenticated with GitHub"
echo ""

# Confirm repository
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")

if [ -z "$REPO" ]; then
    echo "❌ Not in a GitHub repository"
    echo "Please run this script from the repository root"
    exit 1
fi

echo "📦 Repository: $REPO"
echo ""

read -p "Create labels in $REPO? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "Creating labels..."
echo ""

# Function to create or update label
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"
    
    if gh label list | grep -q "^$name"; then
        echo "⏩ Label '$name' already exists (skipping)"
    else
        gh label create "$name" --color "$color" --description "$description" 2>/dev/null && \
            echo "✅ Created label: $name" || \
            echo "❌ Failed to create label: $name"
    fi
}

# Type Labels
echo "Creating type labels..."
create_label "bug" "d73a4a" "Something isn't working"
create_label "enhancement" "a2eeef" "New feature or request"
create_label "documentation" "0075ca" "Documentation improvements"
create_label "tests" "17e672" "Testing improvements"
create_label "chore" "fef2c0" "Maintenance tasks"
create_label "performance" "ff9800" "Performance improvements"
create_label "refactor" "9c27b0" "Code refactoring"
create_label "breaking-change" "d93f0b" "Breaking changes"

echo ""
echo "Creating category labels..."
create_label "dependencies" "0366d6" "Dependency updates"
create_label "frontend" "1d76db" "Frontend changes"
create_label "backend" "0e8a16" "Backend changes"
create_label "ci-cd" "34495e" "CI/CD changes"
create_label "configuration" "b60205" "Configuration changes"
create_label "database" "5319e7" "Database changes"
create_label "security" "b60205" "Security-related"
create_label "ui-ux" "ffd86e" "UI/UX improvements"
create_label "compliance" "c5def5" "Compliance-related"
create_label "accessibility" "7057ff" "Accessibility improvements"

echo ""
echo "Creating size labels..."
create_label "size/xs" "c2e0c6" "Extra small changes (<10 lines)"
create_label "size/s" "84b6eb" "Small changes (<50 lines)"
create_label "size/m" "fbca04" "Medium changes (<200 lines)"
create_label "size/l" "f9d0c4" "Large changes (<500 lines)"
create_label "size/xl" "d73a4a" "Extra large changes (500+ lines)"

echo ""
echo "Creating automation labels..."
create_label "automated" "ededed" "Automated PR"
create_label "auto-merge" "0e8a16" "Enable auto-merge"

echo ""
echo "================================"
echo "✅ Label setup complete!"
echo ""
echo "View labels: gh label list"
echo "Repository: $REPO"
echo ""
echo "Next steps:"
echo "1. Configure repository settings (see REPOSITORY_SETTINGS.md)"
echo "2. Test automation with a sample PR"
echo "3. Review AUTOMATION_GUIDE.md for usage instructions"
echo ""
