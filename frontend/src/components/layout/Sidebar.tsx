
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileSpreadsheet, LifeBuoy, LogOut, PlusCircle, FileText, Users, Search, FileEdit, User, Camera, Tag, UserCog, BarChart, AlertCircle, BarChart2, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = user?.role?.toLowerCase() || 'user';
  const { permissions, isLoading } = usePlanPermissions();
  
  const canViewReports = permissions?.can_view_reports;

  const handleReportNavigation = (path: string) => {
    if (!canViewReports) {
      toast.error("Your current plan doesn't allow access to reports.");
      return;
    }
    navigate(path);
  };
  
  const getNavItems = () => {
    const baseRoute = `/${userRole}`;
    
    if (userRole === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: `${baseRoute}/dashboard` },
        { icon: FileSpreadsheet, label: 'Configure Subscriptions', path: `${baseRoute}/subscriptions` },
        { icon: PlusCircle, label: 'Create New Account', path: `${baseRoute}/companies/new` },
        { icon: FileText, label: 'Invoices', path: `${baseRoute}/invoices` },
        { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
      ];
    }
    
    if (userRole === 'client') {
      return [
        { icon: FileEdit, label: 'Document Management', path: `${baseRoute}/documents`, exact: true },
        { icon: Tag, label: 'Document Tags', path: `${baseRoute}/documents/tags`, exact: true },
        { icon: Camera, label: 'Upload New Document', path: `${baseRoute}/documents/upload`, exact: true },
        { icon: Search, label: 'Search Documents', path: `${baseRoute}/search` },
        { icon: AlertCircle, label: 'Disputes', path: `${baseRoute}/disputes` },
        { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
        { icon: FileText, label: 'Invoices', path: `${baseRoute}/current-invoices` },
      ];
    }
    
    if (userRole === 'owner') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: `${baseRoute}/dashboard` },
        { icon: FileEdit, label: 'Document Management', path: `${baseRoute}/documents`, exact: true },
        { icon: Tag, label: 'Document Tags', path: `${baseRoute}/documents/tags`, exact: true },
        { icon: PlusCircle, label: 'Create Document Tag', path: `${baseRoute}/documents/tags/create`, exact: true },
        { icon: Camera, label: 'Scan New Document', path: `${baseRoute}/documents/scan`, exact: true },
        { icon: Users, label: 'User Management', path: `${baseRoute}/users` },
        { icon: UserCog, label: 'Client Management', path: `${baseRoute}/clients` },
        { icon: Search, label: 'Search Documents', path: `${baseRoute}/search` },
        { icon: AlertCircle, label: 'Disputes', path: `${baseRoute}/disputes` },
        { icon: FileText, label: 'Client Invoices', path: `${baseRoute}/client-invoices` },
        { icon: FileText, label: 'Company Invoices', path: `${baseRoute}/company-invoices` },
        { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
        { 
          icon: BarChart, 
          label: 'Report', 
          path: `${baseRoute}/documents/reviews`, 
          exact: true,
          requiresPermission: true,
        },
        { 
          icon: BarChart2, 
          label: 'Company Report', 
          path: `${baseRoute}/company-report`, 
          exact: true,
          requiresPermission: true,
        },
      ];
    }
    
    if (userRole === 'manager') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', path: `${baseRoute}/dashboard` },
        { icon: FileEdit, label: 'Document Management', path: `${baseRoute}/documents`, exact: true },
        { icon: Tag, label: 'Document Tags', path: `${baseRoute}/documents/tags`, exact: true },
        { icon: PlusCircle, label: 'Create Document Tag', path: `${baseRoute}/documents/tags/create`, exact: true },
        { icon: Camera, label: 'Scan New Document', path: `${baseRoute}/documents/scan`, exact: true },
        { icon: Users, label: 'User Management', path: `${baseRoute}/users` },
        { icon: Search, label: 'Search Documents', path: `${baseRoute}/search` },
        { icon: AlertCircle, label: 'Disputes', path: `${baseRoute}/disputes` },
        { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
        { 
          icon: BarChart, 
          label: 'Report', 
          path: `${baseRoute}/documents/reviews`, 
          exact: true,
          requiresPermission: true,
        },
        { 
          icon: BarChart2, 
          label: 'Company Report', 
          path: `${baseRoute}/company-report`, 
          exact: true,
          requiresPermission: true,
        },
      ];
    }
    
    if (userRole === 'scanner') {
      return [
        { icon: FileEdit, label: 'Document Management', path: `${baseRoute}/documents`, exact: true },
        { icon: Tag, label: 'Document Tags', path: `${baseRoute}/documents/tags`, exact: true },
        { icon: Camera, label: 'Scan New Document', path: `${baseRoute}/documents/scan`, exact: true },
        { icon: Search, label: 'Search Documents', path: `${baseRoute}/search` },
        { icon: AlertCircle, label: 'Disputes', path: `${baseRoute}/disputes` },
        { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
        { 
          icon: BarChart, 
          label: 'Report', 
          path: `${baseRoute}/documents/reviews`, 
          exact: true,
          requiresPermission: true,
        },
      ];
    }
    
    if (userRole === 'indexer') {
      return [
        { icon: FileEdit, label: 'Document Management', path: `${baseRoute}/documents`, exact: true },
        { icon: Tag, label: 'Document Tags', path: `${baseRoute}/documents/tags`, exact: true },
        { icon: Search, label: 'Search Documents', path: `${baseRoute}/search` },
        { icon: AlertCircle, label: 'Disputes', path: `${baseRoute}/disputes` },
        { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
        { 
          icon: BarChart, 
          label: 'Report', 
          path: `${baseRoute}/documents/reviews`, 
          exact: true,
          requiresPermission: true,
        },
      ];
    }
    
    if (userRole === 'qa') {
      return [
        { icon: FileEdit, label: 'Document Management', path: `${baseRoute}/documents`, exact: true },
        { icon: Tag, label: 'Document Tags', path: `${baseRoute}/documents/tags`, exact: true },
        { icon: Search, label: 'Search Documents', path: `${baseRoute}/search` },
        { icon: AlertCircle, label: 'Disputes', path: `${baseRoute}/disputes` },
        { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
        { 
          icon: BarChart, 
          label: 'Report', 
          path: `${baseRoute}/documents/reviews`, 
          exact: true,
          requiresPermission: true,
        },
      ];
    }
    
    return [
      { icon: LayoutDashboard, label: 'Dashboard', path: `${baseRoute}/dashboard` },
      { icon: User, label: 'Profile', path: `${baseRoute}/profile` },
    ];
  };

  const navItems = getNavItems();

  const isPathActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-gray-100 text-sidebar-foreground h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <h1 className="text-xl font-semibold text-orange-600">Digital Archive</h1>
        </div>
      </div>
      
      <div className="px-4 py-3">
        <div className="text-sm text-gray-500">
          Logged in as <span className="font-medium text-gray-700">{userRole}</span>
        </div>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <React.Fragment key={item.path}>
            {item.requiresPermission ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={
                        isPathActive(item.path, item.exact) 
                          ? "flex items-center px-4 py-3 text-sm rounded-md transition-colors bg-orange-500 text-white font-medium"
                          : "flex items-center px-4 py-3 text-sm rounded-md transition-colors text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer"
                      }
                      onClick={() => handleReportNavigation(item.path)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                      {!canViewReports && <Lock className="h-3.5 w-3.5 ml-1.5 text-red-500" />}
                    </div>
                  </TooltipTrigger>
                  {!canViewReports && (
                    <TooltipContent side="right">
                      <p>Your current plan doesn't allow access to reports</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ) : (
              <NavLink
                to={item.path}
                className={
                  isPathActive(item.path, item.exact) 
                    ? "flex items-center px-4 py-3 text-sm rounded-md transition-colors bg-orange-500 text-white font-medium"
                    : "flex items-center px-4 py-3 text-sm rounded-md transition-colors text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </NavLink>
            )}
          </React.Fragment>
        ))}
      </nav>
      
      <nav className="px-2 py-4 space-y-1">
        <NavLink
          to={`/${userRole}/help`}
          className={({ isActive }) => cn(
            "flex items-center px-4 py-3 text-sm rounded-md transition-colors",
            isActive 
              ? "bg-orange-500 text-white font-medium" 
              : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
          )}
        >
          <LifeBuoy className="h-5 w-5 mr-3" />
          Help
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-orange-50 hover:text-orange-600 w-full transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};
