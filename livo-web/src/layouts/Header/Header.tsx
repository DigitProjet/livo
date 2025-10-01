import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  Book,
  Smartphone,
  Sparkles,
  ChevronDown,
  Utensils,
  ShoppingBag,
  Heart,
  Flower,
  Gem,
  Home,
  Tag,
  MapPin
} from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { MobileMenu } from './MobileMenu'
import { CartSidebar } from '../../features/orders/components/cart/CartSidebar'
import { useCart } from '../../features/orders/hooks/useCart'

export const Header = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCartOpen, setCartOpen] = useState(false)
  const [isCategoriesOpen, setCategoriesOpen] = useState(false)
  const [isUserMenuOpen, setUserMenuOpen] = useState(false)
  
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { totalItems, items, updateQuantity, removeItem } = useCart();


  const categories = [
    { name: 'Restaurants', icon: Utensils, path: '/categories/restaurants' },
    { name: 'Supermarkets', icon: ShoppingBag, path: '/categories/supermarkets' },
    { name: 'Pharmacies', icon: Heart, path: '/categories/pharmacies' },
    { name: 'Pâtisseries', icon: Gem, path: '/categories/patisseries' },
    { name: 'Fleurs', icon: Flower, path: '/categories/flowers' },
    { name: 'Librairies', icon: Book, path: '/categories/bookstores' },
    { name: 'Électronique', icon: Smartphone, path: '/categories/electronics' },
    { name: 'Beauté', icon: Sparkles, path: '/categories/beauty' }
  ]

  const isActivePath = (path: string) => location.pathname === path

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Livo<span className="text-primary-500">.</span>
              </span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 font-medium transition-colors ${
                  isActivePath('/') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <Home size={18} />
                <span>Accueil</span>
              </Link>

              {/* Dropdown Catégories */}
              <div className="relative">
                <button
                  onClick={() => setCategoriesOpen(!isCategoriesOpen)}
                  className={`flex items-center space-x-1 font-medium transition-colors ${
                    isCategoriesOpen || location.pathname.includes('/categories') 
                      ? 'text-primary-500' 
                      : 'text-gray-600 hover:text-primary-500'
                  }`}
                >
                  <Menu size={18} />
                  <span>Catégories</span>
                  <ChevronDown size={16} className={`transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCategoriesOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {categories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <Link
                          key={category.name}
                          to={category.path}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          <IconComponent size={18} className="text-gray-600" />
                          <span className="text-gray-700">{category.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              <Link 
                to="/offers" 
                className={`flex items-center space-x-1 font-medium transition-colors ${
                  isActivePath('/offers') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <Tag size={18} />
                <span>Offres</span>
              </Link>

              <Link 
                to="/tracking" 
                className={`flex items-center space-x-1 font-medium transition-colors ${
                  isActivePath('/tracking') ? 'text-primary-500' : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                <MapPin size={18} />
                <span>Suivre une commande</span>
              </Link>
            </nav>

            {/* Actions Utilisateur */}
            <div className="flex items-center space-x-4">
              
              {/* Panier */}
              <button 
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-primary-500 transition-colors"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* CTA Principal */}
              <Link 
                to="/categories" 
                className="hidden md:block bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Commandez maintenant
              </Link>

              {/* Menu Utilisateur */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user?.firstName?.charAt(0)}
                      </span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link 
                        to="/profile" 
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={16} />
                        <span>Profil</span>
                      </Link>
                      <Link 
                        to="/orders" 
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <ShoppingBag size={16} />
                        <span>Commandes</span>
                      </Link>
                      <Link 
                        to="/subscription" 
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Gem size={16} />
                        <span>Abonnement</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout()
                          setUserMenuOpen(false)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                      >
                        <LogOut size={16} />
                        <span>Se deconnecter</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  to="/auth" 
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Se connecter
                </Link>
              )}

              {/* Menu Mobile Toggle */}
              <button 
                aria-label="Menu Mobile Toggle"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary-500 transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)}
        categories={categories}
      />

      {/* Panier Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setCartOpen(false)}
        cartItems={items}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
      />
    </>
  )
}