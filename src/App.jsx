import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import SauconyPage from './pages/SauconyPage';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import SplashIntro from './components/SplashIntro';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import Wishlist from './pages/Wishlist';
import PixelTracker from './components/PixelTracker';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          {/* Track all page views */}
          <PixelTracker />
          
          {/* The Intro Screen Overlay */}

        {loading && <SplashIntro onComplete={() => setLoading(false)} />}
        
        {/* We render the main app immediately, but lock scroll if loading */}
        <div className={`min-h-screen flex flex-col ${loading ? 'h-screen overflow-hidden' : ''}`}>
          <Navbar />
          <CartSidebar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/store" element={<BrandPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/:id" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/saucony" element={<SauconyPage />} />
              
              {/* Secret Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route 
                path="/secret-dashboard" 
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  </AuthProvider>
  );
}

export default App;
