
Deployment steps (summary):
1. Create a Supabase project and run SUPABASE_SCHEMA.sql in the SQL editor.
2. In Supabase Settings -> API copy:
   - Project URL (SUPABASE_URL)
   - anon public key (SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY) -- keep this secret
3. Push this folder to a GitHub repo.
4. In Netlify, create a new site from Git -> choose your repo.
   - Build command: (leave blank)
   - Publish directory: .
5. In Netlify Site Settings -> Build & deploy -> Environment, add these variables:
   - SUPABASE_URL  = your Supabase Project URL
   - SUPABASE_ANON_KEY = your anon key
   - SUPABASE_SERVICE_ROLE_KEY = your service role key (required for OG function to query Supabase)
6. Deploy the site. Netlify will host both the static site and the function.
7. Visit the site: Add Subpage -> paste iframe embed + thumbnail -> Create -> click thumbnail -> opens subpage.
8. Social previews: share /v/<slug> link; Netlify function will return prerendered OG meta tags for crawlers, then redirect users to /video.html?slug=...
