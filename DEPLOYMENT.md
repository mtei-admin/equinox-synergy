# Deploying Equinox Synergy (Next.js + Supabase)

Production stack: **Vercel** (frontend) + **Supabase** (database, auth, storage, realtime).

---

## 1. Prepare Supabase (one time)

Your project ref: `rjmvuhvigtcyudpxbfpg`

Apply all migrations to the remote database:

```powershell
npx supabase login
npx supabase link --project-ref rjmvuhvigtcyudpxbfpg
npx supabase db push
npm run db:seed
```

Confirm in the Supabase Dashboard:

- **Database → Publications → supabase_realtime** includes `purchase_orders`
- **Storage** bucket `cms-assets` exists (created by migration)

---

## 2. Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push this repo to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables (Production + Preview + Development):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://rjmvuhvigtcyudpxbfpg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your `sb_publishable_...` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only; enables dealer provisioning) |

5. Click **Deploy**.

### Option B — Vercel CLI

```powershell
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npx vercel env add SUPABASE_SERVICE_ROLE_KEY
npx vercel deploy --prod
```

---

## 3. Configure Supabase Auth for production

After the first deploy, note your Vercel URL:

**Production:** https://equinox-synergy.vercel.app

In **Supabase Dashboard → Authentication → URL Configuration**:

| Setting | Value |
|---|---|
| **Site URL** | `https://equinox-synergy.vercel.app` |
| **Redirect URLs** | `https://equinox-synergy.vercel.app/auth/callback` |
| | `https://equinox-synergy.vercel.app/**` |

Add custom domains here too if you attach one in Vercel.

---

## 4. Post-deploy verification

- [ ] `/login` loads and shows no Supabase config warning
- [ ] Dealer login → `/dealer` dashboard
- [ ] Admin login → `/admin` dashboard; **PO alerts live** indicator appears
- [ ] Dealer submits PO → admin receives realtime toast
- [ ] Admin uploads CMS asset → dealer can download from `/dealer/assets`
- [ ] Admin creates dealer account from `/admin/dealers`

---

## 5. Environment reference

Copy from `.env.example`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser or commit it to git.

Local development:

```powershell
npm run dev
```

Production build test locally:

```powershell
npm run build
npm run start
```

---

## 6. Troubleshooting

| Issue | Fix |
|---|---|
| `fetch failed` on login | Check Vercel env vars; redeploy after adding them |
| Auth redirect loop | Add production URL + `/auth/callback` in Supabase Auth settings |
| Realtime alerts not firing | Run `20250615000000_realtime_purchase_orders.sql` migration |
| Dealer create fails | Set `SUPABASE_SERVICE_ROLE_KEY` in Vercel (not just locally) |
| CMS upload fails | Confirm `cms-assets` bucket and storage policies exist |
