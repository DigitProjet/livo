import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Utensils, 
  ShoppingCart, 
  Heart, 
  Gem, 
  Flower, 
  Gift, 
  Truck, 
  Smartphone,
  Users,
  Store,
  Package,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'

export const HomePage = () => {
  // Données des services
  const services = [
    { icon: Utensils, name: 'Restaurants', description: 'Plats locaux et internationaux', color: 'bg-orange-100 text-orange-600' },
    { icon: ShoppingCart, name: 'Supermarkets', description: 'Courses du quotidien', color: 'bg-green-100 text-green-600' },
    { icon: Heart, name: 'Pharmacies', description: 'Médicaments et produits santé', color: 'bg-red-100 text-red-600' },
    { icon: Gem, name: 'Pâtisseries', description: 'Desserts et douceurs', color: 'bg-purple-100 text-purple-600' },
    { icon: Flower, name: 'Fleurs', description: 'Bouquets et compositions', color: 'bg-pink-100 text-pink-600' },
    { icon: Gift, name: 'Cadeaux', description: 'Idées cadeaux originales', color: 'bg-blue-100 text-blue-600' }
  ]

  // Étapes de fonctionnement
  const steps = [
    {
      icon: Smartphone,
      title: 'Choisissez ce dont vous avez besoin',
      description: 'Sélectionnez parmi nos multiples catégories : repas, courses, pharmacie, cadeaux, et bien plus encore.'
    },
    {
      icon: CheckCircle,
      title: 'Passez commande en quelques clics',
      description: 'Ajoutez vos articles au panier et validez votre commande en toute sécurité.'
    },
    {
      icon: Truck,
      title: 'Votre livreur Livo arrive en un instant',
      description: 'Suivez en temps réel la livraison de votre commande directement à votre porte.'
    }
  ]

  // Chiffres clés
  const stats = [
    { number: '1000+', label: 'Clients satisfaits', icon: Users },
    { number: '200+', label: 'Commerçants partenaires', icon: Store },
    { number: '500+', label: 'Livreurs actifs', icon: Truck },
    { number: '10k+', label: 'Commandes livrées', icon: Package }
  ]

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-orange-50 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Tout ce dont vous avez besoin,{' '}
                <span className="text-primary-500">livré en un instant</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Avec Livo, commandez vos repas préférés, vos courses du quotidien, 
                vos médicaments ou même des cadeaux. Simple, rapide et à votre porte 
                en quelques minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/categories" 
                  className="bg-primary-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors text-center"
                >
                  Explorer Livo
                </Link>
                <Link 
                  to="/checkout" 
                  className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg font-semibold hover:bg-primary-500 hover:text-white transition-colors text-center"
                >
                  Commander maintenant
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img 
                src="/assets/img/livo-hero.png" 
                alt="Livo - Livraison multi-services"
                className="rounded-2xl shadow-2xl"
              />
              
              {/* Badge animé */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg"
              >
                <Truck className="text-primary-500" size={32} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Comment ça marche */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En 3 étapes simples, obtenez tout ce dont vous avez besoin livré directement chez vous
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-6"
              >
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <step.icon size={32} className="text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-primary-500 mb-2">0{index + 1}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Découvrez nos services dans votre ville
            </h2>
            <p className="text-xl text-gray-600">
              Tout ce dont vous avez besoin, disponible en livraison rapide
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${service.color}`}>
                  <service.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <Link 
                  to={`/categories/${service.name.toLowerCase()}`}
                  className="text-primary-500 font-semibold flex items-center gap-2 hover:text-primary-600 transition-colors"
                >
                  Découvrir <ArrowRight size={16} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Vos envies */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Vos envies à portée de main
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Pizza, burgers, salades, mais aussi produits frais ou soins essentiels. 
                Avec Livo, vous avez tout ce dont vous avez besoin, sans vous déplacer. 
                Notre réseau de commerçants locaux vous garantit qualité et fraîcheur.
              </p>
              <Link 
                to="/categories"
                className="bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-flex items-center gap-2"
              >
                Commander maintenant <ArrowRight size={20} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 gap-4"
            >
              <img 
                src="/assets/img/food-sample-1.jpg" 
                alt="Plats Livo" 
                className="rounded-lg shadow-lg"
              />
              <img 
                src="/assets/img/grocery-sample.jpg" 
                alt="Courses Livo" 
                className="rounded-lg shadow-lg mt-8"
              />
              <img 
                src="/assets/img/pharmacy-sample.jpg" 
                alt="Pharmacie Livo" 
                className="rounded-lg shadow-lg"
              />
              <img 
                src="/assets/img/gift-sample.jpg" 
                alt="Cadeaux Livo" 
                className="rounded-lg shadow-lg mt-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Chiffres clés */}
      <section className="py-20 bg-primary-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon size={48} className="mx-auto mb-4" />
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      {/* Section Rejoindre Livo */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Rejoignez l'aventure Livo
            </h2>
            <p className="text-xl text-gray-300">
              Devenez acteur de la révolution de la livraison au Mali
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl p-8 text-center"
            >
              <Truck size={64} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Devenez Livreur Livo 🚲</h3>
              <p className="mb-6">Rejoignez notre flotte de livreurs et gagnez en flexibilité.</p>
              <Link 
                to="/become-courier"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                En savoir plus
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-8 text-center"
            >
              <Store size={64} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-4">Devenez Partenaire Commerçant 🏪</h3>
              <p className="mb-6">Augmentez votre visibilité et développez votre chiffre d'affaires.</p>
              <Link 
                to="/become-partner"
                className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors inline-block"
              >
                En savoir plus
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section Actualités */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Actualités et Événements
            </h2>
            <p className="text-xl text-gray-600">
              Restez informé des dernières nouveautés Livo
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Article 1 */}
            <motion.article
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img 
                src="/assets/img/news-partnership.jpg" 
                alt="Nouveau partenariat"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm">Nouveauté</span>
                  <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">Partenariat</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Livo s'associe avec 10 nouveaux supermarchés
                </h3>
                <p className="text-gray-600 mb-4">
                  Extension de notre réseau pour mieux vous servir dans tout Bamako.
                </p>
                <Link 
                  to="/news/partenariats"
                  className="text-primary-500 font-semibold flex items-center gap-2 hover:text-primary-600 transition-colors"
                >
                  Lire la suite <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>

            {/* Article 2 */}
            <motion.article
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img 
                src="/assets/img/news-app.jpg" 
                alt="Nouvelle fonctionnalité"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">Innovation</span>
                  <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">App</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Nouvelle fonctionnalité : Suivi en temps réel
                </h3>
                <p className="text-gray-600 mb-4">
                  Suivez votre livreur en direct sur la carte avec notre nouvelle mise à jour.
                </p>
                <Link 
                  to="/news/suivi-temps-reel"
                  className="text-primary-500 font-semibold flex items-center gap-2 hover:text-primary-600 transition-colors"
                >
                  Lire la suite <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>

            {/* Article 3 */}
            <motion.article
              whileHover={{ y: -5 }}
              className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img 
                src="/assets/img/news-community.jpg" 
                alt="Impact communautaire"
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm">Communauté</span>
                  <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm">Impact</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Livo crée 200 emplois supplémentaires
                </h3>
                <p className="text-gray-600 mb-4">
                  Notre croissance bénéficie à l'économie locale avec de nouveaux postes de livreurs.
                </p>
                <Link 
                  to="/news/emplois"
                  className="text-primary-500 font-semibold flex items-center gap-2 hover:text-primary-600 transition-colors"
                >
                  Lire la suite <ArrowRight size={16} />
                </Link>
              </div>
            </motion.article>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}