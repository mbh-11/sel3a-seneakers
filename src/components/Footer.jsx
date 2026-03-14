import React from 'react';
import { Instagram, Twitter, Facebook, ArrowUpRight, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-black text-white pt-24 pb-12 overflow-hidden border-t-8 border-brand-red">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          
          <div className="space-y-8">
             <img src="/src/assets/logo.jpg" alt="Logo" className="h-20 grayscale brightness-200" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm leading-relaxed">
               The premier collective for high-end sneakers and streetwear culture. Authenticity guaranteed.
             </p>
             <div className="flex space-x-4">
               <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-white/20 hover:bg-white hover:text-black transition-all"><Instagram size={20} /></a>
               <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-white/20 hover:bg-white hover:text-black transition-all"><Twitter size={20} /></a>
               <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-white/20 hover:bg-white hover:text-black transition-all"><Facebook size={20} /></a>
             </div>
          </div>

          <div>
            <h4 className="text-2xl mb-8 flex items-center">EXPLORE <ArrowUpRight className="ml-2 opacity-50" size={18} /></h4>
            <ul className="space-y-4 font-black uppercase text-sm tracking-widest">
              <li><Link to="/store" className="hover:text-brand-red transition-colors text-gray-400 hover:text-white">The Vault</Link></li>
              <li><Link to="/store?brand=Nike" className="hover:text-brand-red transition-colors text-gray-400 hover:text-white">Nike Drops</Link></li>
              <li><Link to="/store?brand=New Balance" className="hover:text-brand-red transition-colors text-gray-400 hover:text-white">New Balance</Link></li>
              <li><Link to="/store?brand=Asics" className="hover:text-brand-red transition-colors text-gray-400 hover:text-white">Asics</Link></li>
            </ul>
          </div>

          <div>
             <h4 className="text-2xl mb-8 flex items-center">SUPPORT <ArrowUpRight className="ml-2 opacity-50" size={18} /></h4>
             <ul className="space-y-4 font-black uppercase text-sm tracking-widest">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Order Tracking</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-2xl mb-8 flex items-center">CONTACT <ArrowUpRight className="ml-2 opacity-50" size={18} /></h4>
            <ul className="space-y-6 font-bold uppercase text-[10px] tracking-[0.2em]">
              <li className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="p-2 border-2 border-white/10 group-hover:border-brand-red transition-all">
                  <Phone size={14} className="group-hover:text-brand-red" />
                </div>
                +213 555 00 00 00
              </li>
              <li className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="p-2 border-2 border-white/10 group-hover:border-brand-red transition-all">
                  <MapPin size={14} className="group-hover:text-brand-red" />
                </div>
                ALGIERS, ALGERIA
              </li>
              <li className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors text-[9px]">
                <div className="p-2 border-2 border-white/10 group-hover:border-brand-red transition-all">
                  <Mail size={14} className="group-hover:text-brand-red" />
                </div>
                CONTACT@SEL3A.PRO
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
             <h4 className="text-2xl mb-8">SQAUD</h4>
             <div className="flex flex-col space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                  Join our sneakerhead collective for exclusive drops and private events.
                </p>
                <p className="text-[10px] font-black text-brand-red uppercase tracking-tighter">
                  Custom Web Solutions for Startups
                </p>
                <div className="flex gap-2">
                  <input type="email" placeholder="EMAIL" className="bg-transparent border-2 border-white/20 p-3 text-xs font-black outline-none focus:border-white transition-colors uppercase flex-1" />
                  <button className="bg-white text-black px-4 font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-colors">OK</button>
                </div>
             </div>
          </div>

        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">
              &copy; 2026 SEL3A SNEAKERS. INSPIRED BY STREET CULTURE.
            </p>
            <p className="text-[10px] font-bold text-gray-500">
              DEVELOPED WITH ❤️ BY <a href="https://github.com/mido" target="_blank" rel="noopener noreferrer" className="hover:text-brand-red transition-colors cursor-pointer">MIDO</a>
            </p>
          </div>
          <div className="flex space-x-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>

      </div>

      {/* Decorative Text */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden whitespace-nowrap opacity-5 pointer-events-none select-none translate-y-1/2">
        <span className="text-[300px] font-black leading-none uppercase">SEL3A SNEAKERS SEL3A SNEAKERS</span>
      </div>
    </footer>
  );
};

export default Footer;
