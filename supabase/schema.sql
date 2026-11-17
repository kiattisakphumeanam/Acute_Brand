  -- ACUTE — Supabase schema
  -- Run in Supabase SQL Editor (or `supabase db push` if using the CLI with migrations).
  -- Safe to re-run: tables use IF NOT EXISTS, new columns use ADD COLUMN IF NOT EXISTS,
  -- policies are dropped before being recreated, and the seed skips slugs that already exist.
  --
  -- Access model
  --   public   (not signed in) → read active products only
  --   customer (signed in)     → + read own profile & orders, checkout
  --   admin    (profiles.role) → + create / edit / hide products, read all orders

  create extension if not exists "pgcrypto";

  -- ─────────────────────────────────────────────
  -- Customer profiles (1:1 with auth.users) + role
  -- ─────────────────────────────────────────────
  create table if not exists public.profiles (
    id         uuid primary key references auth.users (id) on delete cascade,
    full_name  text,
    phone      text,
    role       text not null default 'customer' check (role in ('customer', 'admin')),
    created_at timestamptz not null default now()
  );

  alter table public.profiles
    add column if not exists role text not null default 'customer' check (role in ('customer', 'admin'));

  -- Membership: set from the account page's "Connect membership" popup. member_since marks a connected member.
  -- Cancelling sets member_cancelled_at (and clears phone and birthday) but keeps member_since, so rejoining
  -- doesn't hand out the first-order discount again; rejoining clears member_cancelled_at.
  alter table public.profiles
    add column if not exists birthday            date,
    add column if not exists member_since        timestamptz,
    add column if not exists member_cancelled_at timestamptz;

  -- Customer number (ac-001, ac-002, …): given once, the first time a profile becomes a member, and never changed.
  -- Not in the column grants below, so users can't set or edit their own.
  create sequence if not exists public.customer_id_seq;
  alter table public.profiles
    add column if not exists customer_id text unique;

  create or replace function public.next_customer_id()
  returns text
  language sql security definer set search_path = public
  as $$
    -- Three digits at least, then grows: ac-999 → ac-1000 (lpad alone would cut 1000 down to 100)
    select 'ac-' || case when n < 1000 then lpad(n::text, 3, '0') else n::text end
    from (select nextval('public.customer_id_seq') as n) s;
  $$;

  create or replace function public.assign_customer_id()
  returns trigger
  language plpgsql security definer set search_path = public
  as $$
  begin
    if new.member_since is not null and new.customer_id is null then
      new.customer_id := public.next_customer_id();
    end if;
    return new;
  end;
  $$;

  drop trigger if exists assign_customer_id on public.profiles;
  create trigger assign_customer_id
    before insert or update on public.profiles
    for each row execute function public.assign_customer_id();

  -- Members who joined before customer numbers existed: numbered in the order they joined
  do $$
  declare r record;
  begin
    for r in
      select id from public.profiles
      where member_since is not null and customer_id is null
      order by member_since, id
    loop
      update public.profiles set customer_id = public.next_customer_id() where id = r.id;
    end loop;
  end;
  $$;

  -- Role lookup used by RLS policies. SECURITY DEFINER avoids RLS recursion on profiles.
  create or replace function public.is_admin()
  returns boolean
  language sql stable security definer set search_path = public
  as $$
    select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
  $$;

  -- Create a profile automatically when someone signs up.
  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql security definer set search_path = public
  as $$
  begin
    insert into public.profiles (id, full_name)
    values (new.id, new.raw_user_meta_data ->> 'full_name')
    on conflict (id) do nothing;
    return new;
  end;
  $$;

  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

  -- Accounts created before the trigger existed have no profile, so saving membership has no row to update
  insert into public.profiles (id, full_name)
  select id, raw_user_meta_data ->> 'full_name' from auth.users
  on conflict (id) do nothing;

  alter table public.profiles enable row level security;

  drop policy if exists "Users read own profile"   on public.profiles;
  drop policy if exists "Users update own profile" on public.profiles;
  drop policy if exists "Admins read all profiles" on public.profiles;

  create policy "Users read own profile"   on public.profiles for select using (auth.uid() = id);
  create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
  create policy "Admins read all profiles" on public.profiles for select using (public.is_admin());

  -- Users may edit their name, phone and membership details but never their own role.
  revoke update on public.profiles from authenticated;
  grant update (full_name, phone, birthday, member_since, member_cancelled_at) on public.profiles to authenticated;

  -- ─────────────────────────────────────────────
  -- Products
  -- ─────────────────────────────────────────────
  create table if not exists public.products (
    id          uuid primary key default gen_random_uuid(),
    slug        text unique not null,
    name        text not null,
    description text not null default '',
    price       integer not null check (price > 0),          -- whole THB
    category    text not null,                               -- see products_category_check below
    image_url   text,                                        -- optional cover; public/products/<slug>/ is used otherwise
    is_new      boolean not null default false,
    is_active   boolean not null default true,
    sort_order  integer not null default 0,
    created_at  timestamptz not null default now()
  );

  -- Storefront fields (match the Product type in src/types/product.ts).
  -- Added separately so re-running upgrades a table created by an older version of this file.
  alter table public.products
    add column if not exists status         text   not null default 'active'
      check (status in ('active', 'sold_out', 'coming_soon')),
    add column if not exists colors         jsonb  not null default '[]'::jsonb,  -- [{"name":"White","hex":"#FBFBF8"}]
    add column if not exists sizes          text[] not null default '{}',         -- {XS,S,M,L} or {F}
    add column if not exists sold_out_sizes text[] not null default '{}',         -- subset of sizes
    add column if not exists moment         text
      check (moment in ('Work', 'Weekend', 'Evening', 'Everyday')),
    -- Gallery in display order: [1] = cover, [2] = hover. Public URLs from the "products" Storage bucket.
    -- image_url mirrors images[1] (Stripe Checkout shows it); /admin keeps the two in sync.
    add column if not exists images         text[] not null default '{}';

  -- Categories (match CATEGORIES in src/types/product.ts): Top, Match set, Skirt, Skort.
  -- The old list was tops / bottoms / dresses / outerwear / knitwear — move existing rows over first.
  alter table public.products drop constraint if exists products_category_check;

  -- Sample products from earlier versions of this file
  update public.products set category = 'skort' where slug = 'still-scene-maxi-skirt';
  update public.products set category = 'skirt' where slug = 'bias-slip-skirt';
  update public.products set category = 'tops'
    where slug in ('easy-poplin-shirt', 'soft-wool-cardigan', 'boxy-knit-vest', 'ribbed-tank');
  -- Samples with no matching category (dress, trousers, trench) are removed
  delete from public.products where slug in ('column-midi-dress', 'wide-pleat-trouser', 'quiet-trench');

  -- Anything else still on an old category is hidden and parked under Top — pick the right one in /admin
  update public.products set category = 'tops', is_active = false
    where category not in ('tops', 'match_set', 'skirt', 'skort');

  alter table public.products
    add constraint products_category_check check (category in ('tops', 'match_set', 'skirt', 'skort'));

  alter table public.products drop constraint if exists products_colors_is_array;
  alter table public.products
    add constraint products_colors_is_array check (jsonb_typeof(colors) = 'array');

  alter table public.products drop constraint if exists products_sold_out_sizes_subset;
  alter table public.products
    add constraint products_sold_out_sizes_subset check (sold_out_sizes <@ sizes);

  create index if not exists products_active_sort_idx on public.products (sort_order) where is_active;

  alter table public.products enable row level security;

  drop policy if exists "Active products are public" on public.products;
  drop policy if exists "Admins manage products"     on public.products;

  create policy "Active products are public"
    on public.products for select
    using (is_active or public.is_admin());

  create policy "Admins manage products"
    on public.products for all
    using (public.is_admin())
    with check (public.is_admin());

  -- ─────────────────────────────────────────────
  -- Storage — public "products" bucket for product photos
  -- Anyone can view; only admins can upload / replace / delete (the /admin page and the Dashboard).
  -- ─────────────────────────────────────────────
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('products', 'products', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
  on conflict (id) do update
    set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

  drop policy if exists "Product images are public"     on storage.objects;
  drop policy if exists "Admins upload product images"  on storage.objects;
  drop policy if exists "Admins update product images"  on storage.objects;
  drop policy if exists "Admins delete product images"  on storage.objects;

  create policy "Product images are public"
    on storage.objects for select using (bucket_id = 'products');
  create policy "Admins upload product images"
    on storage.objects for insert with check (bucket_id = 'products' and public.is_admin());
  create policy "Admins update product images"
    on storage.objects for update using (bucket_id = 'products' and public.is_admin());
  create policy "Admins delete product images"
    on storage.objects for delete using (bucket_id = 'products' and public.is_admin());

  -- ─────────────────────────────────────────────
  -- Site media — photos and videos for the storefront's sections, managed in /admin/media.
  -- One row per slot; the slots themselves (and their fallback files in public/) live in
  -- src/data/site-media.ts, so admins choose what fills a place but not where places are.
  -- ─────────────────────────────────────────────
  create table if not exists public.site_media (
    slot        text primary key,                            -- e.g. 'home.hero', 'moments.work'
    kind        text not null check (kind in ('image', 'video')),
    url         text not null,                               -- main file (desktop, or every screen without a mobile one)
    mobile_url  text,                                        -- optional portrait cut for phones
    poster_url  text,                                        -- videos: still frame shown while loading
    alt_en      text not null default '',
    alt_th      text not null default '',
    updated_at  timestamptz not null default now()
  );

  alter table public.site_media enable row level security;

  drop policy if exists "Site media is public"      on public.site_media;
  drop policy if exists "Admins manage site media"  on public.site_media;

  create policy "Site media is public"
    on public.site_media for select using (true);
  create policy "Admins manage site media"
    on public.site_media for all
    using (public.is_admin())
    with check (public.is_admin());

  -- Lookbook on /about: a list admins add to, reorder and trim in /admin/media (files in the site-media bucket).
  -- With no rows the section shows its placeholders and the dictionary's captions.
  create table if not exists public.lookbook_looks (
    id          uuid primary key default gen_random_uuid(),
    url         text not null,
    caption_en  text not null default '',                   -- e.g. "07:40 Commute"
    caption_th  text not null default '',
    alt_en      text not null default '',
    alt_th      text not null default '',
    sort_order  integer not null default 0,
    created_at  timestamptz not null default now()
  );

  alter table public.lookbook_looks enable row level security;

  drop policy if exists "Lookbook is public"      on public.lookbook_looks;
  drop policy if exists "Admins manage lookbook"  on public.lookbook_looks;

  create policy "Lookbook is public"
    on public.lookbook_looks for select using (true);
  create policy "Admins manage lookbook"
    on public.lookbook_looks for all
    using (public.is_admin())
    with check (public.is_admin());

  -- Public "site-media" bucket. 50 MB is the largest single file Supabase's free plan accepts.
  -- /admin/media uploads straight from the browser with a signed URL, so big videos never pass through the app.
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('site-media', 'site-media', true, 52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'])
  on conflict (id) do update
    set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

  drop policy if exists "Site media files are public"   on storage.objects;
  drop policy if exists "Admins delete site media files" on storage.objects;

  create policy "Site media files are public"
    on storage.objects for select using (bucket_id = 'site-media');
  create policy "Admins delete site media files"
    on storage.objects for delete using (bucket_id = 'site-media' and public.is_admin());

  -- ─────────────────────────────────────────────
  -- Orders — written only by the Stripe webhook (service role)
  -- ─────────────────────────────────────────────
  create table if not exists public.orders (
    id                uuid primary key default gen_random_uuid(),
    user_id           uuid references auth.users (id) on delete set null,
    stripe_session_id text unique not null,
    email             text,
    amount_total      integer not null,                      -- satang (THB × 100), as Stripe reports it
    currency          text not null default 'thb',
    status            text not null default 'pending' check (status in ('pending','paid','fulfilled','refunded')),
    shipping          jsonb,
    created_at        timestamptz not null default now()
  );

  create table if not exists public.order_items (
    id          uuid primary key default gen_random_uuid(),
    order_id    uuid not null references public.orders (id) on delete cascade,
    product_id  uuid references public.products (id) on delete set null,
    name        text not null,                               -- snapshot at purchase time, includes size ("… — M")
    unit_amount integer not null,                            -- satang
    quantity    integer not null check (quantity > 0)
  );

  alter table public.orders      enable row level security;
  alter table public.order_items enable row level security;

  drop policy if exists "Users read own orders"       on public.orders;
  drop policy if exists "Admins read all orders"      on public.orders;
  drop policy if exists "Users read own order items"  on public.order_items;
  drop policy if exists "Admins read all order items" on public.order_items;

  create policy "Users read own orders"
    on public.orders for select using (auth.uid() = user_id);
  create policy "Admins read all orders"
    on public.orders for select using (public.is_admin());

  create policy "Users read own order items"
    on public.order_items for select
    using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
  create policy "Admins read all order items"
    on public.order_items for select using (public.is_admin());

  -- ─────────────────────────────────────────────
  -- Newsletter — written only by the server action with the service role (no public policies)
  -- ─────────────────────────────────────────────
  create table if not exists public.newsletter_subscribers (
    email      text primary key,
    created_at timestamptz not null default now()
  );
  alter table public.newsletter_subscribers enable row level security;

  -- ─────────────────────────────────────────────
  -- Seed (matches src/data/mock-products.ts)
  -- Safe to re-run: see the ON CONFLICT clause at the end.
  -- Photos come from public/products/<slug>/1.jpg, 2.jpg, … (folder name may use _ instead of -).
  -- ─────────────────────────────────────────────
  insert into public.products
    (slug, name, description, price, category, is_new, status, colors, sizes, sold_out_sizes, moment, sort_order)
  values
    ('still-scene-maxi-skirt', 'Still Scene Maxi Skort',
    'Tiered maxi skort in crinkled voile with ruched bands and an elastic waist. Free size — waist 24–42", hips 46", length 31.5".',
    1890, 'skort', true, 'active',            -- TODO: real price
    '[{"name":"White","hex":"#FBFBF8"}]',
    '{F}', '{}', 'Weekend', 1),

    ('soft-wool-cardigan', 'Soft Wool Cardigan', 'Fine-gauge merino blend, made for layering.',
    2790, 'tops', false, 'sold_out',
    '[{"name":"Cream","hex":"#F1EADF"},{"name":"Stone","hex":"#B7AFA6"}]',
    '{XS,S,M,L}', '{XS,S,M,L}', 'Weekend', 2),

    ('ribbed-tank', 'Ribbed Scoop Tank', 'Everyday rib-knit tank with a low scoop.',
    890, 'tops', false, 'active',
    '[{"name":"Cream","hex":"#F1EADF"},{"name":"Ink","hex":"#2F3135"},{"name":"Brick","hex":"#AE3C31"},{"name":"Sky","hex":"#DCE7F2"}]',
    '{XS,S,M,L}', '{}', 'Everyday', 3),

    ('bias-slip-skirt', 'Bias Slip Skirt', 'Bias-cut satin that moves with you.',
    1990, 'skirt', false, 'coming_soon',
    '[{"name":"Sky","hex":"#DCE7F2"},{"name":"Brick","hex":"#AE3C31"}]',
    '{XS,S,M,L}', '{}', 'Evening', 4),

    ('boxy-knit-vest', 'Boxy Knit Vest', 'Cropped and boxy, in brushed cotton yarn.',
    1590, 'tops', false, 'active',
    '[{"name":"Stone","hex":"#B7AFA6"},{"name":"Cream","hex":"#F1EADF"}]',
    '{XS,S,M,L}', '{}', 'Weekend', 5)
  -- Rows seeded by an older version of this file have no colours/sizes yet: fill those in.
  -- Rows that already have colours or sizes (e.g. edited in /admin) are left as they are.
  on conflict (slug) do update set
    status         = excluded.status,
    colors         = excluded.colors,
    sizes          = excluded.sizes,
    sold_out_sizes = excluded.sold_out_sizes,
    moment         = excluded.moment
  where public.products.sizes = '{}' and public.products.colors = '[]'::jsonb;

  -- ─────────────────────────────────────────────
  -- Make yourself admin (run once, after signing up on the site):
  --   update public.profiles set role = 'admin'
  --   where id = (select id from auth.users where email = 'you@example.com');
  -- ─────────────────────────────────────────────
