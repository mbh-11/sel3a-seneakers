import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import {
  User,
  MapPin,
  Plus,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Home,
  Phone,
  Tag,
  ShoppingBag,
  Rocket,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { supabase } from '../supabaseClient';
import { trackPurchase, trackInitiateCheckout, trackViewContent } from '../pixelEvents';
import { algeriaData, wilayaNames } from '../data/algeriaData';
import { getShippingCost, hasOfficeDelivery } from '../data/shippingData';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

const Slider = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={images.length > 1}
        className="w-full aspect-square rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={getOptimizedImageUrl(img)}
              alt={`product-${i}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}

        {/* Custom Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/95 rounded-full text-black shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95">
              <ChevronLeft size={24} />
            </button>
            <button className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/95 rounded-full text-black shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </Swiper>

      <style dangerouslySetInnerHTML={{
        __html: `
        .swiper-pagination-bullet { background: #000 !important; }
        .swiper-pagination-bullet-active { background: #2563eb !important; width: 20px; border-radius: 4px; }
      `}} />
    </div>
  );
};

const SearchableSelect = ({ options, value, onChange, placeholder, icon: Icon, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedOption = options.find(opt => opt.id.toString() === (value || '').toString());

  const filteredOptions = options.filter(opt =>
    opt.name_ar.includes(searchTerm) ||
    opt.name_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.id.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-1.5 relative">
      <label className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-2 flex items-center gap-2">
        {Icon && <Icon size={12} className="text-blue-500" />} {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-gray-50/50 border-2 rounded-2xl p-4 text-sm font-bold flex justify-between items-center cursor-pointer transition-all ${isOpen ? 'border-blue-400 bg-white shadow-lg shadow-blue-50' : 'border-transparent hover:border-gray-100'}`}
      >
        <span className={selectedOption ? 'text-black' : 'text-gray-300'}>
          {selectedOption ? (typeof selectedOption.id === 'number' ? `${selectedOption.id} - ${selectedOption.name_ar}` : selectedOption.name_ar) : placeholder}
        </span>
        <Plus size={16} className={`transition-transform duration-300 ${isOpen ? 'text-blue-500 rotate-45' : 'text-gray-300'}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[100] bottom-full md:bottom-auto md:top-full -left-10 -right-10 mb-2 md:mb-0 md:mt-2 bg-white border-2 border-blue-100 rounded-[2.5rem] shadow-2xl overflow-hidden shadow-blue-500/10"
          >
            <div className="p-3 border-b border-gray-50 bg-gray-50/50">
              <input
                type="text"
                placeholder="ابحث هنا..."
                className="w-full bg-white p-3 rounded-xl text-right text-xs outline-none border border-gray-100 focus:border-blue-300 transition-all font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => (
                  <div
                    key={opt.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-4 text-right font-bold text-xs cursor-pointer border-b border-gray-50 last:border-0 transition-colors ${value && value.toString() === opt.id.toString() ? 'bg-blue-500 text-white' : 'hover:bg-blue-50/50 text-gray-700'}`}
                  >
                    {typeof opt.id === 'number' && <span className="ml-2 font-black text-blue-600">{opt.id} - </span>}
                    {opt.name_ar} <span className="text-[10px] opacity-50 ml-1">/ {opt.name_en}</span>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-400 text-xs font-bold italic">لا توجد نتائج مطابقة</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const sendTelegramNotification = async (orderData) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram Notification: Token or Chat ID is missing');
    return;
  }

  const itemsList = orderData.items.map(item => `• <b>${item.name}</b> (مقاس: ${item.size})`).join('\n');

  const text = `🔔 <b>طلبية جديدة من المتجر!</b>\n\n👤 <b>الاسم:</b> ${orderData.customer}\n📞 <b>الهاتف:</b> ${orderData.phone}\n📍 <b>الولاية:</b> ${orderData.state}\n📌 <b>العنوان/البلدية:</b> ${orderData.address}\n👟 <b>المنتجات:</b>\n${itemsList}\n\n💰 <b>السعر الإجمالي:</b> ${orderData.total} د.ج 🔥`;

  const sendMessage = async () => {
    return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
  };

  try {
    if (orderData.photoUrl) {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: orderData.photoUrl,
          caption: text,
          parse_mode: 'HTML'
        })
      });
      const data = await res.json();
      if (!data.ok) {
        console.warn('Telegram sendPhoto failed, falling back to sendMessage', data);
        await sendMessage();
      }
    } else {
      await sendMessage();
    }
  } catch (error) {
    console.error('Error sending Telegram notification with photo:', error);
    try {
      await sendMessage();
    } catch (fallbackError) {
      console.error('Error in fallback sendMessage:', fallbackError);
    }
  }
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { cartItems, cartTotal, clearCart } = useCart();

  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(!!id && !location.state?.product);
  const [productError, setProductError] = useState(false);

  useEffect(() => {
    if (id && !location.state?.product) {
      const fetchProduct = async () => {
        setIsLoadingProduct(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          console.error("Product fetch error:", error);
          setProductError(true);
        } else {
          setFetchedProduct(data);
        }
        setIsLoadingProduct(false);
      };

      fetchProduct();
    }
  }, [id, location.state?.product]);

  // Decide which product to checkout (Direct buy from state or Cart)
  const directProduct = location.state?.product || fetchedProduct;
  const itemsToBuy = directProduct ? [directProduct] : cartItems;

  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    wilaya: '',
    commune: '',
    deliveryType: 'home',
  });

  const [phoneError, setPhoneError] = useState('');

  const activeProduct = directProduct || cartItems[0];
  const itemsPriceTotal = itemsToBuy.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // Calculate potential shipping fees
  const homeFee = formData.wilaya ? getShippingCost(formData.wilaya, 'home') : 0;
  const officeFee = (formData.wilaya && hasOfficeDelivery(formData.wilaya)) ? getShippingCost(formData.wilaya, 'office') : 0;

  const shippingFee = formData.deliveryType === 'home' ? homeFee : officeFee;
  const total = itemsPriceTotal + (formData.wilaya ? shippingFee : 0);

  useEffect(() => {
    if (itemsToBuy.length > 0 && !isSuccess) {
      trackInitiateCheckout(total, itemsToBuy);

      // If we have a specific product being viewed, track it
      if (activeProduct) {
        trackViewContent(activeProduct);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.wilaya && !hasOfficeDelivery(formData.wilaya)) {
      setFormData(prev => ({ ...prev, deliveryType: 'home' }));
    }
  }, [formData.wilaya]);

  const validatePhone = (phone) => /^(05|06|07)\d{8}$/.test(phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');

    if (!selectedSize) {
      alert('يرجى اختيار مقاس الحذاء أولاً');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setPhoneError('رقم الهاتف غير صحيح');
      return;
    }

    if (!formData.wilaya || !formData.commune) {
      alert('يرجى إكمال معلومات العنوان');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      customer: formData.fullName,
      phone: formData.phone,
      state: `${formData.wilaya} - ${wilayaNames[formData.wilaya]}`,
      address: `${formData.commune || ''} (${formData.deliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'})`,
      total: total,
      status: 'pending',
      items: itemsToBuy.map(item => ({
        id: item.id,
        name: item.name,
        size: item.selectedSize || selectedSize,
        price: item.price,
        quantity: item.quantity || 1
      })),
      photoUrl: activeProduct?.images?.[0] || activeProduct?.image || null,
      shipping_details: {
        type: formData.deliveryType,
        fee: shippingFee
      },
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const { data, error } = await supabase.rpc('process_order_with_stock', {
        order_data_param: orderData
      });

      if (error) throw error;

      // Send Telegram Notification
      await sendTelegramNotification(orderData);

      trackPurchase(total, itemsToBuy, {
        phone: formData.phone,
        firstName: formData.fullName,
        state: formData.wilaya
      });

      setOrderNumber(data?.order_id || 'SNC-' + Math.floor(Math.random() * 90000));
      clearCart();
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert(`فشل الطلب: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 flex flex-col items-center justify-center text-center font-street" dir="rtl">
        <CheckCircle size={80} className="text-green-500 mb-6" />
        <h1 className="text-4xl font-black mb-2">تم الطلب بنجاح!</h1>
        <p className="text-gray-500 font-bold mb-8">رقم طلبك هو #{orderNumber}</p>
        <button onClick={() => navigate('/')} className="bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest">
          العودة للمتجر
        </button>
      </div>
    );
  }

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center font-street bg-gray-50" dir="rtl">
        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-black">جاري تحميل المنتج...</h2>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4" dir="rtl">
        <h1 className="text-2xl font-black mb-4">المنتج غير موجود</h1>
        <p className="text-gray-500 mb-8">عذراً، لم نتمكن من العثور على هذا المنتج.</p>
        <Link to="/store" className="bg-black text-white px-10 py-4 rounded-full font-bold">العودة للمتجر</Link>
      </div>
    );
  }

  if (!activeProduct) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4" dir="rtl">
        <h1 className="text-2xl font-black mb-8">سلتك فارغة</h1>
        <Link to="/store" className="bg-black text-white px-10 py-4 rounded-full font-bold">تصفح المتجر</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32 font-street" dir="rtl">
      <Helmet>
        <title>{activeProduct.name} | Sel3a Sneakers</title>
        <meta property="og:title" content={activeProduct.name} />
        <meta property="og:description" content={activeProduct.description || "حذاء رياضي كلاسيكي بتصميم عصري وألوان جذابة."} />
        <meta property="og:image" content={activeProduct.images?.[0] || activeProduct.image} />
        <meta property="og:url" content={`https://sel3a-sneakers.vercel.app/product/${activeProduct.id}`} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Sel3a Sneakers" />
        <meta property="product:price:amount" content={activeProduct.price} />
        <meta property="product:price:currency" content="DZD" />
      </Helmet>

      {/* 1. Product Display & Slider */}
      <div className="bg-white pb-4 shadow-sm border-b rounded-b-[2.5rem]">
        <div className="px-4 pt-4 relative">
          {/* Back Button moved outside Slider for better control */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-8 left-8 z-50 p-3 bg-white rounded-full border border-gray-100 shadow-xl text-black active:scale-90 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <Slider images={activeProduct.images || [activeProduct.image]} />
        </div>

        <div className="px-6 pt-3 text-right space-y-1">
          {/* 1. Name */}
          <h1 className="text-xl font-black leading-tight uppercase text-black">
            {activeProduct.name}
          </h1>

          {/* 2. Description */}
          <p className="text-[11px] font-bold text-gray-400 leading-relaxed max-w-[90%] mr-0 ml-auto">
            {activeProduct.description || "حذاء رياضي كلاسيكي بتصميم عصري وألوان جذابة."}
          </p>

          {/* 3. Price Area */}
          <div className="flex items-center flex-row-reverse justify-end gap-3 pt-0">
            <div className="flex flex-col gap-1 items-end">
              <p className="price-label">سعر</p>
              <p className="checkout-price">
                <span className="amount">{String(activeProduct.price).replace(/د\.ج/g, '').trim()}</span>
                <span className="currency"> د.ج</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-red-50 text-brand-red text-[11px] font-black px-2 py-1 rounded-full border border-red-100">
                -19%
              </span>
              <p className="text-xs text-gray-300 line-through font-bold opacity-80">
                {Math.round(activeProduct.price * 1.2)} د.ج
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-3 space-y-4">


        {/* 3. Order Form */}
        <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border-2 border-blue-100/50 border-dashed space-y-5 relative active:ring-4 active:ring-blue-50 transition-all">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl text-blue-600 mb-0.5">
            <Tag size={15} />
            <span className="text-[10px] font-black uppercase tracking-widest">إتمام الطلب</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-2">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                required
                type="text"
                placeholder="إسمك بالكامل"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-gray-50 border-2 border-transparent rounded-[1.25rem] p-4 pr-12 font-bold outline-none focus:bg-white focus:border-blue-200 transition-all text-right"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-2">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input
                required
                type="tel"
                placeholder="رقم الهاتف"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full bg-gray-50 border-2 ${phoneError ? 'border-red-500' : 'border-transparent'} rounded-[1.25rem] p-4 pr-12 font-bold outline-none focus:bg-white focus:border-blue-200 transition-all text-right`}
              />
            </div>
            {phoneError && <p className="text-red-500 text-[10px] font-bold px-2">{phoneError}</p>}
          </div>

          {/* 3. Size Selection (Moved here) */}
          <div className="space-y-3 mt-4">
            <label className="text-gray-400 font-black text-[10px] uppercase tracking-widest px-2">اختر المقاس (Size)</label>
            <div className="flex flex-wrap gap-2 px-1">
              {activeProduct.sizes.map(size => {
                const isOut = (activeProduct.inventory?.[size] || 0) === 0;
                return (
                  <button
                    key={size}
                    type="button"
                    disabled={isOut}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] h-12 rounded-xl border-2 font-black transition-all ${selectedSize === size
                      ? 'bg-black text-white border-black shadow-lg shadow-black/20 scale-105'
                      : isOut
                        ? 'bg-gray-50 text-gray-200 border-gray-50 cursor-not-allowed line-through opacity-40'
                        : 'bg-white border-gray-100 hover:border-black text-gray-600'
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SearchableSelect
              label="الولاية"
              placeholder="اختر الولاية"
              icon={MapPin}
              options={Object.keys(wilayaNames).sort().map(id => ({
                id,
                name_ar: `${id} - ${wilayaNames[id]}`
              }))}
              value={formData.wilaya}
              onChange={(val) => setFormData({ ...formData, wilaya: val, commune: '' })}
            />
            <SearchableSelect
              label="البلدية"
              placeholder="اختر البلدية"
              icon={MapPin}
              options={(algeriaData[formData.wilaya] || []).map(name => ({
                id: name,
                name_ar: `${formData.wilaya} - ${name}`
              }))}
              value={formData.commune}
              onChange={(val) => setFormData({ ...formData, commune: val })}
            />
          </div>

          <div className="pt-2">
            <div className="bg-gray-100/50 p-1.5 rounded-[1.5rem] flex gap-2 border border-gray-100">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryType: 'home' })}
                className={`flex-1 py-3 px-2 rounded-2xl font-black transition-all flex flex-col items-center justify-center gap-1 ${formData.deliveryType === 'home' ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-gray-400'}`}
              >
                <div className="flex items-center gap-2">
                  <Home size={16} />
                  <span className="text-[10px] uppercase tracking-widest">للمنزل</span>
                </div>
                {formData.wilaya && (
                  <span className={`text-[11px] font-normal ${formData.deliveryType === 'home' ? 'text-brand-red font-bold' : 'text-gray-400'}`}>
                    + {homeFee} د.ج
                  </span>
                )}
              </button>

              <button
                type="button"
                disabled={formData.wilaya && !hasOfficeDelivery(formData.wilaya)}
                onClick={() => setFormData({ ...formData, deliveryType: 'office' })}
                className={`flex-1 py-3 px-2 rounded-2xl font-black transition-all flex flex-col items-center justify-center gap-1 ${formData.deliveryType === 'office' ? 'bg-white text-black shadow-lg shadow-black/5' : 'text-gray-400 disabled:opacity-30'}`}
              >
                <div className="flex items-center gap-2">
                  <Package size={16} />
                  <span className="text-[10px] uppercase tracking-widest">للمكتب</span>
                </div>
                {formData.wilaya && hasOfficeDelivery(formData.wilaya) && (
                  <span className={`text-[11px] font-normal ${formData.deliveryType === 'office' ? 'text-brand-red font-bold' : 'text-gray-400'}`}>
                    + {officeFee} د.ج
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Payment & Checkout Footer */}
        <div className="bg-white p-6 pb-12 rounded-[2.5rem] shadow-[0_-20px_40px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex justify-between items-center px-4">
            <span className="text-gray-400 text-xs font-black uppercase tracking-widest">المجموع الإجمالي:</span>
            <div className="text-right">
              <p className="checkout-price">
                <span className="amount">{String(total).replace(/د\.ج/g, '').trim()}</span>
                <span className="currency"> د.ج</span>
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">(شراء آمن • شامل التوصيل)</p>
            </div>
          </div>

          {/* New Bubble Button Design */}
          <div className="relative pt-8 pb-4">
            {/* Top Red Badge */}
            <motion.div
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute -top-1 right-8 z-30 bg-brand-red text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-red-500/30 border-2 border-white rotate-6"
            >
              ماذا تنتظر؟! 🔥
            </motion.div>



            {/* Main Outer Bubble (Pulsing blue) */}
            <div className={`relative w-full p-2.5 rounded-[3rem] bg-gradient-to-r from-blue-600 to-blue-500 shadow-2xl shadow-blue-500/20 active:scale-95 transition-all animate-pulse-soft`}>

              {/* Inner Dotted Bubble */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-white rounded-[2.5rem] py-6 px-4 border-2 border-dashed border-blue-400 flex items-center justify-center gap-4 group transition-all"
              >
                {isSubmitting ? (
                  <span className="text-blue-600 font-black animate-pulse">جاري المعالجة...</span>
                ) : (
                  <>
                    <ShoppingBag className="text-blue-600 group-hover:scale-110 transition-transform" size={28} />
                    <span className="text-2xl font-black text-black tracking-tight">اطلب الآن</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-300 tracking-[0.1em] text-center px-4">
            تخفيض محدود • الدفع عند الاستلام في كل مكان 🇩🇿
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
