import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { ChevronLeft, Truck, CheckCircle, Smartphone, MapPin, Navigation, Package, PhoneCall, ShieldCheck, Clock, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { trackPurchase, trackInitiateCheckout } from '../pixelEvents';
import { algeriaData } from '../data/algeriaData';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, updateQuantity, updateSize } = useCart();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: '',
    deliveryType: 'home', // 'home' or 'office'
  });

  const shippingFee = formData.deliveryType === 'home' ? 600 : 400;
  const finalTotal = cartTotal + shippingFee;

  // Meta Pixel: Initiate Checkout
  useEffect(() => {
    if (cartItems.length > 0 && !isSuccess) {
      trackInitiateCheckout(finalTotal, cartItems);
    }
  }, []);

  const validatePhone = (phone) => {
    const regex = /^(05|06|07)\d{8}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');

    if (!validatePhone(formData.phone)) {
      setPhoneError('رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05، 06، أو 07 ويتكون من 10 أرقام)');
      return;
    }

    setIsSubmitting(true);
    const generatedOrderNum = 'SNC-' + Math.floor(Math.random() * 90000 + 10000);
    setOrderNumber(generatedOrderNum);
    
    const orderData = {
      customer: `${formData.firstName} ${formData.lastName}`,
      phone: formData.phone,
      state: formData.wilaya,
      address: `${formData.commune}, ${formData.address} (${formData.deliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'})`,
      total: finalTotal,
      status: 'pending',
      items: JSON.stringify(cartItems),
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const { data, error } = await supabase.from('orders').insert([orderData]).select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Meta Pixel Tracking
      trackPurchase(cartTotal, cartItems);
      
      clearCart();
      setIsSuccess(true);
    } catch (err) {
      console.error("Full Error Object:", err);
      alert(`عذراً، فشل الطلب: ${err.message || 'تأكد من إعدادات قاعدة البيانات'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 text-right" dir="rtl">
        <div className="max-w-3xl mx-auto">
          {/* Header Animation */}
          <div className="text-center mb-16">
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-32 h-32 bg-brand-red text-white rounded-full mb-8 shadow-glow-red"
            >
              <CheckCircle size={64} strokeWidth={3} />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-6xl md:text-7xl font-black uppercase tracking-tighter mb-4"
            >
              تم استلام <span className="text-brand-red">طلبك!</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-bold text-gray-500 uppercase tracking-widest"
            >
              رقم الطلب: <span className="text-black">#{orderNumber}</span>
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Step 1: Confirmation */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="border-4 border-black p-8 bg-gray-50 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-brand-red" />
              <PhoneCall className="mb-4 text-brand-red" size={32} />
              <h3 className="text-2xl font-black mb-2 uppercase">مكالمة التأكيد</h3>
              <p className="text-sm font-bold text-gray-600 leading-relaxed">
                سيتصل بك فريقنا خلال الـ 24 ساعة القادمة لتأكيد معلومات الشحن والمقاس المختار. يرجى إبقاء هاتفك قريباً.
              </p>
            </motion.div>

            {/* Step 2: Shipping */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="border-4 border-black p-8 bg-gray-50 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-2 h-full bg-black" />
              <Package className="mb-4 text-black" size={32} />
              <h3 className="text-2xl font-black mb-2 uppercase">تجهيز الشحنة</h3>
                <p className="text-sm font-bold text-gray-600 leading-relaxed">
                  بمجرد التأكيد الهاتفي، سيتم تغليف سنيكرز الخاص بك بعناية وشحنها عبر خدمة ZR {formData.deliveryType === 'home' ? 'إلى منزلك' : 'إلى مكتب الشحن المختار'}.
                </p>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap justify-center gap-8 py-8 border-y-4 border-dashed border-gray-200 mb-12"
          >
            <div className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400">
              <ShieldCheck size={18} className="ml-2 text-green-500" /> 100% أصلي
            </div>
            <div className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400">
              <Clock size={18} className="ml-2 text-brand-red" /> شحن سريع
            </div>
            <div className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400">
              <MapPin size={18} className="ml-2 text-black" /> 69 ولاية
            </div>
          </motion.div>

          <div className="text-center">
            <Link to="/" className="btn-primary inline-flex items-center text-xl py-5 px-12 group">
                العودة للتسوق <ChevronLeft className="ml-3 group-hover:translate-x-2 transition-transform rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black mb-8 uppercase tracking-tighter">سلة التسوق فارغة</h1>
        <Link to="/store" className="btn-primary">تصفح المتجر</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-16 text-right" dir="rtl">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link to="/store" className="inline-flex items-center text-sm font-black uppercase tracking-widest mb-12 hover:text-brand-red flex-row-reverse">
          <ChevronLeft size={20} className="rotate-180 ml-2" /> العودة للتسوق
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Shipping Form */}
          <div className="order-2 lg:order-1">
            <h2 className="text-5xl font-black mb-10 uppercase tracking-tighter border-b-8 border-black pb-4 inline-block">تفاصيل الشحن</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">الاسم</label>
                  <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="الاسم الشخصي" className="border-4 border-black p-4 font-bold placeholder:text-gray-300 focus:bg-gray-50 outline-none w-full text-lg" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest">اللقب</label>
                  <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="الاسم العائلي" className="border-4 border-black p-4 font-bold placeholder:text-gray-300 focus:bg-gray-50 outline-none w-full text-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest flex items-center justify-end">رقم الهاتف <Smartphone size={14} className="ml-1" /></label>
                <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="05 / 06 / 07XXXXXXXX" className={`border-4 border-black p-4 font-bold placeholder:text-gray-300 focus:bg-gray-50 outline-none w-full text-lg text-left ${phoneError ? 'border-brand-red' : ''}`} />
                {phoneError && <p className="text-brand-red text-xs font-bold mt-1">{phoneError}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest flex items-center justify-end">الولاية <MapPin size={14} className="ml-1" /></label>
                  <select required value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value, commune: ''})} className="border-4 border-black p-4 font-bold focus:bg-gray-50 outline-none w-full text-lg appearance-none bg-white">
                    <option value="">اختر الولاية</option>
                    {algeriaData.map(wilaya => (
                      <option key={wilaya.id} value={wilaya.name_en}>{wilaya.name_ar} - {wilaya.name_en}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest flex items-center justify-end">البلدية <Navigation size={14} className="ml-1" /></label>
                  <select required value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} disabled={!formData.wilaya} className="border-4 border-black p-4 font-bold focus:bg-gray-50 outline-none w-full text-lg appearance-none bg-white disabled:opacity-50">
                    <option value="">اختر البلدية</option>
                    {formData.wilaya && algeriaData.find(w => w.name_en === formData.wilaya)?.communes.map(commune => (
                      <option key={commune.name_en} value={commune.name_en}>{commune.name_ar} - {commune.name_en}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery Type Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest">نوع التوصيل</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, deliveryType: 'home'})}
                    className={`border-4 border-black p-5 font-black uppercase tracking-widest flex items-center justify-between transition-all ${
                      formData.deliveryType === 'home' 
                      ? 'bg-brand-red text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' 
                      : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    <span>التوصيل للمنزل</span>
                    {formData.deliveryType === 'home' && <CheckCircle size={20} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, deliveryType: 'office'})}
                    className={`border-4 border-black p-5 font-black uppercase tracking-widest flex items-center justify-between transition-all ${
                      formData.deliveryType === 'office' 
                      ? 'bg-brand-black text-white shadow-[4px_4px_0px_0px_rgba(230,30,37,1)] -translate-y-1' 
                      : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    <span>استلام من المكتب</span>
                    {formData.deliveryType === 'office' && <CheckCircle size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest">
                  {formData.deliveryType === 'home' ? 'العنوان بالتفصيل' : 'اختر مكتب الشحن الأقرب إليك'}
                </label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder={formData.deliveryType === 'home' ? "الحي، رقم المنزل، المعالم القريبة..." : "اسم المكتب، العنوان التقريبي..."} className="border-4 border-black p-4 font-bold placeholder:text-gray-300 focus:bg-gray-50 outline-none w-full text-lg" />
              </div>

              <div className="pt-6">
                <div className="border-4 border-black p-6 flex justify-between items-center bg-brand-black text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                   <div className="flex items-center">
                    <CheckCircle className="ml-3 text-brand-red" />
                    <div>
                      <p className="font-black uppercase text-xl">الدفع عند الاستلام (COD)</p>
                      <p className="text-xs font-bold text-gray-400">إدفع نقداً بمجرد وصول طلبك</p>
                    </div>
                  </div>
                </div>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-brand-red text-white py-6 text-2xl font-black uppercase tracking-tighter hover:bg-black transition-all transform active:scale-95 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 mt-10">
                {isSubmitting ? 'جاري الإرسال...' : `تأكيد الطلب - الدفع عند الاستلام · ${finalTotal} د.ج`}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="order-1 lg:order-2">
            <div className="bg-gray-50 p-10 border-4 border-black h-fit sticky top-32">
              <h2 className="text-3xl font-black mb-8 border-b-4 border-black pb-2 inline-block">ملخص الطلب</h2>
              <div className="space-y-6 mb-10 overflow-auto max-h-[40vh] pl-4">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-center flex-row-reverse border-b-2 border-dashed border-gray-200 pb-4">
                    <div className="flex items-center space-x-4 flex-row-reverse">
                      <div className="w-20 h-20 bg-white border-2 border-black flex-shrink-0 ml-4">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-right">
                        <p className="font-black uppercase text-sm leading-tight mb-2">{item.name}</p>
                        
                        <div className="flex items-center justify-end space-x-4 flex-row-reverse">
                          {/* Size Selection */}
                          <div className="flex items-center">
                            <span className="text-[10px] font-black mr-2">SZ:</span>
                            <select 
                              value={item.selectedSize}
                              onChange={(e) => updateSize(item.id, item.selectedSize, item.selectedColor, e.target.value)}
                              className="bg-white border-2 border-black p-1 text-[10px] font-black uppercase outline-none"
                            >
                              {(Array.isArray(item.sizes) ? item.sizes : []).map(sz => (
                                <option key={sz} value={sz}>{sz}</option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity Selection */}
                          <div className="flex items-center border-2 border-black bg-white">
                            <button 
                              type="button"
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                              className="px-2 py-1 hover:bg-gray-100 border-r-2 border-black"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-3 text-xs font-black">{item.quantity}</span>
                            <button 
                              type="button"
                              onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                              className="px-2 py-1 hover:bg-gray-100 border-l-2 border-black"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="font-black text-xl">{item.price * item.quantity} د.ج</span>
                  </div>
                ))}
              </div>

              <div className="border-t-4 border-black pt-8 space-y-4">
                <div className="flex justify-between font-bold uppercase text-sm tracking-widest">
                  <span>المجموع الفرعي</span>
                  <span>{cartTotal} د.ج</span>
                </div>
                <div className="flex justify-between font-bold uppercase text-sm tracking-widest">
                  <span>الشحن ({formData.deliveryType === 'home' ? 'توصيل للمنزل' : 'استلام مكتب'})</span>
                  <span>{shippingFee} د.ج</span>
                </div>
                <div className="flex justify-between items-end pt-6 border-t-2 border-dashed border-gray-300">
                  <span className="text-2xl font-black uppercase">الإجمالي الكلي</span>
                  <span className="text-5xl font-black text-brand-red">{finalTotal} د.ج</span>
                </div>
              </div>
              
              <div className="mt-10 bg-black text-white p-4 text-[10px] font-black uppercase tracking-[0.3em] text-center">
                SEL3A SNEAKERS · 100% REGIT CHECKOUT
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
