# Mini Typefully (Private Tweet Scheduler - MVP)
- Log in with X (Twitter) using OAuth 2.0
- Save scheduled text posts to Supabase
- Vercel Cron endpoint (placeholder) marks due posts as sent
- Next step: replace placeholder with real X post + media upload

## Environment variables
Set these in Vercel:
- TW_CLIENT_ID
- TW_CLIENT_SECRET
- TW_API_KEY
- TW_API_SECRET
- SUPABASE_URL
- SUPABASE_ANON_KEY
- NEXTAUTH_URL (your Vercel URL)
- NEXTAUTH_SECRET (random string)
