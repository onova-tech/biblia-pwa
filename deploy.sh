#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SW_FILE="$SCRIPT_DIR/service_worker.js"

echo "=== Bible PWA Deploy Script ==="

echo "Bumping version in service_worker.js..."
CURRENT_VERSION=$(grep -oP "const applicationVersion = '\K[v]?\d+\.\d+\.\d+" "$SW_FILE" || echo "v1.0.0")
CURRENT_VERSION="${CURRENT_VERSION#v}"

MAJOR=$(echo "$CURRENT_VERSION" | cut -d. -f1)
MINOR=$(echo "$CURRENT_VERSION" | cut -d. -f2)
PATCH=$(echo "$CURRENT_VERSION" | cut -d. -f3)

PATCH=$((PATCH + 1))
NEW_VERSION="v$MAJOR.$MINOR.$PATCH"

sed -i "s/const applicationVersion = '[^']*'/const applicationVersion = '$NEW_VERSION'/" "$SW_FILE"

echo "Version bumped: $CURRENT_VERSION -> $NEW_VERSION"

if [ -d "$SCRIPT_DIR/publish" ]; then
    echo "Found existing 'publish' folder. Deleting..."
    rm -rf "$SCRIPT_DIR/publish"
fi

echo "Creating 'publish' folder..."
mkdir -p "$SCRIPT_DIR/publish"

echo "Copying all content to 'publish' folder..."
cp -r "$SCRIPT_DIR"/* "$SCRIPT_DIR/publish/" 2>/dev/null || true

echo "Removing *.sh and *.md files from 'publish' folder..."
rm -f "$SCRIPT_DIR/publish"/*.md
rm -f "$SCRIPT_DIR/publish"/*.sh

echo "Replacing /biblia-pwa/ with / in .html, .js, manifest.json, and service_worker.js files..."

find "$SCRIPT_DIR/publish" -type f \( -name "*.html" -o -name "*.js" -o -name "manifest.json" \) -exec sed -i 's|/biblia-pwa/|/|g' {} \;

echo "Done preparing publish folder."
echo ""

read -p "Do you want to deploy to S3? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    read -p "Enter S3 bucket name: " BUCKET_NAME
    
    if [ -n "$BUCKET_NAME" ]; then
        echo "Deploying to S3 bucket: $BUCKET_NAME"
        aws s3 sync "$SCRIPT_DIR/publish/" "s3://$BUCKET_NAME/" --delete
        echo ""
        echo "Deployment complete!"
        echo "Your site should be available at: https://$BUCKET_NAME.s3.amazonaws.com"
    else
        echo "Error: Bucket name cannot be empty."
        exit 1
    fi
else
    echo "Deploy cancelled."
fi
