
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface User {
  email?: string;
  name?: string;
  role: string;
  userId?: string;
  companyId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const setCookie = (name: string, value: string, days: number) => {
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + days);
  document.cookie = `${name}=${value};expires=${expirationDate.toUTCString()};path=/;secure`;
};

const getCookie = (name: string) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = getCookie('jwt_token');
      
      if (!token) return;
      
      try {
        const response = await fetch('https://digital-archive-beta.vercel.app/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });
        
        if (!response.ok) {
          setUser(null);
          deleteCookie('jwt_token');
          return;
        }
        
        const data = await response.json();
        
        if (data.valid && data.user) {
          setUser({
            role: data.user.role,
            userId: data.user.userId,
            companyId: data.user.companyId,
            name: data.user.name,
            email: data.user.email // Make sure email is included if it's in the response
          });
        } else {
          setUser(null);
          deleteCookie('jwt_token');
        }
      } catch (error) {
        console.error('Token verification error:', error);
        setUser(null);
        deleteCookie('jwt_token');
      }
    };
    
    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('https://digital-archive-beta.vercel.app/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.json();
        toast.error(`Login failed: ${errorText.error}`);
        return false;
      }

      const data = await response.json();
      
      if (data.token) {
        setCookie('jwt_token', data.token, 1);
        
        const userData: User = {
          role: data.role || 'user',
          userId: data.userId,
          companyId: data.companyId,
          name: data.name,
          email: email // Store the email since we have it from the login form
        };
        
        setUser(userData);
        toast.success('Login successful');
        
        setTimeout(() => {
          if (userData.role) {
            const roleLC = userData.role.toLowerCase();
            
            // For owner and client roles, redirect to documents instead of dashboard
            if (roleLC === 'owner' || roleLC === 'manager' || roleLC === 'admin') {
              navigate(`/${roleLC}/dashboard`, { replace: true });
            } else {
              navigate(`/${roleLC}/documents`, { replace: true });
            }
          }
        }, 100);
        
        return true;
      } else {
        toast.error('Invalid response from server');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials and try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    deleteCookie('jwt_token');
    navigate('/login', { replace: true });
    toast.info('You have been logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
