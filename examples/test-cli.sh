#!/bin/bash
# DesignKit CLI — test all commands
# Run from repo root: bash examples/test-cli.sh

set -e
CLI="node bin/designkit.js"
OUT="examples/output"

echo ""
echo "======================================"
echo "  DesignKit CLI — Test Suite"
echo "======================================"

# 1. Version
echo ""
echo "▶ designkit --version"
$CLI --version

# 2. List all
echo ""
echo "▶ designkit list (first 5 lines)"
$CLI list | head -20

# 3. List filtered by kit
echo ""
echo "▶ designkit list --kit web --category cards"
$CLI list --kit web --category cards

# 4. List mobile buttons
echo ""
echo "▶ designkit list --kit app-mobile --category buttons"
$CLI list --kit app-mobile --category buttons

# 5. Search
echo ""
echo "▶ designkit search pricing"
$CLI search pricing

# 6. Search with kit filter
echo ""
echo "▶ designkit search chart --kit web"
$CLI search chart --kit web

# 7. Init — CSS
echo ""
echo "▶ designkit init --format css --output $OUT"
mkdir -p $OUT
$CLI init --format css --output $OUT
echo "  Generated: $(wc -l < $OUT/tokens.css) lines"

# 8. Init — TypeScript
echo ""
echo "▶ designkit init --format ts --output $OUT"
$CLI init --format ts --output $OUT
echo "  Generated: $(wc -l < $OUT/tokens.ts) lines"

# 9. Init — JSON
echo ""
echo "▶ designkit init --format json --output $OUT"
$CLI init --format json --output $OUT

# 10. Add — exact id
echo ""
echo "▶ designkit add web/cards/card-pricing --output $OUT"
$CLI add web/cards/card-pricing --output $OUT

# 11. Add — fuzzy match
echo ""
echo "▶ designkit add app-mobile/finance/bank-account-card --output $OUT"
$CLI add app-mobile/finance/bank-account-card --output $OUT

# 12. Add — mobile button
echo ""
echo "▶ designkit add app-mobile/buttons/button-filled --output $OUT"
$CLI add app-mobile/buttons/button-filled --output $OUT

# Done
echo ""
echo "======================================"
echo "  All tests passed ✓"
echo "  Output files in: $OUT/"
echo "======================================"
ls $OUT/
echo ""
