
import React from 'react';
import { Bell, Mail, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  apiStatus?: boolean | null;
}

export const TopBar = ({ apiStatus }: TopBarProps) => {
  const { user } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 h-16">
      <div className="px-6 h-full flex items-center justify-between">
        <div>
          <h1 className="text-gray-800 font-semibold">Welcome back, {user?.name || 'User'}</h1>
        </div>
      </div>
    </header>
  );
};
