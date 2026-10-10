#!/usr/bin/env bash
set -e

echo "Verifying local Supabase container status..."
if npx supabase status > /dev/null 2>&1; then
  echo "SUCCESS: Supabase services are running locally."
  exit 0
else
  echo "WARNING: Supabase is offline. Run 'make db-start' to launch."
  exit 1
fi
