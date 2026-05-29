'use client'

import { create } from 'zustand'

interface UIState {
  isSearchOpen: boolean
  isMobileMenuOpen: boolean
  isLoading: boolean
  toastMessage: string | null

  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
  openMobileMenu: () => void
  closeMobileMenu: () => void
  setLoading: (loading: boolean) => void
  showToast: (message: string) => void
  clearToast: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isMobileMenuOpen: false,
  isLoading: false,
  toastMessage: null,

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  showToast: (message) => set({ toastMessage: message }),
  clearToast: () => set({ toastMessage: null }),
}))
