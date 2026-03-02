#!/bin/bash
set -e

echo "=== LinkVault Automation — Full Run ==="
echo "Started at: $(date)"
echo ""

# Load environment
source .env 2>/dev/null || true

# ── SEO Engine ──
echo "--- Module 1: SEO Engine ---"
node modules/01-seo-engine/generator.js || echo "SEO generator encountered errors"
echo ""

# ── Outreach Engine ──
echo "--- Module 2: Outreach Engine ---"
node modules/02-outreach-engine/scraper.js || echo "Scraper encountered errors"
node modules/02-outreach-engine/email-sender.js || echo "Email sender encountered errors"
echo ""

# ── Content Engine ──
echo "--- Module 3: Content Engine ---"
node modules/03-content-engine/generator.js || echo "Content generator encountered errors"
node modules/03-content-engine/publisher.js || echo "Publisher encountered errors"
echo ""

# ── Metrics ──
echo "--- Module 4: Metrics ---"
node modules/04-metrics-dashboard/collector.js || echo "Metrics collector encountered errors"
echo ""

echo "=== Complete at: $(date) ==="
