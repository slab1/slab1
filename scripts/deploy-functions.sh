#!/bin/bash
# Deploy updated Edge Functions to Supabase
# Usage: ./scripts/deploy-functions.sh

set -e

PROJECT_REF="reewcfpjlnufktvahtii"
FUNCTIONS_DIR="supabase/functions"

echo "Deploying Edge Functions to project: $PROJECT_REF"
echo ""

# Functions to deploy (in order)
FUNCTIONS=(
  "stripe-webhook"
  "create-payment-intent"
  "complete-payment"
  "verify-payment"
  "send-reservation-email"
  "external-api"
)

for func in "${FUNCTIONS[@]}"; do
  echo "Deploying $func..."
  npx supabase functions deploy "$func" --project-ref "$PROJECT_REF"
  echo "✓ $func deployed"
  echo ""
done

echo "All Edge Functions deployed successfully!"
echo ""
echo "To verify deployment, run:"
echo "  npx supabase functions list --project-ref $PROJECT_REF"
