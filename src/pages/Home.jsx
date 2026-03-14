import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { ArrowRight, ShoppingBag, Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import { trackAddToCart, trackAddToWishlist } from '../pixelEvents';

const Home = () => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [carouselProducts, setCarouselProducts] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      // Fetch 5 latest products for Carousel
      const { data: carData, error: carError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (carError) {
        console.error("Error fetching carousel products:", carError);
      } else {
        setCarouselProducts(carData || []);
      }

      // Fetch 4 products for Featured Drops
      const { data: featData, error: featError } = await supabase
        .from('products')
        .select('*')
        .limit(8); // Fetch more to select differently maybe, or just limit 4
      
      if (featError) {
        console.error("Error fetching featured products:", featError);
      } else {
        setFeaturedProducts(featData?.slice(0, 4) || []);
      }
    };

    fetchHomeData();

    const subscription = supabase
      .channel('public:products_home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        fetchHomeData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden border-b-8 border-black">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-red -skew-x-12 translate-x-1/4 z-0 hidden lg:block" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 text-center lg:text-left">
              <motion.span 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block bg-black text-white px-4 py-1 text-sm font-black uppercase tracking-widest mb-6"
              >
                New Collection 2026
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-7xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-8"
              >
                Step Into <br /> <span className="text-brand-red">Style.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-600 font-bold uppercase tracking-widest mb-10 max-w-lg mx-auto lg:mx-0"
              >
                The ultimate destination for sneakerheads. Nike, New Balance, and Asics - limited editions only.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/store" className="btn-primary group flex items-center justify-center">
                  Shop Now <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                </Link>
              
              </motion.div>
            </div>
            
            <div className="lg:w-1/2 mt-16 lg:mt-0 relative">
              <HeroCarousel products={carouselProducts} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Nike Card */}
            <Link 
              to="/store?brand=Nike" 
              className="bg-[#E63946] border-[3px] border-black p-12 text-center group hover:brightness-110 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:scale-[1.03] cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
            >
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter group-hover:scale-110 transition-transform">NIKE</h2>
              <p className="font-bold text-white/80 uppercase tracking-widest text-xs">JUST DO IT.</p>
            </Link>

            {/* New Balance Card */}
            <Link 
              to="/store?brand=New Balance" 
              className="bg-[#8E9091] border-[3px] border-black p-12 text-center group hover:brightness-110 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:scale-[1.03] cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
            >
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter group-hover:scale-110 transition-transform">NEW BALANCE</h2>
              <p className="font-bold text-white/80 uppercase tracking-widest text-xs">FEARLESSLY INDEPENDENT.</p>
            </Link>

            {/* Asics Card */}
            <Link 
              to="/store?brand=Asics" 
              className="bg-[#003399] border-[3px] border-black p-12 text-center group hover:brightness-110 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all transform hover:scale-[1.03] cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
            >
              <h2 className="text-5xl font-black text-white mb-4 tracking-tighter group-hover:scale-110 transition-transform">ASICS</h2>
              <p className="font-bold text-white/80 uppercase tracking-widest text-xs">ANIMA SANA IN CORPORE SANO.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-brand-red font-black uppercase tracking-widest text-sm mb-4 block">Our Curation</span>
            <h2 className="text-6xl md:text-7xl leading-none">Featured Drops</h2>
          </div>
          <Link to="/store" className="font-black uppercase border-b-4 border-black pb-2 hover:text-brand-red hover:border-brand-red transition-all">
            See All Releases
          </Link>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
             hidden: { opacity: 0 },
             visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </section>

      {/* Banner Section */}
      <section className="bg-brand-red py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-5xl md:text-9xl text-white mb-8">FRESH STYLES <br /> ARRIVING WEEKLY</h2>
          <p className="text-white font-black text-2xl uppercase mb-12 opacity-80">Don't miss the next drop.</p>
 
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none select-none overflow-hidden whitespace-nowrap">
           <div className="text-[200px] font-black leading-none text-white animate-pulse">SNEAKERS SNEAKERS SNEAKERS</div>
        </div>
      </section>
    </div>
  );
};

export default Home;
