import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
          .limit(5);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchProducts, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-white flex flex-col pt-10 px-6 sm:px-12"
        >
          {/* Close Button */}
          <div className="flex justify-end mb-8">
            <button 
              onClick={onClose}
              className="p-4 bg-gray-100 rounded-full hover:bg-black hover:text-white transition-all transform hover:rotate-90"
            >
              <X size={32} />
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            <div className="relative mb-12">
              <input 
                autoFocus
                type="text"
                placeholder="Search Sneakers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-4xl md:text-7xl font-black uppercase tracking-tighter border-b-8 border-black pb-4 outline-none placeholder:text-gray-100 focus:placeholder:text-gray-50 transition-all"
              />
              <div className="absolute right-0 bottom-4 text-gray-400">
                {isLoading ? (
                  <Loader2 className="animate-spin" size={48} />
                ) : (
                  <SearchIcon size={48} />
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              {results.length > 0 ? (
                results.map((product) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={product.id}
                  >
                    <Link 
                      to={`/store?brand=${product.brand}`}
                      onClick={onClose}
                      className="flex items-center justify-between p-6 border-4 border-black hover:bg-black hover:text-white transition-all group rounded-2xl"
                    >
                      <div className="flex items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden mr-6 border-2 border-black group-hover:border-white transition-colors">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{product.brand}</p>
                          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">{product.name}</h3>
                          <p className="font-black text-brand-red">{product.price} د.ج</p>
                        </div>
                      </div>
                      <ArrowRight className="transform group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </motion.div>
                ))
              ) : query.length >= 2 && !isLoading ? (
                <div className="text-center py-20 opacity-20">
                  <p className="text-4xl font-black uppercase tracking-tighter italic">No sneakers found for "{query}"</p>
                </div>
              ) : null}
            </div>

            {/* Helper Tags */}
            <div className="mt-12">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Trending Searches</p>
               <div className="flex flex-wrap gap-4">
                 {['Nike', 'Asics', 'New Balance', 'Jordan'].map(tag => (
                   <button 
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-6 py-3 border-2 border-black rounded-xl font-black uppercase text-xs hover:bg-black hover:text-white transition-all hover:-translate-y-1"
                   >
                     {tag}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
