#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
REPO_ROOT="$(dirname "$DIR")"

cd "$REPO_ROOT"

echo "🔨 Building production bundle for recording..."
npm run build

echo "🚀 Starting Vite preview server on http://127.0.0.1:3000..."
npx vite preview --port 3000 --host 127.0.0.1 > /dev/null 2>&1 &
SERVER_PID=$!

sleep 3

# Run playwright recording script
echo "🎬 Executing Playwright recorder..."
node scripts/record-demo.js

# Kill preview server
kill -9 $SERVER_PID || true
echo "✅ Demo generation complete!"
