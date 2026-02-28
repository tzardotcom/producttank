#!/usr/bin/env bash
# Ustawia NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel.
# Użycie: ./scripts/set-vercel-supabase-env.sh "https://TWOJ_REF.supabase.co" "eyJ..."
set -e
if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Użycie: $0 \"<NEXT_PUBLIC_SUPABASE_URL>\" \"<NEXT_PUBLIC_SUPABASE_ANON_KEY>\""
  echo "Wartości weź z: Supabase Dashboard → Project → Settings → API"
  exit 1
fi
echo "$1" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$2" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "Zmienne dodane. Redeploy: vercel --prod"
