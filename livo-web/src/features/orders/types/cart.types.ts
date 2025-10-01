import { Product } from 'livo-types'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  price: number
  specialInstructions?: string
  selectedVariants?: ProductVariant[]
  totalPrice: number
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  group: string
}

export interface CartState {
  items: CartItem[]
  totalItems: number
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  restaurantId?: string // Pour éviter les commandes multi-restaurants
  isOpen: boolean
}

export interface CartActions {
  // Gestion état panier
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  clearCart: () => void
  calculateTotals: (items: CartItem[]) => { subtotal: number; deliveryFee: number; tax: number; total: number }
  
  // Gestion items
  addItem: (product: Product, quantity?: number, instructions?: string, variants?: ProductVariant[]) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateInstructions: (itemId: string, instructions: string) => void
  updateVariants: (itemId: string, variants: ProductVariant[]) => void

  
  // Validation
  validateCart: () => { isValid: boolean; errors: string[] }
  canAddFromRestaurant: (restaurantId: string) => boolean
  
  // Persistence
  loadCartFromStorage: () => void
  saveCartToStorage: () => void
}

export type CartStore = CartState & CartActions