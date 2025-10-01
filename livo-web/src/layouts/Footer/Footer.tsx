import { Link } from 'react-router-dom'
import { 
  MapPin, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Twitter,
  Truck,
  Shield,
  Heart,
  Star
} from 'lucide-react'
import { FooterLinks } from './FooterLinks'

export const Footer = () => {
  // Données pour les liens réutilisables
  const navigationLinks = [
    { label: 'Accueil', to: '/' },
    { label: 'À propos', to: '/about' },
    { label: 'Toutes les catégories', to: '/categories' },
    { label: 'Contact', to: '/contact' }
  ]

  const partnerLinks = [
    { label: 'Devenir Partenaire', to: '/become-partner' },
    { label: 'Devenir Livreur', to: '/become-courier' },
    { label: 'Carrières', to: '/careers' },
    { label: 'Espace Presse', to: '/press' }
  ]

  const supportLinks = [
    { label: 'Centre d\'aide', to: '/help' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Livraison', to: '/delivery' },
    { label: 'Paiements', to: '/payments' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Colonne 1: Description Livo */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-3xl font-bold">
                Livo<span className="text-primary-500">.</span>
              </span>
            </Link>
            
            <h2 className="text-xl font-semibold mb-4">
              Vos commerces locaux, livrés chez vous au Mali
            </h2>
            
            <p className="text-gray-300 mb-6 max-w-md">
              Livo révolutionne la livraison au Mali en connectant les utilisateurs 
              aux meilleurs commerçants locaux. Restaurants, supermarchés, pharmacies, 
              pâtisseries et bien plus encore - tout à portée de main.
            </p>
            
            {/* Badges de confiance */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Truck size={16} className="text-primary-500" />
                <span>Livraison rapide</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Shield size={16} className="text-primary-500" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Star size={16} className="text-primary-500" />
                <span>Service qualité</span>
              </div>
            </div>
          </div>

          {/* Colonne 2: Navigation (utilise FooterLinks) */}
          <FooterLinks 
            title="Navigation" 
            links={navigationLinks}
          />

          {/* Colonne 3: Rejoindre Livo (utilise FooterLinks) */}
          <FooterLinks 
            title="Rejoindre Livo" 
            links={partnerLinks}
          />

          {/* Colonne 4: Support (utilise FooterLinks) */}
          <FooterLinks 
            title="Support" 
            links={supportLinks}
          />

          {/* Colonne 5: Contact (reste manuel car spécifique) */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <div className="space-y-4">
              
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary-500 mt-1 flex-shrink-0" />
                <p className="text-gray-300 text-sm">
                  Bamako, Mali<br />
                  ACI 2000, Rue 123
                </p>
              </div>

              <a 
                href="mailto:contact@livo.ml" 
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group"
              >
                <Mail size={18} className="text-primary-500 flex-shrink-0" />
                <span>contact@livo.ml</span>
              </a>

              <a 
                href="tel:+22320202020" 
                className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group"
              >
                <Phone size={18} className="text-primary-500 flex-shrink-0" />
                <span>+223 20 20 20 20</span>
              </a>

              {/* Réseaux sociaux */}
              <div className="pt-4">
                <h5 className="text-sm font-semibold mb-3">Suivez-nous</h5>
                <div className="flex space-x-4">
                  <a href="https://facebook.com/livomali" 
                    target="_blank" 
                    className="social-icon"
                    rel="noopener noreferrer">
                    <Facebook size={18} />
                  </a>
                  <a href="https://instagram.com/livomali" 
                    target="_blank" 
                    className="social-icon"
                    rel="noopener noreferrer"
                    >
                    <Instagram size={18} />
                  </a>
                  <a 
                    href="https://twitter.com/livomali" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="social-icon"
                  >
                    <Twitter size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section inférieure */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            
            <div className="text-gray-400 text-sm">
              <p>&copy; {new Date().getFullYear()} Livo Mali. Tous droits réservés.</p>
            </div>

            <div className="flex flex-wrap gap-6 text-sm">
              <Link to="/privacy" className="footer-legal-link">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="footer-legal-link">
                Conditions d'utilisation
              </Link>
              <Link to="/cookies" className="footer-legal-link">
                Cookies
              </Link>
            </div>

            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart size={16} className="text-red-500 fill-current" />
              <span>for Mali</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}