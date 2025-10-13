#!/usr/bin/env bash
set -euo pipefail

# Optional timezone support (container default if not set)
: "${TZ:=UTC}"

echo "🧩 [generator] Starting daily generation at $(date -u +"%Y-%m-%d %H:%M:%S") UTC (TZ=${TZ})"

cd /app

# Generate puzzles for the next 7 days for all formats
echo "🔄 [generator] Generating eternal puzzles..."
/usr/local/bin/python -u /app/generator/main.py -type daily -format eternal -cron 7

echo "🔄 [generator] Generating standard puzzles..."
/usr/local/bin/python -u /app/generator/main.py -type daily -format standard -cron 7

echo "🔄 [generator] Generating neo puzzles..."
/usr/local/bin/python -u /app/generator/main.py -type daily -format neo -cron 7

echo "🔄 [generator] Generating startup puzzles..."
/usr/local/bin/python -u /app/generator/main.py -type daily -format startup -cron 7

echo "✅ [generator] Finished generation at $(date -u +"%Y-%m-%d %H:%M:%S") UTC"
