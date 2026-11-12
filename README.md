# ACUTE — Storefront

Minimalist womenswear storefront. Next.js (App Router) · TypeScript · Tailwind CSS · Lucide · Supabase · Stripe Checkout.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

It runs right away on mock products; checkout stays off until you add Stripe keys.

### Connect services

1. `cp .env.example .env.local` and fill in the keys.
2. **Supabase:** run `supabase/schema.sql` in the SQL Editor. It creates the tables and RLS rules and adds 8 sample products.
3. **Stripe:** add `STRIPE_SECRET_KEY`. For order syncing, run
   `stripe listen --forward-to localhost:3000/api/stripe/webhook` and paste the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`.
   Turn on PromptPay in Stripe Dashboard → Payment methods if you want Thai QR payments.

## Auth & roles

| Tier | Who | Can |
| --- | --- | --- |
| **public** | not signed in | browse products (cards show "Sign in to shop") |
| **customer** | signed up (default role) | cart, checkout, `/account` order history |
| **admin** | `profiles.role = 'admin'` | `/admin`: add products, hide/show products, read all orders |

- Supabase Auth (email + password) via `@supabase/ssr`. `src/middleware.ts` refreshes the session and sends signed-out visitors from `/account` and `/admin` to `/login`.
- Server code checks the role through `getCurrentUser()`, `requireUser()` and `requireAdmin()` in `src/lib/auth.ts`. RLS policies in `schema.sql` apply the same rules a second time in the database.
- Users can't promote themselves: they only have column grants for `full_name` and `phone`.
- **First admin:** sign up on the site, then run the `update public.profiles set role = 'admin' …` snippet at the bottom of `schema.sql`.
- Supabase → Authentication → URL Configuration: add `http://localhost:3000/auth/callback` (and your production URL) to the redirect URLs.

## Folder structure

```
src/
├── app/
│   ├── layout.tsx                 # fonts, CartProvider, Navbar, Footer, CartDrawer
│   ├── page.tsx                   # landing: Hero → Philosophy → Catalog → Lookbook
│   ├── globals.css                # Tailwind layers + .btn-primary / .heading-display / .eyebrow
│   ├── actions/checkout.ts        # Server Action → Stripe Checkout Session (signed-in only)
│   ├── actions/auth.ts            # signIn / signUp / signOut
│   ├── actions/admin.ts           # createProduct / setProductActive (admin only)
│   ├── login/ signup/ account/    # auth pages + order history
│   ├── admin/                     # product management (admin only)
│   ├── auth/callback/route.ts     # email-confirmation landing
│   ├── api/stripe/webhook/route.ts# checkout.session.completed → Supabase orders
│   └── checkout/success/          # thank-you page (clears cart)
├── components/
│   ├── layout/                    # Navbar, Footer
│   ├── sections/                  # Hero, Philosophy, ProductCatalog, Lookbook
│   ├── product/                   # ProductCard, ProductImage, CategoryFilter
│   ├── auth/                      # AuthProvider (useUser), AuthForm
│   ├── admin/                     # ProductForm
│   ├── cart/                      # CartProvider (per-user localStorage), CartDrawer
│   └── ui/                        # EditorialPlaceholder
├── middleware.ts                  # session refresh + route protection
├── lib/
│   ├── auth.ts                    # getCurrentUser / requireUser / requireAdmin
│   ├── supabase/server.ts         # anon, session-aware and service-role clients
│   ├── products.ts                # data access, falls back to mock data
│   ├── stripe.ts                  # lazy Stripe client
│   └── utils.ts                   # cn(), formatTHB()
├── data/mock-products.ts
└── types/product.ts
supabase/schema.sql
```

## Design tokens (`tailwind.config.ts`)

| Token              | Hex       | Use                               |
| ------------------ | --------- | --------------------------------- |
| `acute-red`        | `#AE3C31` | Primary buttons, active states    |
| `acute-blue`       | `#DCE7F2` | Soft sections, cards              |
| `acute-cream`      | `#F7F3EE` | Page background                   |
| `acute-ink`        | `#2F3135` | Text, icons                       |
| `acute-stone`      | `#B7AFA6` | Borders, dividers, tags           |

Fonts: Cormorant Garamond (serif headings) and Inter (body), both loaded through `next/font`.

## Notes

- **Pricing is server-authoritative.** The cart sends only `{id, quantity}`. The server action reads prices again from Supabase before it creates the Stripe session.
- Prices are stored in whole THB. Stripe gets them ×100 (satang).
- Imagery uses `EditorialPlaceholder` for now. Set `image_url` on a product (Supabase Storage URL) and `ProductImage` switches to `next/image` automatically.
- Next steps: product detail pages (`app/products/[slug]`), size variants and stock, image upload to Supabase Storage in the admin page, and an admin orders view.
