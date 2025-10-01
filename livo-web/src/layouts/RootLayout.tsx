import { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'

interface RootLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export const RootLayout = ({ 
  children, 
  title = "Livo - Food, Grocery & Delivery App",
  description = "Livo - Livraison de nourriture, courses et plus au Mali. Connectez-vous avec les meilleurs commerçants locaux."
}: RootLayoutProps) => {
  return (
    <>
      <Helmet>
        {/* SEO Meta Tags */}
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Favicon */}
        <link rel="icon" type="image/svg+xml" href="/livo-logo.svg" />
        
        {/* Google Fonts - Déjà dans index.html mais redondance pour SEO */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Styles externes nécessaires depuis QuickEat */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/magnific-popup.js/1.1.0/magnific-popup.css"
          integrity="sha512-WEQNv9d3+sqyHjrqUZobDhFARZDko2wpWdfcpv44lsypsSuMO0kHGd3MQ8rrsBn/Qa39VojphdU6CMkpJUmDVw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        
        {/* Structured Data pour SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FoodEstablishment",
            "name": "Livo",
            "description": description,
            "url": window.location.origin,
            "servesCuisine": ["Malienne", "Internationale"],
            "areaServed": "Mali"
          })}
        </script>
      </Helmet>

      {/* Structure de layout */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </>
  )
}