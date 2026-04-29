import React from 'react';
import { Instagram, Twitter, Facebook, ArrowUpRight, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-brand-black text-white pt-24 pb-12 overflow-hidden border-t-8 border-brand-red">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">

          <div className="space-y-8">
            <div className="flex items-center font-bold text-[30px] sm:text-[50px] md:text-[68px] tracking-wide leading-none italic whitespace-nowrap" style={{ fontFamily: "'Boogaloo', cursive", transform: 'skewX(-5deg)' }}>
              <span 
                style={{ 
                  color: 'white',
                  WebkitTextStroke: '1px black',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                  paddingRight: '1px'
                }}
              >
                sel3a.
              </span>
              <span 
                style={{ 
                  color: '#FF0000',
                  WebkitTextStroke: '1px black',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
                }}
              >
                sneakers
              </span>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm leading-relaxed">
              The premier collective for high-end sneakers and streetwear culture. Authenticity guaranteed.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/sel3a.sneakers/" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-white/20 hover:bg-white hover:text-black transition-all"><Instagram size={20} /></a>
              <a href="https://www.facebook.com/profile.php?id=61585424595946" target="_blank" rel="noopener noreferrer" className="p-3 border-2 border-white/20 hover:bg-white hover:text-black transition-all"><Facebook size={20} /></a>
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
            <h4 className="text-2xl mb-8 flex items-center">CONTACT <ArrowUpRight className="ml-2 opacity-50" size={18} /></h4>
            <ul className="space-y-6 font-bold uppercase text-[10px] tracking-[0.2em]">
              <li className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="p-2 border-2 border-white/10 group-hover:border-brand-red transition-all">
                  <Phone size={14} className="group-hover:text-brand-red" />
                </div>
                0560909229
              </li>
              <li className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="p-2 border-2 border-white/10 group-hover:border-brand-red transition-all">
                  <MapPin size={14} className="group-hover:text-brand-red" />
                </div>
                Kolea, Tipaza, Algeria
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic text-center md:text-left">
              &copy; 2026 SEL3A SNEAKERS. INSPIRED BY STREET CULTURE.
            </p>
            
            <div className="flex items-center gap-3 bg-white/5 py-1.5 px-4 rounded-full border border-white/10">
              <p className="text-[10px] font-bold text-gray-300 m-0">
                Développé par MBH
              </p>
              <div className="w-[1px] h-3 bg-white/20"></div>
              <a href="mailto:midojf4@gmail.com" className="text-gray-400 hover:text-white transition-all hover:scale-110" title="Email MBH">
                <Mail size={12} />
              </a>
              <a href="https://www.instagram.com/mido_mesbah_11/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:scale-110" title="Instagram MBH">
                <Instagram size={12} />
              </a>
            </div>
          </div>
          
          <div className="flex space-x-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
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
