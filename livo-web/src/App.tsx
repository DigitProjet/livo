import { Fragment, useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { PreLoader } from './layouts/PreLoader'
import { RootLayout } from './layouts/RootLayout'
import './styles/global.css'

// Pages (à importer depuis vos pages)
import { HomePage } from './pages/HomePage'
import { PageNotFound } from './pages/PageNotFound'

function App() {
  const [preLoader, setPreLoader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPreLoader(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (preLoader) {
    return <PreLoader />
  }

  return (
    <Fragment>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/restaurant/:id" element={<RestaurantPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/tracking/:orderId" element={<TrackingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} /> */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </RootLayout>
    </Fragment>
  )
}

export default App