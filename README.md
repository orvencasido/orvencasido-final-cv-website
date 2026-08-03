# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/96f0d211-964c-4eb6-95a8-0cd2aa7897e9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Optional: copy [.env.example](.env.example) to `.env` and add Supabase credentials:
   ```env
   VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```
3. For live Supabase, run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL Editor before starting the app. This creates the CMS tables, RLS policies, and Storage buckets for uploaded portfolio images.
4. Deploy the Edge Functions:
   ```bash
   supabase functions deploy admin-login
   supabase functions deploy resume-download
   ```
5. Run the app:
   `npm run dev`

## Supabase Backend

The app works in localStorage demo mode when Supabase credentials are empty. When credentials are present, data is read and written through Supabase tables. Admin image uploads go to the public `portfolio-images` Storage bucket.

Image uploads are available in the admin CMS for profile images, blog covers, project covers, and certification images.

Resume PDF uploads go to the private `portfolio-files` Storage bucket. Public resume downloads are served through the `resume-download` Edge Function, which limits each requester to 20 downloads per 24 hours before returning a short-lived signed URL.

Admin CMS logins in Supabase mode are served through the `admin-login` Edge Function, which limits each requester to 20 failed login attempts per 24 hours before allowing another attempt.
