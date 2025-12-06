#!/bin/bash
# Sync RuVector knowledge base to NPM package assets
# Run this before publishing a new version

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NPM_ROOT="$(dirname "$SCRIPT_DIR")"
RUVECTOR_SOURCE="$NPM_ROOT/../ruvector/presentation-knowledge.yaml"
NPM_ASSET="$NPM_ROOT/assets/presentation-knowledge.yaml"

echo "🔄 Syncing RuVector knowledge base..."

if [ ! -f "$RUVECTOR_SOURCE" ]; then
    echo "❌ Source not found: $RUVECTOR_SOURCE"
    exit 1
fi

# Compare files
if cmp -s "$RUVECTOR_SOURCE" "$NPM_ASSET"; then
    echo "✅ Already in sync - no changes detected"
else
    cp "$RUVECTOR_SOURCE" "$NPM_ASSET"

    # Get line count for verification
    LINES=$(wc -l < "$NPM_ASSET" | tr -d ' ')

    echo "✅ Synced! ($LINES lines)"
    echo ""
    echo "Next steps:"
    echo "  1. npm version patch  (or minor/major)"
    echo "  2. npm publish"
fi
