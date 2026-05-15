import React, { useState, useEffect, useMemo } from 'react';
import heic2any from 'heic2any';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Plus,
  Search,
  MoreVertical,
  TrendingUp,
  AlertCircle,
  Truck,
  CheckCircle,
  Edit,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Box,
  ChevronRight,
  Filter,
  Download,
  X,
  Eye,
  MapPin,
  Navigation,
  Phone
} from 'lucide-react';
import { supabase, uploadImage, uploadImages, processImage, generatePreview } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Stable Sub-components (outside to prevent flickering on re-render) ---
const StatCard = ({ title, value, icon: Icon, color, trend, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl relative overflow-hidden group h-32 flex flex-col justify-center"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 rounded-full ${color}`} />
    <div className="flex justify-between items-center relative z-10">
      <div className="flex-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
        {loading ? (
          <div className="h-8 w-16 bg-gray-100 animate-pulse rounded-lg mt-2" />
        ) : (
          <h3 className="text-2xl md:text-3xl font-black mt-1 tracking-tighter">{value}</h3>
        )}
      </div>
      <div className={`p-3 md:p-4 rounded-xl ${color} text-white shadow-lg`}>
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
    </div>
    {!loading && trend && (
      <div className="mt-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-brand-green">
        <TrendingUp size={12} className="mr-1" /> {trend}
      </div>
    )}
  </motion.div>
);

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data States
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBrand, setFilterBrand] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isImageProcessing, setIsImageProcessing] = useState(false);
  const [isCloudProcessing, setIsCloudProcessing] = useState(false);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Data Fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      // استخدام RPC لجلب البيانات بأمان وتخطي RLS دون تسريب المفاتيح
      const { data: prodData, error: prodErr } = await supabase.rpc('get_admin_products');
      const { data: ordData, error: ordErr } = await supabase.rpc('get_admin_orders');

      if (prodErr) throw prodErr;
      if (ordErr) throw ordErr;

      console.log("Admin Data Fetch Success (via RPC)");
      setInventory(prodData || []);
      setOrders(ordData || []);
    } catch (err) {
      console.error("CRITICAL: Admin Data Fetch Failed:", err);
      alert(`خطأ في جلب البيانات: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const productSub = supabase
      .channel('admin_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchData)
      .subscribe();

    const orderSub = supabase
      .channel('admin_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(productSub);
      supabase.removeChannel(orderSub);
    };
  }, []);

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeInventory = Array.isArray(inventory) ? inventory : [];

    // تصفية الطلبات الصحيحة فقط (تحتوي على تفاصيل شحن)
    const validOrders = safeOrders.filter(o => o?.shipping_details);

    const totalOrders = validOrders.length;
    const pendingOrders = validOrders.filter(o => o?.status?.toLowerCase() === 'pending').length;
    const shippedOrders = validOrders.filter(o => o?.status?.toLowerCase() === 'shipped').length;

    const deliveredRevenue = validOrders
      .filter(o => o?.status?.toLowerCase() === 'delivered')
      .reduce((acc, curr) => acc + (parseFloat(curr?.total) || 0), 0);

    const totalProducts = safeInventory.length;

    // حساب المنتجات الأكثر مبيعاً من الطلبات
    const productSales = {};
    safeOrders.forEach(order => {
      let items = [];
      try {
        const parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        items = Array.isArray(parsed) ? parsed : [];
      } catch (e) { items = []; }

      items.forEach(item => {
        if (!item) return;
        const key = item.name || item.id || 'Unknown';
        if (!productSales[key]) {
          productSales[key] = {
            name: item.name || 'Unknown Item',
            count: 0,
            image: item.image || (safeInventory.find(p => p.id === item.id || p.name === item.name)?.image)
          };
        }
        productSales[key].count += (parseInt(item.quantity) || 1);
      });
    });

    const topSelling = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    const maxSalesCount = (topSelling.length > 0 && topSelling[0].count > 0) ? topSelling[0].count : 1;
    const topSellingData = topSelling.map(p => ({
      ...p,
      percentage: (p.count / maxSalesCount) * 100
    }));

    // حساب نشاط المبيعات لآخر 7 أيام
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayIndex = new Date().getDay();
    const last7Days = [];

    // ترتيب الأيام ليبدأ من قبل 6 أيام وينتهي باليوم الحالي
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push({
        name: days[d.getDay()],
        dateStr: d.toISOString().split('T')[0],
        value: 0
      });
    }

    validOrders.forEach(order => {
      const rawDate = order.created_at || order.date;
      if (!rawDate) return;

      const orderDate = new Date(rawDate);
      if (isNaN(orderDate.getTime())) return; // Skip invalid dates

      // تحويل لتوقيت الجزائر (إضافة ساعة إذا كان UTC)
      orderDate.setHours(orderDate.getHours() + 1);
      const dateStr = orderDate.toISOString().split('T')[0];

      const dayMatch = last7Days.find(d => d.dateStr === dateStr);
      if (dayMatch) {
        dayMatch.value += (parseFloat(order.total) || 0);
      }
    });

    // إيجاد أعلى قيمة لضبط مقياس الرسم البياني (Y-axis)
    const maxSales = Math.max(...last7Days.map(d => d.value), 1000);
    const chartData = last7Days.map(d => ({
      ...d,
      percentage: (d.value / maxSales) * 100
    }));

    return { totalOrders, pendingOrders, shippedOrders, deliveredRevenue, totalProducts, chartData, topSellingData };
  }, [orders, inventory]);

  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Phone', 'State', 'Address', 'Total_DZD', 'Status'];
    const rows = orders.map(o => [
      o.id,
      o.created_at || o.date,
      o.customer?.replace(/,/g, ' '),
      `'${o.phone}`,
      o.state,
      o.address?.replace(/,/g, ' '),
      o.total,
      o.status
    ]);

    let csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sel3a_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Product Form State ---
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Nike',
    price: '',
    oldPrice: '',
    description: '',
    category: 'Lifestyle',
    sizes: '40, 41, 42, 43, 44, 45',
    colors: 'Default',
    imageFile: null,
    imageUrl: '',
    mainImagePreview: '', // For browser-safe preview
    additionalImageFiles: [],
    additionalPreviews: [], // URL array for browser-safe preview
    images: [], // URL array
    rating: 5,
    reviews_count: 0,
    inventory: {}
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '', brand: 'Nike', price: '', oldPrice: '', description: '',
      category: 'Lifestyle', sizes: '40, 41, 42, 43, 44, 45',
      colors: 'Default',
      imageFile: null, imageUrl: '', mainImagePreview: '',
      additionalImageFiles: [], additionalPreviews: [], images: [],
      rating: 5, reviews_count: 0, inventory: {}
    });
    setIsEditing(false);
    setCurrentProductId(null);
    setShowForm(false);
  };

  const openCloudinaryWidget = (isMainImage = true) => {
    if (!window.cloudinary) {
      alert("الرجاء الانتظار حتى يتم تحميل أداة التنزيل.");
      return;
    }

    // Create the upload widget
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dp9idtrth',
        uploadPreset: 'sel3a sneakers',
        sources: ['local', 'url', 'camera', 'instagram'],
        multiple: !isMainImage,
        clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp', 'heic', 'heif'],
        maxImageFileSize: 10000000, // 10MB
        theme: 'minimal'
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          // Extract the URL and apply our ultimate auto-optimization params
          const urlParts = result.info.secure_url.split('/upload/');
          const optimizedUrl = `${urlParts[0]}/upload/f_auto,q_auto:best/${urlParts[1]}`;

          if (isMainImage) {
            setFormData(prev => ({
              ...prev,
              imageUrl: optimizedUrl,
              mainImagePreview: optimizedUrl
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, optimizedUrl]
            }));
          }
        }

        if (error) {
          console.error("Cloudinary Widget Error:", error);
        }
      }
    );

    // Open the widget
    widget.open();
  };

  const handleEditClick = async (product) => {
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      oldPrice: product.old_price || product.oldPrice || '',
      description: product.description || '',
      category: product.category || 'Lifestyle',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || ''),
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors || 'Default'),
      imageUrl: product.image,
      imageFile: null,
      mainImagePreview: product.image || '', // Existing image becomes preview directly
      images: product.images || [],
      additionalImageFiles: [],
      additionalPreviews: [],
      rating: product.rating || 5,
      reviews_count: product.reviews_count || 0,
      inventory: product.inventory || {}
    });

    setCurrentProductId(product.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Ensure the first image is the main one if images list is not empty but no main image is set
      let finalImageUrl = formData.imageUrl;
      let finalImages = [...formData.images];

      if (finalImages.length > 0 && !finalImageUrl) {
        finalImageUrl = finalImages[0];
      }
      if (finalImageUrl && !finalImages.includes(finalImageUrl)) {
        finalImages = [finalImageUrl, ...finalImages];
      }

      const productPayload = {
        name: formData.name,
        brand: formData.brand,
        price: parseFloat(formData.price),
        old_price: formData.oldPrice ? parseFloat(formData.oldPrice) : null,
        description: formData.description,
        category: formData.category,
        image: finalImageUrl,
        images: finalImages,
        sizes: formData.sizes.split(',').map(s => s.trim()),
        colors: formData.colors.split(',').map(c => c.trim()),
        rating: parseFloat(formData.rating) || 5,
        reviews_count: parseInt(formData.reviews_count) || 0,
        inventory: formData.inventory
      };

      if (isEditing) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', currentProductId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productPayload]);
        if (error) throw error;
      }

      alert(isEditing ? "Product updated!" : "Product added!");
      resetForm();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (confirm("Delete this product forever?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert(error.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      let trackingNumberToSet = null;


      // تحديث قاعدة البيانات عبر RPC لتخطي RLS بأمان (Status Update)
      const { error } = await supabase.rpc('update_order_status', {
        order_id_param: orderId,
        new_status_param: newStatus
      });

      if (error) throw error;

      // تحديث الواجهة محلياً فوراً ليشعر المستخدم بالسرعة
      setOrders(prev => prev.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            ...(trackingNumberToSet ? { tracking_number: trackingNumberToSet } : {})
          };
        }
        return order;
      }));

      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error("Status Update Failed:", err);
      alert("فشل تحديث الحالة: " + err.message);
    }
  };

  const toggleStockStatus = async (item) => {
    try {
      const isOut = item.inventory?.is_out_of_stock === true;
      const newInventory = { ...item.inventory, is_out_of_stock: !isOut };
      
      const { error } = await supabase.from('products').update({ inventory: newInventory }).eq('id', item.id);
      if (error) throw error;
      
      setInventory(prev => prev.map(p => p.id === item.id ? { ...p, inventory: newInventory } : p));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // --- Filtering ---
  const filteredInventory = useMemo(() => {
    const safeInv = Array.isArray(inventory) ? inventory : [];
    return safeInv.filter(p => {
      const matchesSearch = (p?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = filterBrand === 'All' || p?.brand === filterBrand;
      return matchesSearch && matchesBrand;
    });
  }, [inventory, searchQuery, filterBrand]);

  const filteredOrders = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    return safeOrders.filter(o => {
      const matchesSearch =
        (o?.customer?.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o?.phone?.includes(orderSearch)) ||
        (o?.id?.toString().includes(orderSearch));
      const matchesStatus = orderStatusFilter === 'All' || o?.status?.toLowerCase() === orderStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // --- Sub-components (JSX Helpers) ---
  const renderDashboard = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="إجمالي الطلبات" value={stats.totalOrders} icon={ShoppingCart} color="bg-brand-black" loading={loading} />
        <StatCard title="في الانتظار" value={stats.pendingOrders} icon={AlertCircle} color="bg-yellow-500" loading={loading} />
        <StatCard title="تم الشحن" value={stats.shippedOrders} icon={Truck} color="bg-blue-500" loading={loading} />
        <StatCard title="المبيعات" value={`${stats.deliveredRevenue.toLocaleString()} د.ج`} icon={DollarSign} color="bg-brand-green" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Performance Mock Chart */}
        <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black uppercase mb-8 flex items-center">
            <TrendingUp size={20} className="mr-2 text-brand-red" /> Sales Activity
          </h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {stats.chartData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${day.percentage}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={`w-full rounded-t-lg bg-gradient-to-t ${i === 6 ? 'from-brand-red to-red-400' : 'from-gray-800 to-gray-700'} border-x-2 border-t-2 border-black relative`}
                >
                  {/* Tooltip on Hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {day.value.toLocaleString()} د.ج
                  </div>
                </motion.div>
                <span className="text-[8px] font-black uppercase text-gray-400">{day.name}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-gray-400 border-t-2 border-dashed border-gray-100 pt-2">
            <span>Sales Activity (Last 7 Days)</span>
            <span className="text-brand-red">Real-time Data</span>
          </div>
        </div>

        {/* Top Selling Products (Replaces Quick Actions) */}
        <div className="bg-brand-black text-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full" />
          <h3 className="text-xl font-black uppercase mb-6 flex items-center">
            <TrendingUp size={20} className="mr-2 text-brand-red" /> Top Selling
          </h3>

          <div className="space-y-6 flex-grow">
            {stats.topSellingData.length > 0 ? stats.topSellingData.map((prod, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border-2 border-white/20 overflow-hidden bg-white/10">
                      <img src={prod.image || '/placeholder-shoe.jpg'} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{prod.name}</p>
                      <p className="text-[8px] text-gray-400 font-bold">{prod.count} Units Sold</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-brand-red">{Math.round(prod.percentage)}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prod.percentage}%` }}
                    className="h-full bg-brand-red"
                  />
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                <Box size={40} />
                <p className="text-[10px] font-black uppercase mt-2">No data yet</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
            <div className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Live Updates</div>
            <button onClick={() => setActiveTab('inventory')} className="text-[8px] font-black uppercase bg-brand-red px-3 py-1 rounded-full hover:scale-105 transition-transform">
              Manage Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-4 border-black rounded-2xl font-bold uppercase text-xs focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all"
            />
          </div>
          <select
            value={filterBrand}
            onChange={e => setFilterBrand(e.target.value)}
            className="px-4 py-3 border-4 border-black rounded-2xl font-bold uppercase text-xs outline-none bg-white cursor-pointer"
          >
            <option value="All">All Brands</option>
            <option value="Nike">Nike</option>
            <option value="Adidas">Adidas</option>
            <option value="New Balance">New Balance</option>
            <option value="Asics">Asics</option>
            <option value="Onitsuka Tiger">Onitsuka Tiger</option>
            <option value="ON RUNNING">ON RUNNING</option>
            <option value="Saucony">Saucony</option>
          </select>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full md:w-auto px-8 py-3 bg-brand-red text-white font-black uppercase tracking-widest rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-transform border-2 border-black"
        >
          Add Product
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border-4 border-black rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b-4 border-black font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
              <tr>
                <th className="p-4 md:p-6 text-[8px] md:text-[10px]">SNEAKER</th>
                <th className="p-6 hidden md:table-cell text-[8px] md:text-[10px]">BRAND</th>
                <th className="p-4 md:p-6 text-[8px] md:text-[10px]">PRICE</th>
                <th className="p-4 md:p-6 text-[8px] md:text-[10px]">STOCK</th>
                <th className="p-4 md:p-6 text-right text-[8px] md:text-[10px]">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-50 font-bold uppercase text-sm">
              <AnimatePresence>
                {filteredInventory.map((item) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group border-b-2 border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 md:p-6 flex items-center">
                      <div className="relative w-10 h-10 md:w-16 md:h-16 mr-3 md:mr-6 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="relative z-10 w-full h-full rounded-xl border-2 border-black object-cover" />
                      </div>
                      <span className="tracking-tighter font-black text-[10px] md:text-sm">{item.name}</span>
                    </td>
                    <td className="p-6 hidden md:table-cell">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px]">{item.brand}</span>
                    </td>
                    <td className="p-6 hidden lg:table-cell text-gray-400">{item.category}</td>
                    <td className="p-4 md:p-6 font-black text-brand-red text-[10px] md:text-sm">{item.price} د.ج</td>
                    <td className="p-4 md:p-6">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {Object.entries(item.inventory || {}).map(([size, qty]) => (
                          <div key={size} className={`text-[8px] px-1.5 py-0.5 rounded border-2 font-black border-black/10 ${qty === 0 ? 'bg-red-50 text-red-500 border-red-100' : 'bg-gray-50 text-gray-400'}`}>
                            {size}:{qty}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-right space-x-1 md:space-x-2 flex justify-end items-center">
                      <button onClick={() => toggleStockStatus(item)} className={`p-2 border-2 rounded-lg transition-all scale-75 md:scale-100 ${item.inventory?.is_out_of_stock ? 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white' : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'}`} title={item.inventory?.is_out_of_stock ? 'إعادة للمخزون' : 'إخفاء (نفذت الكمية)'}>
                        {item.inventory?.is_out_of_stock ? <CheckCircle size={14} /> : <X size={14} />}
                      </button>
                      <button onClick={() => handleEditClick(item)} className="p-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all scale-75 md:scale-100">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDeleteProduct(item.id)} className="p-2 border-2 border-brand-red text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all scale-75 md:scale-100">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="absolute inset-0 bg-black bg-opacity-70"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-4xl bg-white border-8 border-black rounded-[3rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b-4 border-black flex justify-between items-center bg-gray-50">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{isEditing ? 'Edit Product' : 'New Sneaker'}</h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-200 rounded-full"><X size={32} /></button>
              </div>

              <form onSubmit={handleSubmitProduct} className="p-10 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column: Media */}
                  <div className="space-y-6">
                    <div className="aspect-square w-full bg-gray-100 border-4 border-black rounded-3xl flex items-center justify-center overflow-hidden relative group">
                      {isImageProcessing ? (
                        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center text-white z-50 transition-all duration-500">
                          <div className="relative mb-8">
                            {/* Professional Premium Spinner */}
                            <div className="w-20 h-20 border-4 border-white/10 border-t-brand-red rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Box className="text-white animate-pulse" size={24} />
                            </div>
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                              transition={{ repeat: Infinity, duration: 3 }}
                              className="absolute -top-2 -right-2 bg-brand-red text-white p-1.5 rounded-full shadow-lg"
                            >
                              <Plus size={16} />
                            </motion.div>
                          </div>

                          <div className="text-center space-y-3 px-6">
                            <h4 className="text-lg font-black uppercase tracking-tighter animate-pulse">
                              {isCloudProcessing ? 'جاري معالجة الصورة بأعلى جودة...' : 'جاري تحسين الصورة...'}
                            </h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[200px]">
                              {isCloudProcessing
                                ? 'تحويل HEIC متقدم عبر محرك Sharp السحابي ⚡'
                                : 'Applying Ultra-High Quality Optimization (WebP)'}
                            </p>
                          </div>

                          {/* Progress Line Mock */}
                          <div className="w-48 h-1 bg-white/10 rounded-full mt-10 overflow-hidden relative">
                            <motion.div
                              initial={{ left: '-100%' }}
                              animate={{ left: '100%' }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-brand-red to-transparent"
                            />
                          </div>
                        </div>
                      ) : null}
                      {formData.mainImagePreview ? (
                        <img src={formData.mainImagePreview} className="w-full h-full object-cover" />
                      ) : formData.imageUrl ? (
                        <img
                          src={formData.imageUrl}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // If primary fails (could be HEIC), fallback to a placeholder or hide
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <ImageIcon size={64} className="text-gray-300" />
                      )}
                      <button
                        type="button"
                        onClick={() => openCloudinaryWidget(true)}
                        className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-black uppercase w-full h-full"
                      >
                        <Plus size={48} className="mb-2" /> Change Main Image
                      </button>
                    </div>

                    {/* Additional Images Preview */}
                    <div className="grid grid-cols-4 gap-2">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-black">
                          <img src={img} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                      {formData.additionalPreviews.map((url, i) => (
                        <div key={'preview' + i} className="relative aspect-square rounded-lg overflow-hidden border-2 border-black border-dashed opacity-70">
                          <img src={url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Plus size={12} className="text-white" />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => openCloudinaryWidget(false)}
                        className="aspect-square rounded-lg border-2 border-black border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50 bg-white"
                      >
                        <Plus size={20} className="text-gray-400" />
                      </button>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 text-center tracking-widest">Multi-angle Photos: Upload up to 4+ angles</p>
                    <p className="text-[10px] uppercase font-bold text-gray-400 text-center tracking-widest">Recommended: Square format ratio</p>
                  </div>

                  {/* Right Column: Info */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Product Title</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Brand</label>
                        <select value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none cursor-pointer bg-white">
                          <option>Nike</option><option>Adidas</option><option>New Balance</option><option>Asics</option><option>Onitsuka Tiger</option><option>ON RUNNING</option><option>Saucony</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">New Price (د.ج)</label>
                        <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Old Price (د.ج)</label>
                        <input type="number" step="0.01" value={formData.oldPrice} onChange={e => setFormData({ ...formData, oldPrice: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" placeholder="Optional" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Available Sizes (Comma separated)</label>
                        <input type="text" value={formData.sizes} onChange={e => setFormData({ ...formData, sizes: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Rating (1-5)</label>
                        <input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Reviews Count</label>
                        <input type="number" value={formData.reviews_count} onChange={e => setFormData({ ...formData, reviews_count: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                    <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full border-4 border-black p-4 rounded-2xl font-bold outline-none"></textarea>
                  </div>

                  {/* Inventory Management Section */}
                  <div className="bg-gray-50 border-4 border-black border-dashed rounded-3xl p-6">
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Box size={16} className="text-brand-red" /> Stock Management (By Size)
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                      {formData.sizes.split(',').map(s => s.trim()).filter(s => s).map(size => (
                        <div key={size} className="space-y-1">
                          <label className="text-[10px] font-black text-center block bg-black text-white py-1 rounded-t-lg">SIZE {size}</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={formData.inventory[size] || 0}
                            onChange={(e) => setFormData({
                              ...formData,
                              inventory: {
                                ...formData.inventory,
                                [size]: parseInt(e.target.value) || 0
                              }
                            })}
                            className="w-full border-2 border-black p-2 rounded-b-lg font-black text-center outline-none focus:bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button disabled={isProcessing} className="w-full py-6 bg-brand-black text-white text-xl font-black uppercase tracking-[0.3em] rounded-3xl hover:bg-brand-red transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] disabled:opacity-50">
                    {isProcessing ? 'SENDING DATA...' : isEditing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderOrders = () => {
    return (
      <div className="bg-white border-4 border-black rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-8 border-b-4 border-black bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Order Management</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time incoming orders</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search Customer / Phone / ID..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full border-4 border-black p-3 pl-10 rounded-xl font-bold text-xs uppercase outline-none focus:bg-white bg-gray-100 transition-all"
              />
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="border-4 border-black p-3 rounded-xl font-bold text-xs uppercase outline-none cursor-pointer bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="shipped">🚚 Shipped</option>
              <option value="delivered">✅ Delivered</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>

            <button
              onClick={exportToCSV}
              className="p-3 bg-brand-green text-white border-4 border-black rounded-xl hover:bg-green-600 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 font-bold text-xs uppercase"
            >
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        {/* Orders Stats Quick View */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border-b-4 border-black">
          <div className="p-6 border-l-4 border-black bg-white flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-gray-400">Total Orders</span>
            <span className="text-3xl font-black">{stats.totalOrders}</span>
          </div>
          <div className="p-6 border-l-4 border-black bg-yellow-50 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-yellow-600">Pending</span>
            <span className="text-3xl font-black">{stats.pendingOrders}</span>
          </div>
          <div className="p-6 border-l-4 border-black bg-blue-50 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-blue-600">Shipped</span>
            <span className="text-3xl font-black">{stats.shippedOrders}</span>
          </div>
          <div className="p-6 bg-brand-green bg-opacity-10 flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-brand-green">Revenue</span>
            <span className="text-3xl font-black text-brand-green">{stats.deliveredRevenue.toLocaleString()} د.ج</span>
          </div>
        </div>

        <div className="overflow-x-auto lg:overflow-visible">
          {/* Table Header - Only visible on Desktop */}
          <table className="w-full text-left hidden lg:table">
            <thead className="bg-gray-50 border-b-4 border-black font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
              <tr>
                <th className="p-6">ID & DATE</th>
                <th className="p-6">CUSTOMER</th>
                <th className="p-6">ITEMS DETAILS</th>
                <th className="p-6">TOTAL</th>
                <th className="p-6 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-50 font-bold uppercase text-sm">
              {filteredOrders.map((order) => {
                let orderItems = [];
                try {
                  orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                } catch (e) { orderItems = []; }

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors border-b-2 border-gray-100">
                    <td className="p-6">
                      <div className="text-brand-red font-black text-sm">#{order.id?.toString().slice(-4)}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{order.date || order.created_at?.split('T')[0]?.slice(5) || 'N/A'}</div>
                    </td>
                    <td className="p-6">
                      <button onClick={() => setSelectedOrder(order)} className="font-black text-lg hover:text-brand-red transition-colors">
                        {order.customer || 'Guest'}
                      </button>
                      <div className="mt-1">
                        <a href={`tel:${order.phone}`} className="inline-flex items-center gap-1 text-[10px] bg-gray-100 px-2 py-0.5 rounded-full hover:bg-brand-red hover:text-white transition-all font-black">
                          <Phone size={10} /> {order.phone}
                        </a>
                      </div>
                      <div className="text-[10px] text-brand-red font-black mt-2 leading-tight">
                        {order.state}
                        <div className="text-gray-400 font-bold truncate max-w-xs">{order.address}</div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-2">
                        {orderItems.slice(0, 1).map((item, idx) => (
                          <div key={idx} className="flex items-center text-[11px] bg-white border-2 border-black p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {item.image && <img src={item.image} className="w-8 h-8 object-cover rounded border border-gray-200 mr-2" alt="" />}
                            <div>
                              <div className="font-black leading-none text-[10px]">{item.name}</div>
                              <div className="text-[8px] text-gray-400 mt-0.5 font-bold">SIZE: {item.size || item.selectedSize} | QTY: {item.quantity}</div>
                            </div>
                          </div>
                        ))}
                        {orderItems.length > 1 && <div className="text-[8px] font-black">+ {orderItems.length - 1} more items</div>}
                      </div>
                    </td>
                    <td className="p-6 font-black text-xl tracking-tighter">{order.total || 0} د.ج</td>
                    <td className="p-6 text-right">
                      <select
                        value={order.status?.toLowerCase() || 'pending'}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border-4 outline-none cursor-pointer transition-all ${order.status?.toLowerCase() === 'pending' ? 'bg-yellow-400 border-black' :
                          order.status?.toLowerCase() === 'shipped' ? 'bg-blue-400 text-white border-black' :
                            order.status?.toLowerCase() === 'delivered' ? 'bg-brand-green text-white border-black' :
                              'bg-gray-100 text-gray-400 border-gray-200'
                          }`}
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="shipped">🚚 Shipped</option>
                        <option value="delivered">✅ Delivered</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile Display: Order Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredOrders.map((order) => {
              let orderItems = [];
              try {
                orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
              } catch (e) { orderItems = []; }

              return (
                <div key={order.id} className="bg-white border-4 border-black p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-brand-red font-black text-xs uppercase">#{order.id?.toString().slice(-4)}</div>
                      <h4 onClick={() => setSelectedOrder(order)} className="text-xl font-black uppercase tracking-tighter mt-1">{order.customer || 'Guest'}</h4>
                      <a href={`tel:${order.phone}`} className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-gray-100 rounded-full text-xs font-black">
                        <Phone size={12} /> {order.phone}
                      </a>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-bold">{order.date || order.created_at?.split('T')[0] || 'N/A'}</div>
                      <div className="text-lg font-black mt-1">{order.total} د.ج</div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border-2 border-black/5">
                    <div className="text-[10px] font-black text-gray-400 uppercase mb-2">Location</div>
                    <p className="text-xs font-black text-brand-red">{order.state}</p>
                    <p className="text-[10px] font-bold text-gray-500 truncate">{order.address}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-gray-400 uppercase">Items</div>
                    <div className="flex flex-wrap gap-2">
                      {orderItems.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white border-2 border-black p-2 rounded-xl scale-90 origin-left">
                          {item.image && <img src={item.image} className="w-8 h-8 object-cover rounded shadow" />}
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase leading-none">{item.name?.slice(0, 15)}</span>
                            <span className="text-[8px] font-bold text-brand-red mt-1">SZ: {item.size || item.selectedSize}</span>
                          </div>
                        </div>
                      ))}
                      {orderItems.length > 2 && <span className="text-[10px] font-black text-gray-400">+{orderItems.length - 2} more</span>}
                    </div>
                  </div>

                  <div className="pt-2">
                    <select
                      value={order.status?.toLowerCase() || 'pending'}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full p-4 rounded-2xl text-xs font-black uppercase border-4 border-black outline-none bg-white shadow-sm appearance-none text-center"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="shipped">🚚 Shipped</option>
                      <option value="delivered">✅ Delivered</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
          {orders.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <ShoppingCart size={64} className="text-gray-200 mb-4" />
              <div className="font-black text-gray-300 uppercase italic text-2xl tracking-tighter">No orders in the vault yet...</div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Marketing efforts will pay off soon!</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderOrderModal = () => (
    <AnimatePresence>
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrder(null)}
            className="absolute inset-0 bg-black/70"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white border-8 border-black w-full max-w-2xl rounded-[3rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
          >
            <div className="p-8 border-b-8 border-black bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Order Info</h3>
                <p className="font-bold text-gray-400 text-xs">#{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-3 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide text-right" dir="rtl">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">الزبون</label>
                  <p className="text-xl font-black">{selectedOrder.customer}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">الهاتف</label>
                  <p className="text-xl font-black">{selectedOrder.phone}</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-4 border-black rounded-2xl">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">العنوان / البلدية</label>
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-brand-red mt-1" />
                  <div>
                    <p className="font-black text-lg">{selectedOrder.state}</p>
                    <p className="font-bold text-gray-600">{selectedOrder.address}</p>
                    {selectedOrder.shipping_details && (
                      <div className="mt-2 flex gap-2">
                        <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black uppercase">
                          {(() => {
                            try {
                              const sd = typeof selectedOrder.shipping_details === 'string' ? JSON.parse(selectedOrder.shipping_details) : selectedOrder.shipping_details;
                              return sd?.type === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب';
                            } catch (e) { return 'نوع شحن غير معروف'; }
                          })()}
                        </span>
                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-black">
                          {(() => {
                            try {
                              const sd = typeof selectedOrder.shipping_details === 'string' ? JSON.parse(selectedOrder.shipping_details) : selectedOrder.shipping_details;
                              return (sd?.fee || 0) + ' د.ج شحن';
                            } catch (e) { return '0 د.ج'; }
                          })()}
                        </span>
                      </div>
                    )}
                    {selectedOrder.tracking_number && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-brand-red text-white px-3 py-1 rounded-full text-xs font-black tracking-widest shadow-sm">
                        <Truck size={12} />
                        TRACKING: {selectedOrder.tracking_number}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-4">ملخص المنتجات</label>
                <div className="space-y-4 text-left" dir="ltr">
                  {(typeof selectedOrder.items === 'string' ? JSON.parse(selectedOrder.items) : selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b-4 border-black border-dashed pb-4">
                      <div className="flex items-center gap-4">
                        {item.image && <img src={item.image} className="w-16 h-16 object-cover rounded-xl border-2 border-black" />}
                        <div>
                          <p className="font-black">{item.name}</p>
                          <p className="text-xs font-bold text-gray-400 uppercase">Size: {item.size || item.selectedSize} | Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-black text-lg">{item.price * item.quantity} د.ج</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t-8 border-black">
                <span className="text-2xl font-black uppercase tracking-tighter">Grand Total / الإجمالي</span>
                <span className="text-4xl font-black text-brand-red">{selectedOrder.total} د.ج</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-brand-black selection:bg-brand-red selection:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r-8 border-black flex flex-col justify-between hidden lg:flex relative z-[50]">
        <div>
          <div className="p-10 border-b-8 border-black flex flex-col items-center justify-center bg-gray-50">
            <div
              className="flex flex-col items-center justify-center font-street text-2xl tracking-[3px] uppercase leading-tight cursor-pointer group"
              onClick={() => navigate('/')}
              style={{ fontWeight: 900 }}
            >
              <div className="flex flex-col items-center justify-center filter drop-shadow-[2px_4px_4px_rgba(0,0,0,0.1)]">
                <span
                  className="text-white"
                  style={{ WebkitTextStroke: '1.2px black' }}
                >
                  SEL3A
                </span>
                <span className="text-[#E61E25] mt-1">
                  SNEAKERS
                </span>
              </div>
            </div>
            <p className="text-[10px] uppercase font-black text-gray-400 mt-4 tracking-[0.4em]">Vault Command</p>
          </div>

          <nav className="p-8 space-y-4">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
              { id: 'inventory', icon: Package, label: 'Inventory' },
              { id: 'orders', icon: ShoppingCart, label: 'Orders' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center p-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-4 relative overflow-hidden ${activeTab === item.id
                  ? 'bg-brand-black text-white border-black shadow-[6px_6px_0px_0px_rgba(230,30,37,1)]'
                  : 'text-gray-400 border-transparent hover:border-gray-100'
                  }`}
              >
                <item.icon size={20} className={`mr-4 ${activeTab === item.id ? 'text-brand-red' : ''}`} />
                {item.label}
                {activeTab === item.id && (
                  <motion.div layoutId="activeTab" className="absolute right-4 w-2 h-2 bg-brand-red rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 border-t-8 border-black bg-gray-50">
          <button
            onClick={() => { if (confirm('Exit Vault?')) navigate('/'); }}
            className="w-full flex items-center justify-center p-5 bg-white border-4 border-black text-brand-red font-black uppercase tracking-widest text-sm hover:bg-brand-red hover:text-white transition-all rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <Settings size={20} className="mr-4" />
            Quit Session
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-8 md:px-12 py-10 flex justify-between items-center bg-white border-b-4 border-black">
          <div className="lg:hidden">
            <button onClick={() => navigate('/')} className="p-2 border-2 border-black rounded-lg bg-gray-50 font-black text-[10px] uppercase">
              <span className="text-brand-red">SEL3A</span>
            </button>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-sm">{activeTab}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-2">Sel3a Sneakers Admin v2.0</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center bg-gray-100 border-4 border-black rounded-2xl px-6 py-3">
              <span className="w-3 h-3 bg-brand-green rounded-full mr-3 animate-pulse" />
              <div className="flex flex-col">
                <span className="font-black uppercase text-[10px] leading-tight">Live System</span>
                <span className="font-bold text-[9px] text-gray-500">{currentTime.toLocaleTimeString('en-US', { hour12: false })} | {currentTime.toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-32 md:pb-24 scrollbar-hide">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'orders' && renderOrders()}
          </motion.div>
        </div>
        {renderOrderModal()}

        {/* Mobile Navbar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black p-3 flex justify-around items-center z-[100] shadow-[0_-10px_20px_rgba(0,0,0,0.1)]">
          {[
            { id: 'dashboard', icon: LayoutDashboard },
            { id: 'inventory', icon: Package },
            { id: 'orders', icon: ShoppingCart },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-2xl transition-all ${activeTab === item.id
                ? 'bg-brand-black text-white shadow-lg scale-110'
                : 'text-gray-300'
                }`}
            >
              <item.icon size={item.id === 'inventory' ? 20 : 22} />
            </button>
          ))}
          <button
            onClick={() => navigate('/')}
            className="p-3 text-brand-red"
          >
            <X size={24} />
          </button>
        </div>
      </main>
    </div>
  );
};

export default Admin;


