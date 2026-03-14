import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false); // Initially false

  const loginAdmin = (password) => {
    // Basic mock authentication
    if (password === 'admin123') { // Simple secret password
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, loginAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
