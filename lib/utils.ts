import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function calculateTax(subtotal: number, taxRate = 0.08): number {
  return Math.round(subtotal * taxRate * 100) / 100
}

export function calculateXPForOrder(orderTotal: number): number {
  return Math.floor(orderTotal * 10)
}

export function calculateLevel(xp: number): string {
  if (xp >= 50000) return 'Elite'
  if (xp >= 20000) return 'Platinum'
  if (xp >= 8000) return 'Gold'
  if (xp >= 2000) return 'Silver'
  return 'Bronze'
}

export function getLevelProgress(xp: number): { current: number; next: number; progress: number } {
  const thresholds = [0, 2000, 8000, 20000, 50000, Infinity]
  let levelIndex = 0
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i]) levelIndex = i
  }
  const current = thresholds[levelIndex]
  const next = thresholds[levelIndex + 1] === Infinity ? thresholds[levelIndex] : thresholds[levelIndex + 1]
  const progress = next === current ? 100 : Math.round(((xp - current) / (next - current)) * 100)
  return { current, next, progress }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function generateOrderNumber(): string {
  const date = new Date()
  const yy = date.getFullYear().toString().slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const rand = String(Math.floor(Math.random() * 9999 + 1)).padStart(4, '0')
  return `GX-${yy}${mm}${dd}-${rand}`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    payment_pending: 'text-orange-400 bg-orange-400/10',
    paid: 'text-cyan-400 bg-cyan-400/10',
    processing: 'text-blue-400 bg-blue-400/10',
    shipped: 'text-purple-400 bg-purple-400/10',
    delivered: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    refunded: 'text-gray-400 bg-gray-400/10',
  }
  return colors[status] ?? 'text-gray-400 bg-gray-400/10'
}
