import { Link } from 'react-router-dom'
import { X, Home, Tag, MapPin } from 'lucide-react'
import { useAuth } from '../../features/auth/hooks/useAuth'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: Array<{
    name: string
    icon: any
    path: string
  }>
}

export const MobileMenu = ({ isOpen, onClose, categories }: MobileMenuProps) => {
  const { isAuthenticated, user, logout } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Menu Panel */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <Link to="/" onClick={onClose} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Livo</span>
            </Link>
            <button aria-label="Fermer le menu" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              
              {/* Menu Principal */}
              <Link 
                to="/" 
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Home size={20} className="text-gray-600" />
                <span className="font-medium">Home</span>
              </Link>

              {/* Catégories */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                  Catégories
                </h3>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <Link
                        key={category.name}
                        to={category.path}
                        onClick={onClose}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <IconComponent size={18} className="text-gray-600" />
                        <span>{category.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {/* Autres liens */}
              <Link 
                to="/offers" 
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Tag size={20} className="text-gray-600" />
                <span className="font-medium">Promotions</span>
              </Link>

              <Link 
                to="/tracking" 
                onClick={onClose}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MapPin size={20} className="text-gray-600" />
                <span className="font-medium">Suivre une commande</span>
              </Link>
            </div>
          </nav>

          {/* Footer Mobile */}
          <div className="p-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user?.firstName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout()
                    onClose()
                  }}
                  className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                 Se deconnecter
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                onClick={onClose}
                className="block w-full bg-primary-500 text-white text-center py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                Se connecter / S'inscrire
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}