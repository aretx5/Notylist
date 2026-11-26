# Supabase Setup for Production

## 1. Configure Supabase OAuth Redirect URLs

Go to your Supabase Dashboard → Authentication → URL Configuration

### Add these URLs:

**Site URL:**
```
https://notylist.vercel.app
```

**Redirect URLs (add all of these):**
```
https://notylist.vercel.app/auth/callback
https://notylist.vercel.app
http://localhost:3000/auth/callback
http://localhost:3000
```

## 2. Configure Google OAuth Provider

Go to Supabase Dashboard → Authentication → Providers → Google

**Authorized redirect URIs in Google Cloud Console:**
```
https://your-project-id.supabase.co/auth/v1/callback
https://notylist.vercel.app/auth/callback
```

## 3. Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://notylist.vercel.app
```

## 4. Run the Database Schema

Go to Supabase Dashboard → SQL Editor

Copy and paste the contents of `schema.sql` and run it.

## 5. Redeploy on Vercel

After setting environment variables, redeploy your app:
- Go to Vercel Dashboard → Deployments
- Click on latest deployment → Redeploy

---

**Current Issue:** OAuth is redirecting to localhost because Supabase doesn't know your production URL.

**Fix:** Complete steps 1-3 above, then redeploy.
