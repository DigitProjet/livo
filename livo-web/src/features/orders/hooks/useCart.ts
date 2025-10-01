import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartStore, CartItem, ProductVariant } from '../types/cart.types'
import { Product } from 'livo-types'

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // État initial
      items: [],
      totalItems: 0,
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      total: 0,
      restaurantId: undefined,
      isOpen: false,

      // Calcul des totaux
      calculateTotals: (items: CartItem[]) => {
        const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
        const deliveryFee = subtotal > 10000 ? 0 : 1000 // Livraison gratuite au-dessus de 10,000 FCFA
        const tax = subtotal * 0.18 // TVA 18% au Mali
        const total = subtotal + deliveryFee + tax
        
        return { subtotal, deliveryFee, tax, total }
      },

      // Gestion état panier
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      clearCart: () => set({ 
        items: [], 
        totalItems: 0, 
        subtotal: 0, 
        deliveryFee: 0, 
        tax: 0, 
        total: 0,
        restaurantId: undefined 
      }),

      // Ajouter un item
      addItem: (product: Product, quantity = 1, instructions = '', variants: ProductVariant[] = []) => {
        const state = get()
        
        // Vérification multi-restaurant
        if (state.restaurantId && state.restaurantId !== product.merchantId) {
          const confirmClear = window.confirm(
            "Votre panier contient des articles d'un autre commerce. Voulez-vous vider le panier et ajouter ce nouvel article ?"
          )
          if (!confirmClear) return
          state.clearCart()
        }

        const variantPrice = variants.reduce((sum, variant) => sum + variant.price, 0)
        const itemPrice = (product.price + variantPrice) * quantity
        const existingItemIndex = state.items.findIndex(
          item => item.product.productId === product.productId && 
          JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
        )

        let newItems: CartItem[]

        if (existingItemIndex > -1) {
          // Mise à jour quantité si item existe déjà
          newItems = state.items.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  totalPrice: item.totalPrice + itemPrice,
                  specialInstructions: instructions || item.specialInstructions
                }
              : item
          )
        } else {
          // Nouvel item
          const newItem: CartItem = {
            id: `${product.productId}-${Date.now()}`,
            product,
            quantity,
            price: product.price,
            specialInstructions: instructions,
            selectedVariants: variants,
            totalPrice: itemPrice
          }
          newItems = [...state.items, newItem]
        }

        const totals = state.calculateTotals(newItems)
        
        set({
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          restaurantId: product.merchantId,
          ...totals
        })
      },

      // Supprimer un item
      removeItem: (itemId: string) => {
        const state = get()
        const newItems = state.items.filter(item => item.id !== itemId)
        const totals = state.calculateTotals(newItems)
        
        set({
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          restaurantId: newItems.length === 0 ? undefined : state.restaurantId,
          ...totals
        })
      },

      // Mettre à jour quantité
      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(itemId)
          return
        }

        const state = get()
        const newItems = state.items.map(item => {
          if (item.id === itemId) {
            const pricePerUnit = item.totalPrice / item.quantity
            return {
              ...item,
              quantity,
              totalPrice: pricePerUnit * quantity
            }
          }
          return item
        })

        const totals = state.calculateTotals(newItems)
        
        set({
          items: newItems,
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
          ...totals
        })
      },

      // Mettre à jour instructions
      updateInstructions: (itemId: string, instructions: string) => {
        const state = get()
        const newItems = state.items.map(item =>
          item.id === itemId ? { ...item, specialInstructions: instructions } : item
        )
        
        set({ items: newItems })
      },

      // Mettre à jour variants
      updateVariants: (itemId: string, variants: ProductVariant[]) => {
        const state = get()
        const newItems = state.items.map(item => {
          if (item.id === itemId) {
            const variantPrice = variants.reduce((sum, variant) => sum + variant.price, 0)
            const newPrice = (item.product.price + variantPrice) * item.quantity
            return {
              ...item,
              selectedVariants: variants,
              totalPrice: newPrice
            }
          }
          return item
        })

        const totals = state.calculateTotals(newItems)
        
        set({
          items: newItems,
          ...totals
        })
      },

      // Validation panier
      validateCart: () => {
        const state = get()
        const errors: string[] = []

        if (state.items.length === 0) {
          errors.push("Votre panier est vide")
        }

        if (!state.restaurantId) {
          errors.push("Aucun restaurant sélectionné")
        }

        // Vérifier disponibilité des produits
        state.items.forEach(item => {
          if (!item.product.availability) {
            errors.push(`${item.product.name} n'est plus disponible`)
          }
          if (item.quantity > (item.product.stock || 99)) {
            errors.push(`Stock insuffisant pour ${item.product.name}`)
          }
        })

        return {
          isValid: errors.length === 0,
          errors
        }
      },

      // Vérification compatibilité restaurant
      canAddFromRestaurant: (restaurantId: string) => {
        const state = get()
        return !state.restaurantId || state.restaurantId === restaurantId
      },

      // Persistence
      loadCartFromStorage: () => {
        // Chargé automatiquement par persist middleware
      },

      saveCartToStorage: () => {
        // Sauvegardé automatiquement par persist middleware
      }
    }),
    {
      name: 'livo-cart-storage',
      partialize: (state) => ({ 
        items: state.items,
        restaurantId: state.restaurantId
      })
    }
  )
)

// Hook personnalisé pour l'utilisation dans les composants
export const useCartItems = () => useCart(state => state.items)
export const useCartTotals = () => useCart(state => ({
  subtotal: state.subtotal,
  deliveryFee: state.deliveryFee,
  tax: state.tax,
  total: state.total,
  totalItems: state.totalItems
}))
export const useCartActions = () => useCart(state => ({
  addItem: state.addItem,
  removeItem: state.removeItem,
  updateQuantity: state.updateQuantity,
  clearCart: state.clearCart,
  validateCart: state.validateCart
}))