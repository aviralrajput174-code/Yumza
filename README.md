# Yumzo — Supabase-connected full-stack starter

This is **not a fully deployed marketplace yet**. It is a real integration starter: authentication, database reads/writes, menu photo upload, COD order creation, owner order status changes, and customer order history are wired to Supabase. It becomes usable only after you configure your own Supabase project, run the SQL, add keys, test policies, and deploy it. Do not take real customer orders until testing is complete.

## Phone-friendly setup

1. Create a Supabase project at https://supabase.com/ and open its Dashboard.
2. Open **SQL Editor**, create a new query, paste all of `supabase/schema.sql`, and run it.
3. Open **Project Settings → API** (or API Keys). Copy the Project URL and the publishable/anon key. Do not copy a service-role/secret key.
4. Open `app.js`. Replace:
   - `PASTE_YOUR_SUPABASE_PROJECT_URL_HERE`
   - `PASTE_YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY_HERE`
5. Upload `index.html`, `style.css`, and `app.js` to your GitHub Pages repository. Keep the `supabase` folder locally for setup/deployment.
6. In Supabase **Authentication → URL Configuration**, add your GitHub Pages URL to Site URL and Redirect URLs. Configure email confirmation as desired.
7. Create your account through the site. In Supabase SQL Editor, make your trusted account admin:
   ```sql
   update public.profiles
   set role='admin'
   where id=(select id from auth.users where email='YOUR_EMAIL');
   ```
   Replace `YOUR_EMAIL`. Never make a public admin signup form.
8. When a restaurant owner signs up, verify them before granting `restaurant_owner` role. Approve their listing from SQL only after checking it:
   ```sql
   update public.profiles set role='restaurant_owner' where id='USER_UUID';
   update public.restaurants set is_approved=true where id='RESTAURANT_UUID';
   ```
9. To grant a delivery partner access after verifying them:
   ```sql
   update public.profiles set role='delivery_partner' where id='USER_UUID';
   ```

## What is connected vs what still needs work

Connected after configuration:
- Supabase email/password sign-up and login
- User profile name update
- Restaurant listing and menu reads/writes
- Image upload to Supabase Storage
- Customer COD order creation and order history
- Restaurant order status updates

Needs further implementation before production:
- Strong server-side validation of item prices/totals and atomic order+items transaction (never trust client totals)
- Full role-based UI restrictions and delivery assignment/acceptance flow
- Admin dashboard UI and approval workflow
- Real-time notifications, SMS/WhatsApp, GPS/map tracking
- Online payments (Razorpay/other gateway and server-side webhook verification)
- Real AI image provider integration. The included Edge Function is a secure scaffold but its request/response parser must match the chosen provider's API. Add provider secrets with Supabase Functions secrets; never put them in app.js.
- Rate limiting, abuse prevention, privacy policy, terms, refund/cancellation handling, backups and end-to-end testing.

## Important security notes

- Never put Supabase `service_role` key or an AI/payment secret in browser JavaScript.
- Database RLS policies are enabled, but review/test them with separate customer, owner, delivery, and admin accounts before production.
- The current initial ordering flow supports Cash on Delivery only.
- GitHub Pages hosts static frontend only; Supabase provides backend services.
- Free tiers and quotas can change; AI image generation and payment processing may cost money.
