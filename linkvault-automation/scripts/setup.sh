#!/bin/bash
set -e

echo "=== LinkVault Automation — Setup ==="
echo ""

# 1. Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20+ required. Current: $(node -v)"
  exit 1
fi
echo "✓ Node.js $(node -v)"

# 2. Install dependencies
echo "Installing dependencies..."
npm install
echo "✓ Dependencies installed"

# 3. Create logs directory
mkdir -p logs
echo "✓ Logs directory created"

# 4. Check .env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "⚠ Created .env from .env.example — please fill in your API keys"
else
  echo "✓ .env file exists"
fi

# 5. Verify critical env vars
echo ""
echo "Checking environment variables..."

check_env() {
  if [ -z "${!1}" ]; then
    echo "  ⚠ $1 not set"
  else
    echo "  ✓ $1"
  fi
}

source .env 2>/dev/null || true

check_env "ANTHROPIC_API_KEY"
check_env "SUPABASE_URL"
check_env "SUPABASE_KEY"

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Fill in your .env with API keys"
echo "  2. Run the schema in Supabase: infrastructure/schema.sql"
echo "  3. Start with SEO: npm run seo:generate"
echo "  4. Then outreach: npm run outreach:scrape"
