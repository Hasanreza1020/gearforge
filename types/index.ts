export type UserRole = 'customer' | 'admin'
export type UserLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Elite'
export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
export type CouponType = 'percentage' | 'fixed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  total_orders: number
  total_spent: number
  xp_points: number
  level: UserLevel
  achievements: Achievement[]
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  icon: string | null
  display_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null
  category_id: string | null
  category?: Category
  images: string[]
  thumbnail: string | null
  stock_quantity: number
  sku: string | null
  tags: string[]
  is_featured: boolean
  is_active: boolean
  weight_grams: number | null
  metadata: Record<string, unknown>
  stripe_price_id: string | null
  stripe_product_id: string | null
  average_rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface Address {
  id: string
  user_id: string
  full_name: string
  line1: string
  line2: string | null
  city: string
  state: string | null
  postal_code: string
  country: string
  phone: string | null
  is_default: boolean
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string
  user?: Profile
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  tax: number
  discount: number
  total: number
  shipping_address: ShippingAddress | null
  billing_address: ShippingAddress | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  tracking_number: string | null
  carrier: string | null
  notes: string | null
  metadata: Record<string, unknown>
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product?: Product
  product_name: string
  product_image: string | null
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface ShippingAddress {
  full_name: string
  email: string
  line1: string
  line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
  phone?: string
}

export interface DeliveryOption {
  id: string
  name: string
  description: string | null
  price: number
  estimated_days_min: number | null
  estimated_days_max: number | null
  is_active: boolean
  display_order: number
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  user?: Profile
  rating: number
  title: string | null
  body: string | null
  is_verified_purchase: boolean
  created_at: string
}

export interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  min_order_amount: number
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  product?: Product
  created_at: string
}

// Cart types (client-side only)
export interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_image: string | null
  slug: string
  price: number
  quantity: number
  stock_quantity: number
}

export interface Cart {
  items: CartItem[]
  delivery_option_id: string | null
  coupon_code: string | null
  coupon?: Coupon | null
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductFilters {
  category?: string
  search?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
  is_featured?: boolean
  tags?: string[]
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular'
  page?: number
  limit?: number
}

export interface CheckoutSession {
  items: CartItem[]
  shippingAddress: ShippingAddress
  deliveryOptionId: string
  userId: string
  couponCode?: string
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeProducts: number
  totalCustomers: number
  revenueToday: number
  ordersToday: number
  revenueChange: number
  ordersChange: number
}

export interface RevenueDataPoint {
  date: string
  revenue: number
  orders: number
}
