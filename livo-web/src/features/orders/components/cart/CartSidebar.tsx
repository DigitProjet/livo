import React from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { type Product, formatCurrency } from 'livo-types';

// Types pour les items du panier
interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  price: number; // Prix au moment de l'ajout au panier
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems?: CartItem[];
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem
}) => {
  // Calcul du sous-total
  const subTotal = cartItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  // Frais de livraison fixes pour l'exemple (à adapter)
  const deliveryFee = 1000;
  const totalPrice = subTotal + deliveryFee;

  // Gestion de la quantité
  const handleQuantityChange = (itemId: string, change: number) => {
    const item = cartItems.find(item => item.id === itemId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);
    onUpdateQuantity?.(itemId, newQuantity);
  };

  // Rendu d'un item du panier
  const renderCartItem = (item: CartItem) => (
    <div key={item.id} className="flex items-center gap-3 py-4 border-b border-gray-200">
      {/* Bouton supprimer */}
      <button
        type="button"
        aria-label="Supprimer le produit"
        onClick={() => onRemoveItem?.(item.id)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
      >
        <X size={16} />
      </button>

      {/* Image du produit */}
      <img
        src={item.product.imageUrl || '/assets/img/placeholder-food.jpg'}
        alt={item.product.name}
        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
      />

      {/* Détails du produit */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">
          {item.product.name}
        </h4>
        <p className="text-sm text-gray-500 truncate">
          {item.product.description}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-green-600">
            {formatCurrency(item.price)}
          </span>
          
          {/* Contrôle de quantité */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Diminuer la quantité"
              onClick={() => handleQuantityChange(item.id, -1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            
            <span className="w-8 text-center font-medium">
              {item.quantity}
            </span>
            
            <button
              type="button"
              aria-label="Augmenter la quantité"
              onClick={() => handleQuantityChange(item.id, 1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">Votre Panier</h2>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
              {cartItems.length}
            </span>
          </div>
          
          <button
            type="button"
            aria-label="Fermer le panier"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenu du panier */}
        <div className="h-full flex flex-col">
          {/* Liste des articles */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500">Votre panier est vide</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map(renderCartItem)}
              </div>
            )}
          </div>

          {/* Footer avec le total et bouton de commande */}
          {cartItems.length > 0 && (
            <div className="border-t border-gray-200 p-6 space-y-4">
              {/* Sous-total */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total</span>
                <span className="font-medium">{formatCurrency(subTotal)}</span>
              </div>

              {/* Frais de livraison */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Frais de livraison</span>
                <span className="font-medium">{formatCurrency(deliveryFee)}</span>
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-4">
                <span>Total à payer</span>
                <span className="text-green-600">{formatCurrency(totalPrice)}</span>
              </div>

              {/* Bouton de commande */}
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                Commander maintenant
              </button>

              {/* Lien continuer les achats */}
              <button
                onClick={onClose}
                className="w-full text-center text-green-600 hover:text-green-700 transition-colors py-2"
              >
                Continuer mes achats
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Hook personnalisé pour la gestion du panier
export const useCart = () => {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.productId === product.productId);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.productId === product.productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, {
        id: `${product.productId}-${Date.now()}`,
        product,
        quantity,
        price: product.price
      }];
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };
};