import React, { useState, useEffect, useMemo } from 'react';
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
import { supabase, uploadImage } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();

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

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Data Fetching
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: prodData, error: prodErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      const { data: ordData, error: ordErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      
      if (prodErr) throw prodErr;
      if (ordErr) throw ordErr;

      setInventory(prodData || []);
      setOrders(ordData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
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
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status?.toLowerCase() === 'pending').length;
    const shippedOrders = orders.filter(o => o.status?.toLowerCase() === 'shipped').length;
    
    // المبيعات المحققة (للطلبيات المسلمة فقط)
    const deliveredRevenue = orders
      .filter(o => o.status?.toLowerCase() === 'delivered')
      .reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
    
    const totalProducts = inventory.length;
    
    // Top Brand
    const brandCounts = inventory.reduce((acc, p) => {
      acc[p.brand] = (acc[p.brand] || 0) + 1;
      return acc;
    }, {});
    const topBrand = Object.keys(brandCounts).sort((a,b) => brandCounts[b] - brandCounts[a])[0] || 'N/A';

    return { totalOrders, pendingOrders, shippedOrders, deliveredRevenue, totalProducts, topBrand };
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
    description: '',
    category: 'Lifestyle',
    sizes: '40, 41, 42, 43, 44, 45',
    colors: 'Default',
    imageFile: null,
    imageUrl: '',
    rating: 5,
    reviews_count: 0
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '', brand: 'Nike', price: '', description: '', 
      category: 'Lifestyle', sizes: '40, 41, 42, 43, 44, 45', 
      colors: 'Default', imageFile: null, imageUrl: '',
      rating: 5, reviews_count: 0
    });
    setIsEditing(false);
    setCurrentProductId(null);
    setShowForm(false);
  };

  const handleEditClick = (product) => {
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      description: product.description || '',
      category: product.category || 'Lifestyle',
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes,
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors,
      imageUrl: product.image,
      imageFile: null,
      rating: product.rating || 5,
      reviews_count: product.reviews_count || 0
    });
    setCurrentProductId(product.id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    let finalImageUrl = formData.imageUrl;

    try {
      if (formData.imageFile) {
        const uploadedUrl = await uploadImage(formData.imageFile);
        if (uploadedUrl) finalImageUrl = uploadedUrl;
      }

      const productPayload = {
        name: formData.name,
        brand: formData.brand,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        image: finalImageUrl,
        sizes: formData.sizes.split(',').map(s => s.trim()),
        colors: formData.colors.split(',').map(c => c.trim()),
        rating: parseFloat(formData.rating) || 5,
        reviews_count: parseInt(formData.reviews_count) || 0
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
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) alert(error.message);
  };

  // --- Filtering ---
  const filteredInventory = inventory.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = filterBrand === 'All' || p.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.customer?.toLowerCase().includes(orderSearch.toLowerCase())) || 
      (o.phone?.includes(orderSearch)) ||
      (o.id?.toString().includes(orderSearch));
    const matchesStatus = orderStatusFilter === 'All' || o.status?.toLowerCase() === orderStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // --- Sub-components ---
  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 rounded-full ${color}`} />
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{title}</p>
          <h3 className="text-3xl font-black mt-2 tracking-tighter">{value}</h3>
        </div>
        <div className={`p-4 rounded-xl ${color} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-widest text-brand-green">
          <TrendingUp size={14} className="mr-1" /> {trend}
        </div>
      )}
    </motion.div>
  );

  const renderDashboard = () => (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي الطلبات" value={stats.totalOrders} icon={ShoppingCart} color="bg-brand-black" />
        <StatCard title="في الانتظار (Contact)" value={stats.pendingOrders} icon={AlertCircle} color="bg-yellow-500" />
        <StatCard title="تم الشحن" value={stats.shippedOrders} icon={Truck} color="bg-blue-500" />
        <StatCard title="المبيعات المحققة" value={`${stats.deliveredRevenue.toLocaleString()} د.ج`} icon={DollarSign} color="bg-brand-green" trend="Delivered only" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Performance Mock Chart */}
        <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-xl font-black uppercase mb-8 flex items-center">
            <TrendingUp size={20} className="mr-2 text-brand-red" /> Sales Activity
          </h3>
          <div className="h-48 flex items-end justify-between gap-2">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className={`flex-1 rounded-t-lg bg-gradient-to-t ${i === 6 ? 'from-brand-red to-red-400' : 'from-gray-100 to-gray-200'} border-x-2 border-t-2 border-black`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-gray-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Quick Links / Tasks */}
        <div className="bg-brand-black text-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-5 rounded-full" />
          <h3 className="text-xl font-black uppercase mb-6">Quick Actions</h3>
          <div className="space-y-4">
            <button onClick={() => { setActiveTab('inventory'); setShowForm(true); }} className="w-full flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-2xl hover:bg-opacity-20 transition-all border border-white border-opacity-20">
              <span className="flex items-center font-bold uppercase tracking-widest text-sm">
                <Plus size={18} className="mr-3 text-brand-red" /> New Product
              </span>
              <ChevronRight size={18} />
            </button>
            <button onClick={() => setActiveTab('orders')} className="w-full flex items-center justify-between p-4 bg-white bg-opacity-10 rounded-2xl hover:bg-opacity-20 transition-all border border-white border-opacity-20">
              <span className="flex items-center font-bold uppercase tracking-widest text-sm">
                <Eye size={18} className="mr-3 text-blue-400" /> Review Orders
              </span>
              <ChevronRight size={18} />
            </button>
            <div className="p-4 border-2 border-dashed border-white border-opacity-20 rounded-2xl text-center">
              <p className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-[0.2em]">Promotion Status</p>
              <span className="inline-block px-3 py-1 bg-brand-green rounded-full text-[10px] font-black uppercase">Active: Spring Sale 15%</span>
            </div>
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
            <option value="New Balance">New Balance</option>
            <option value="Asics">Asics</option>
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
                <th className="p-6">SNEAKER</th>
                <th className="p-6">BRAND</th>
                <th className="p-6">CATEGORY</th>
                <th className="p-6">PRICE</th>
                <th className="p-6 text-right">ACTION</th>
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
                    <td className="p-6 flex items-center">
                      <div className="relative w-16 h-16 mr-6 flex-shrink-0">
                        <div className="absolute inset-0 bg-gray-100 rounded-2xl border-2 border-black group-hover:rotate-6 transition-transform" />
                        <img src={item.image} alt={item.name} className="relative z-10 w-full h-full rounded-2xl border-2 border-black object-cover" />
                      </div>
                      <span className="tracking-tighter font-black">{item.name}</span>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px]">{item.brand}</span>
                    </td>
                    <td className="p-6 text-gray-400">{item.category}</td>
                    <td className="p-6 font-black text-brand-red">{item.price} د.ج</td>
                    <td className="p-6 text-right space-x-2">
                      <button onClick={() => handleEditClick(item)} className="p-2 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteProduct(item.id)} className="p-2 border-2 border-brand-red text-brand-red rounded-lg hover:bg-brand-red hover:text-white transition-all">
                        <Trash2 size={16} />
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
              className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
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
                      {formData.imageFile ? (
                        <img src={URL.createObjectURL(formData.imageFile)} className="w-full h-full object-cover" />
                      ) : formData.imageUrl ? (
                        <img src={formData.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={64} className="text-gray-300" />
                      )}
                      <label className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-black uppercase">
                        <Plus size={48} className="mb-2" /> Change Image
                        <input type="file" hidden accept="image/*" onChange={e => setFormData({...formData, imageFile: e.target.files[0]})} />
                      </label>
                    </div>
                    <p className="text-[10px] uppercase font-bold text-gray-400 text-center tracking-widest">Recommended: Square format ratio</p>
                  </div>

                  {/* Right Column: Info */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Product Title</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Brand</label>
                        <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none cursor-pointer bg-white">
                          <option>Nike</option><option>New Balance</option><option>Asics</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Price (د.ج)</label>
                        <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Available Sizes (Comma separated)</label>
                        <input type="text" value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Rating (1-5)</label>
                        <input type="number" step="0.1" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Reviews Count</label>
                        <input type="number" value={formData.reviews_count} onChange={e => setFormData({...formData, reviews_count: e.target.value})} className="w-full border-4 border-black p-4 rounded-2xl font-black uppercase outline-none focus:bg-gray-50" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                    <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-4 border-black p-4 rounded-2xl font-bold outline-none"></textarea>
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

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b-4 border-black font-black text-[10px] uppercase tracking-[0.2em] text-gray-400">
              <tr>
                <th className="p-6">ID & DATE</th>
                <th className="p-6">CUSTOMER & LOCATION</th>
                <th className="p-6">ITEMS DETAILS</th>
                <th className="p-6">TOTAL</th>
                <th className="p-6">STATUS</th>
                <th className="p-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-gray-50 font-bold uppercase text-sm">
              {filteredOrders.map((order) => {
                let orderItems = [];
                try {
                  orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                } catch (e) {
                  console.error("Error parsing items:", e);
                }

                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors border-b-2 border-gray-100">
                    <td className="p-6">
                      <div className="text-brand-red font-black">#{order.id?.toString().slice(-4)}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{order.date || order.created_at?.split('T')[0] || 'N/A'}</div>
                    </td>
                    <td className="p-6">
                      <div className="font-black tracking-tighter text-lg">{order.customer || 'Guest'}</div>
                      <div className="flex flex-col mt-1">
                        <span className="text-[10px] text-brand-red font-black tracking-widest flex items-center">
                          <MapPin size={10} className="mr-1" /> {order.state || 'N/A'} (الولاية)
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold tracking-widest flex items-center mt-1">
                          <Navigation size={10} className="mr-1" /> {order.address ? order.address.split(',')[0] : 'No Address'} (البلدية)
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1 italic font-medium truncate max-w-[200px] flex items-center">
                          {order.phone || 'No Phone'}
                          {order.phone && (
                            <a 
                              href={`tel:${order.phone}`} 
                              className="ml-2 p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title="اتصال مباشر"
                            >
                              <Phone size={10} strokeWidth={3} />
                            </a>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-2">
                        {orderItems.map((item, idx) => (
                          <div key={idx} className="flex items-center text-[11px] bg-white border-2 border-black p-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {item.image && <img src={item.image} className="w-8 h-8 object-cover rounded border border-gray-200 mr-2" alt="" />}
                            <div>
                              <div className="font-black leading-none">{item.name || 'Unknown Product'}</div>
                              <div className="text-[9px] text-gray-400 mt-1">SIZE: <span className="text-black">{item.selectedSize || 'N/A'}</span> | QTY: <span className="text-black">{item.quantity || 1}</span></div>
                            </div>
                          </div>
                        ))}
                        {orderItems.length === 0 && <span className="text-gray-300 italic">No items found</span>}
                      </div>
                    </td>
                    <td className="p-6 font-black text-xl tracking-tighter">{order.total || 0} د.ج</td>
                    <td className="p-6">
                      <div className={`inline-block px-4 py-2 rounded-xl text-[10px] font-black uppercase text-center border-4 ${
                        order.status?.toLowerCase() === 'pending' ? 'bg-yellow-400 text-black border-black' :
                        order.status?.toLowerCase() === 'shipped' ? 'bg-blue-400 text-white border-black' :
                        order.status?.toLowerCase() === 'delivered' ? 'bg-brand-green text-white border-black' :
                        'bg-gray-100 text-gray-400 border-gray-200'
                      } shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all`}>
                        {order.status || 'Pending'}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          value={order.status?.toLowerCase() || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="p-3 border-4 border-black rounded-2xl text-[10px] font-black outline-none cursor-pointer bg-white uppercase hover:bg-gray-50 transition-colors"
                        >
                          <option value="pending">⏳ قيد الانتظار</option>
                          <option value="shipped">🚚 تم الشحن</option>
                          <option value="delivered">✅ تم التسليم</option>
                          <option value="cancelled">❌ ملغى</option>
                        </select>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 bg-black text-white rounded-2xl border-4 border-black hover:bg-brand-red transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">العنوان بالتفصيل</label>
                <div className="flex items-start gap-4">
                  <MapPin size={20} className="text-brand-red mt-1" />
                  <div>
                    <p className="font-black text-lg">{selectedOrder.state}</p>
                    <p className="font-bold text-gray-600">{selectedOrder.address}</p>
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
                           <p className="text-xs font-bold text-gray-400 uppercase">Size: {item.selectedSize} | Qty: {item.quantity}</p>
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
             <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
               <div className="absolute inset-0 bg-brand-red rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity" />
               <img src="/src/assets/logo.jpg" alt="Logo" className="relative w-32 h-32 object-contain mix-blend-multiply drop-shadow-2xl" />
             </div>
             <div className="text-3xl font-black uppercase tracking-tighter mt-6 text-center leading-none">
               <span className="text-brand-red">SEL3A</span><br/>
               <span className="text-brand-green">SNEAKERS</span>
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
                className={`w-full flex items-center p-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border-4 relative overflow-hidden ${
                  activeTab === item.id 
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
            onClick={() => { if(confirm('Exit Vault?')) navigate('/'); }}
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
             <img src="/src/assets/logo.jpg" alt="Logo" className="h-10 w-auto" />
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

        <div className="flex-1 overflow-y-auto p-8 md:p-12 pb-24 scrollbar-hide">
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
      </main>
    </div>
  );
};

export default Admin;

