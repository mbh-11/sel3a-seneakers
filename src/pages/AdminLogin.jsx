import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginAdmin(password)) {
      navigate('/secret-dashboard');
    } else {
      setError('Incorrect Password. Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-street">
      <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-brand-black text-white rounded-full">
            <Lock size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-2">Restricted Area</h2>
        <p className="text-xs font-bold text-gray-500 uppercase text-center mb-8">Admin Console Authentication</p>

        {error && (
          <div className="bg-red-100 border-2 border-brand-red text-brand-red p-3 mb-6 rounded-lg text-sm font-bold uppercase text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Code..."
              className="w-full border-4 border-black p-4 rounded-xl font-bold uppercase tracking-widest outline-none focus:bg-gray-50 transition-colors"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-brand-red text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center hover:bg-black transition-colors"
          >
            Authenticate <ArrowRight size={20} className="ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
