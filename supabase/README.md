# RScreation Supabase Integration & Setup Guide

This guide walks through configuring your Supabase backend for **RScreation**.

---

## 1. Project Credentials Configured
- **Project Name:** RScreation
- **Project ID:** `zticcsbyrejkctqwvzur`
- **Project URL:** `https://zticcsbyrejkctqwvzur.supabase.co`
- **Publishable Key:** `sb_publishable_b62eRt7Gi0IOfm8QjW8j7w_So_rCrUV`

These are saved in `.env` (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) and documented in `.env.example`.

---

## 2. Execute SQL Migrations in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/zticcsbyrejkctqwvzur).
2. Click **SQL Editor** on the left navigation bar.
3. Click **New Query**.
4. Copy the entire contents of `supabase/migrations/20260404000000_rscreation_schema.sql` and paste it into the editor.
5. Click **Run** (or press Ctrl/Cmd + Enter).
   - *This provisions all 19 tables, indexes, constraints, trigger functions, RLS policies, and storage buckets.*
6. Open another query, copy the contents of `supabase/seed.sql`, and click **Run**.
   - *This seeds the initial categories, products, coupons, and site settings.*

---

## 3. Storage Buckets Check

The migration automatically configures three buckets in `storage.buckets`:
1. `product-previews` (Public) - For product thumbnails and gallery mockups.
2. `digital-products` (Private) - For licensed PSD archives and zip downloads.
3. `brand-assets` (Public) - For logos, banners, and watermarks.

Verify in the **Storage** section of your Supabase dashboard that these 3 buckets exist.

---

## 4. Assigning the First Administrator

For security, the application does not allow users to self-assign administrative rights.
Follow these steps to grant admin privileges:

1. Register or sign up with your email (e.g. `nmahendar065@gmail.com` or `admin@rscreation.in`) on the RScreation website `/register` or `/login`.
2. Open **Supabase Dashboard** -> **Authentication** -> **Users** and locate your User ID (UUID format, e.g. `d3b07384d113edec49eaa6238ad5ff00`).
3. Open **SQL Editor** and run:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_UUID_HERE', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

Once executed, logging in with that account will immediately grant access to `/admin/dashboard`, product CRUD, and order management.

---

## 5. Phase 3: Razorpay Payment & Secure Downloads Setup

### Step A: Run Phase 3 SQL Migration
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/zticcsbyrejkctqwvzur/sql).
2. Copy and run `supabase/migrations/20260404000001_phase3_payment_and_downloads.sql`.
   - *This configures atomic payment capture (`verify_and_capture_payment`), download logging (`log_and_verify_download`), and Razorpay constraints.*

### Step B: Set Edge Function Secrets
In your Supabase Dashboard -> **Project Settings** -> **Edge Functions** (or via Supabase CLI), add the following secrets:
```bash
supabase secrets set RAZORPAY_KEY_ID=rzp_test_YourKeyId
supabase secrets set RAZORPAY_KEY_SECRET=YourKeySecret
supabase secrets set RAZORPAY_WEBHOOK_SECRET=YourWebhookSecret
```

### Step C: Deploy Edge Functions
Deploy the 4 secure Edge Functions located in `/supabase/functions`:
```bash
supabase functions deploy create-payment-order
supabase functions deploy verify-payment
supabase functions deploy razorpay-webhook
supabase functions deploy generate-download-url
```

### Step D: Razorpay Webhook Configuration
In your [Razorpay Dashboard](https://dashboard.razorpay.com/) -> **Settings** -> **Webhooks**:
- **Webhook URL:** `https://zticcsbyrejkctqwvzur.supabase.co/functions/v1/razorpay-webhook`
- **Secret:** Enter your `RAZORPAY_WEBHOOK_SECRET`
- **Active Events:**
  - `payment.captured`
  - `payment.failed`

### Step E: Frontend Razorpay Test Key
Add your Razorpay Test Key ID to your environment variables or `.env`:
```env
VITE_RAZORPAY_KEY_ID="rzp_test_YourKeyId"
```
The RScreation checkout page automatically supports UPI (PhonePe/GPay), cards, and net banking with server-side HMAC-SHA256 signature verification and instant digital license unlocking.
