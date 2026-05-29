-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'customer' check (role in ('customer', 'admin')),
  total_orders int default 0,
  total_spent decimal(10,2) default 0,
  xp_points int default 0,
  level text default 'Bronze' check (level in ('Bronze', 'Silver', 'Gold', 'Platinum', 'Elite')),
  achievements jsonb default '[]',
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CATEGORIES
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  icon text,
  display_order int default 0,
  created_at timestamptz default now()
);

-- PRODUCTS
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text not null unique,
  description text,
  price decimal(10,2) not null,
  compare_at_price decimal(10,2),
  category_id uuid references categories(id),
  images text[] default '{}',
  thumbnail text,
  stock_quantity int default 0,
  sku text unique,
  tags text[] default '{}',
  is_featured boolean default false,
  is_active boolean default true,
  weight_grams int,
  metadata jsonb default '{}',
  stripe_price_id text,
  stripe_product_id text,
  average_rating decimal(3,2) default 0,
  review_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ADDRESSES
create table addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country text not null default 'US',
  phone text,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- ORDERS
create table orders (
  id uuid default uuid_generate_v4() primary key,
  order_number text unique not null,
  user_id uuid references profiles(id),
  status text default 'pending' check (status in (
    'pending', 'payment_pending', 'paid', 'processing',
    'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  subtotal decimal(10,2) not null,
  shipping_cost decimal(10,2) default 0,
  tax decimal(10,2) default 0,
  discount decimal(10,2) default 0,
  total decimal(10,2) not null,
  shipping_address jsonb,
  billing_address jsonb,
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  tracking_number text,
  carrier text,
  notes text,
  metadata jsonb default '{}',
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  product_image text,
  quantity int not null check (quantity > 0),
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  created_at timestamptz default now()
);

-- COUPONS
create table coupons (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  type text check (type in ('percentage', 'fixed')),
  value decimal(10,2) not null,
  min_order_amount decimal(10,2) default 0,
  max_uses int,
  uses_count int default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- DELIVERY OPTIONS
create table delivery_options (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  estimated_days_min int,
  estimated_days_max int,
  is_active boolean default true,
  display_order int default 0
);

-- REVIEWS
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references products(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating int check (rating between 1 and 5),
  title text,
  body text,
  is_verified_purchase boolean default false,
  created_at timestamptz default now(),
  unique(product_id, user_id)
);

-- WISHLIST
create table wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

-- ROW LEVEL SECURITY
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table addresses enable row level security;
alter table reviews enable row level security;
alter table wishlist enable row level security;
alter table categories enable row level security;
alter table delivery_options enable row level security;
alter table coupons enable row level security;

-- RLS POLICIES
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Anyone can view active products" on products for select using (is_active = true);
create policy "Admins can manage products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Anyone can view categories" on categories for select using (true);
create policy "Admins can manage categories" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Anyone can view delivery options" on delivery_options for select using (is_active = true);
create policy "Admins can manage delivery options" on delivery_options for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Users can view own orders" on orders for select using (user_id = auth.uid());
create policy "Users can create orders" on orders for insert with check (user_id = auth.uid());
create policy "Admins can manage all orders" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "Users can view own order items" on order_items for select using (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);

create policy "Users can manage own addresses" on addresses for all using (user_id = auth.uid());

create policy "Anyone can view reviews" on reviews for select using (true);
create policy "Users can manage own reviews" on reviews for all using (user_id = auth.uid());

create policy "Users can manage own wishlist" on wishlist for all using (user_id = auth.uid());

-- SEED DEFAULT DELIVERY OPTIONS
insert into delivery_options (name, description, price, estimated_days_min, estimated_days_max, display_order) values
  ('Standard Shipping', 'Delivered in 5-7 business days', 5.99, 5, 7, 1),
  ('Express Shipping', 'Delivered in 2-3 business days', 14.99, 2, 3, 2),
  ('Overnight Delivery', 'Next business day delivery', 29.99, 1, 1, 3),
  ('Free Shipping', 'Free on orders over $75', 0.00, 5, 7, 0);

-- SEED DEFAULT CATEGORIES
insert into categories (name, slug, icon, display_order) values
  ('Gaming Mice', 'gaming-mice', '🖱️', 1),
  ('Keyboards', 'keyboards', '⌨️', 2),
  ('Headsets', 'headsets', '🎧', 3),
  ('Controllers', 'controllers', '🎮', 4),
  ('Monitors', 'monitors', '🖥️', 5),
  ('Chairs', 'chairs', '🪑', 6),
  ('Collectibles', 'collectibles', '🏆', 7),
  ('Digital Games', 'digital-games', '💾', 8);

-- FUNCTION: auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger update_products_updated_at before update on products
  for each row execute function update_updated_at();
create trigger update_orders_updated_at before update on orders
  for each row execute function update_updated_at();
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at();

-- FUNCTION: generate order number
create or replace function generate_order_number()
returns text as $$
begin return 'GX-' || to_char(now(), 'YYMMDD') || '-' || lpad(floor(random() * 9999 + 1)::text, 4, '0'); end;
$$ language plpgsql;

-- FUNCTION: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
