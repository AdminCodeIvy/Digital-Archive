import React, { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: ReactNode;
  requiredRole?: string[];
}

export const MainLayout = ({ children, requiredRole = [] }: MainLayoutProps) => {
  const { isAuthenticated, user } = useAuth();
  const [isApiConnected, setIsApiConnected] = useState<boolean | null>(null);
  
  // Only check API connection on mount
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('https://digitial-archieve-backend.vercel.app/plans');
        const isConnected = response.ok;
        setIsApiConnected(isConnected);
        
        if (!isConnected) {
          toast.error('API connection failed. Some features may not work properly.');
        }
      } catch (error) {
        console.error('API connection check failed:', error);
        setIsApiConnected(false);
        toast.error('API connection failed. Some features may not work properly.');
      }
    };
    
    checkApiConnection();
  }, []);
  
  // Simple auth check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check role-based access if needed
  if (requiredRole.length > 0 && user) {
    const userRole = user.role.toLowerCase();
    const hasRequiredRole = requiredRole.some(role => 
      role.toLowerCase() === userRole
    );
    
    if (!hasRequiredRole) {
      toast.error('You do not have permission to access this page');
      return <Navigate to={`/${userRole}/dashboard`} replace />;
    }
  }

  return (
    <div className="flex min-h-screen h-full bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopBar apiStatus={isApiConnected} />
        {isApiConnected === false && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <p className="font-medium">API Connection Error</p>
            <p>Could not connect to the API server. Some features may not work properly.</p>
          </div>
        )}
        <main className="flex-1 h-auto pt-2">
          <div className="px-6 py-4 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
