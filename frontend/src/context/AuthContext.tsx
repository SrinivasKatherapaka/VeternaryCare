import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { User, HospitalTenant, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  tenant: HospitalTenant | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<HospitalTenant | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('vet_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('vet_user');
    const storedTenant = localStorage.getItem('vet_tenant');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      if (storedTenant) setTenant(JSON.parse(storedTenant));
    }
    setLoading(false);
  }, [token]);

  const login = async (email: string) => {
    const res = await api.post('/auth/login', { email, password: 'password123' });
    if (res.data.success) {
      const tokenVal = res.data.token;
      const userVal = res.data.user;
      const tenantVal = res.data.tenant;

      setToken(tokenVal);
      setUser(userVal);
      setTenant(tenantVal);

      localStorage.setItem('vet_token', tokenVal);
      localStorage.setItem('vet_user', JSON.stringify(userVal));
      localStorage.setItem('vet_tenant', JSON.stringify(tenantVal));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setTenant(null);
    localStorage.removeItem('vet_token');
    localStorage.removeItem('vet_user');
    localStorage.removeItem('vet_tenant');
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem('vet_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, tenant, token, isAuthenticated: !!token, login, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
