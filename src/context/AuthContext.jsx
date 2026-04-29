import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Persistence for Admin session
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('sel3a_admin_token') === 'is_logged_in';
    } catch (e) {
      console.error("Local storage not accessible:", e);
      return false;
    }
  });

  const loginAdmin = (password) => {
    // Basic mock authentication
    if (password === 'admin123') { // Simple secret password
      setIsAdmin(true);
      localStorage.setItem('sel3a_admin_token', 'is_logged_in');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('sel3a_admin_token');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
