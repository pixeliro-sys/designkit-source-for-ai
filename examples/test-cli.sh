#!/bin/bash
# DesignKit CLI — test all commands
# Run from repo root: bash examples/test-cli.sh
# For AI commands: bash examples/test-cli.sh --ai

set -e
CLI="node bin/designkit.js"
OUT="examples/output"
PASS=0
FAIL=0

run_test() {
  local label="$1"
  shift
  echo ""
  echo "▶ $label"
  if "$@"; then
    echo "  ✓ passed"
    PASS=$((PASS + 1))
  else
    echo "  ✗ failed"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "======================================"
echo "  DesignKit CLI — Test Suite"
echo "======================================"

mkdir -p $OUT

# ── Version ──────────────────────────────
run_test "designkit --version" \
  $CLI --version

# ── List ─────────────────────────────────
run_test "designkit list (first 20 lines)" \
  bash -c "$CLI list | head -20"

run_test "designkit list --kit web --category cards" \
  $CLI list --kit web --category cards

run_test "designkit list --kit app-mobile --category buttons" \
  $CLI list --kit app-mobile --category buttons

run_test "designkit list --kit common" \
  bash -c "$CLI list --kit common | head -10"

# ── Search ───────────────────────────────
run_test "designkit search pricing" \
  $CLI search pricing

run_test "designkit search chart --kit web" \
  $CLI search chart --kit web

run_test "designkit search button --kit app-mobile" \
  $CLI search button --kit app-mobile

# ── Init ─────────────────────────────────
run_test "designkit init --format css" \
  $CLI init --format css --output $OUT

run_test "designkit init --format ts" \
  $CLI init --format ts --output $OUT

run_test "designkit init --format js" \
  $CLI init --format js --output $OUT

run_test "designkit init --format json" \
  $CLI init --format json --output $OUT

# ── Add ──────────────────────────────────
run_test "designkit add web/cards/card-pricing" \
  $CLI add web/cards/card-pricing --output $OUT

run_test "designkit add app-mobile/buttons/button-filled" \
  $CLI add app-mobile/buttons/button-filled --output $OUT

run_test "designkit add app-mobile/finance/bank-account-card" \
  $CLI add app-mobile/finance/bank-account-card --output $OUT

run_test "designkit add web/charts/chart-area" \
  $CLI add web/charts/chart-area --output $OUT

# ── Project ──────────────────────────────
run_test "designkit project init (scan this repo)" \
  $CLI project

run_test "designkit project --show" \
  $CLI project --show

# ── AI Commands (optional) ───────────────
if [[ "$1" == "--ai" ]]; then
  echo ""
  echo "======================================"
  echo "  AI Commands"
  echo "======================================"

  # design — anthropic
  if [[ -n "$ANTHROPIC_API_KEY" ]]; then
    run_test "designkit design (anthropic)" \
      $CLI design "minimal dark pricing card with 3 tiers" \
        --provider anthropic \
        --output $OUT/pricing-anthropic.html
  else
    echo ""
    echo "  ⚠ Skipping anthropic — ANTHROPIC_API_KEY not set"
  fi

  # design — gemini
  if [[ -n "$GEMINI_API_KEY" ]]; then
    run_test "designkit design (gemini)" \
      $CLI design "hero section with gradient CTA button" \
        --provider gemini \
        --output $OUT/hero-gemini.html

    run_test "designkit design (gemini, react skill)" \
      $CLI design "stats dashboard card" \
        --provider gemini --skill react \
        --output $OUT/StatsCard.jsx

    # convert
    run_test "designkit convert --to react (gemini)" \
      $CLI convert $OUT/pricing-anthropic.html \
        --to react --provider gemini \
        --output $OUT/PricingCard.jsx

    # imagine — flash
    run_test "designkit imagine (gemini-2.0-flash-exp-image-generation)" \
      $CLI imagine "minimalist SaaS dashboard UI, dark mode, clean layout" \
        --provider gemini \
        --model gemini-2.0-flash-exp-image-generation \
        --output $OUT --name dashboard-flash

    # imagine — imagen 3
    run_test "designkit imagine (imagen-3.0-generate-002)" \
      $CLI imagine "mobile finance app screen, dark navy background" \
        --provider gemini \
        --model imagen-3.0-generate-002 \
        --aspect 9:16 \
        --output $OUT --name finance-mobile
  else
    echo ""
    echo "  ⚠ Skipping gemini — GEMINI_API_KEY not set"
  fi

  # design — openai
  if [[ -n "$OPENAI_API_KEY" ]]; then
    run_test "designkit design (openai)" \
      $CLI design "login form with social auth buttons" \
        --provider openai \
        --output $OUT/login-openai.html

    # imagine — dall-e
    run_test "designkit imagine (dall-e 3)" \
      $CLI imagine "ecommerce product page UI screenshot, clean white design" \
        --provider openai --size 1792x1024 \
        --output $OUT --name product-dalle
  else
    echo ""
    echo "  ⚠ Skipping openai — OPENAI_API_KEY not set"
  fi
fi

# ── Summary ──────────────────────────────
echo ""
echo "======================================"
echo "  Results: $PASS passed, $FAIL failed"
echo "  Output files in: $OUT/"
echo "======================================"
ls $OUT/
echo ""

if [[ $FAIL -gt 0 ]]; then
  exit 1
fi
