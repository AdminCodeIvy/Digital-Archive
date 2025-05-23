
import { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { useNavigate } from 'react-router-dom';

interface PermissionRestrictedButtonProps {
  permissionKey: 'can_download' | 'can_share' | 'can_view_activity_logs';
  children: ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export function PermissionRestrictedButton({
  permissionKey,
  children,
  onClick,
  className,
  variant = 'default',
  disabled = false
}: PermissionRestrictedButtonProps) {
  const { permissions, isLoading, showPermissionError } = usePlanPermissions();
  
  const hasPermission = permissions[permissionKey];
  
  const handleClick = () => {
    if (!hasPermission) {
      showPermissionError(getFeatureName(permissionKey));
      return;
    }
    
    onClick();
  };
  
  // Don't render anything during loading
  if (isLoading) {
    return (
      <Button variant={variant} className={className} disabled>
        {children}
      </Button>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button 
              variant={variant} 
              className={className} 
              onClick={handleClick}
              disabled={disabled || !hasPermission}
            >
              {children}
              {!hasPermission && <Lock className="h-3 w-3 ml-1 text-red-500" />}
            </Button>
          </span>
        </TooltipTrigger>
        {!hasPermission && (
          <TooltipContent>
            <p>Your current plan doesn't allow {getFeatureName(permissionKey)}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

function getFeatureName(key: string): string {
  switch(key) {
    case 'can_download': return 'downloading documents';
    case 'can_share': return 'document sharing';
    case 'can_view_activity_logs': return 'viewing activity logs';
    default: return 'this feature';
  }
}

// For navigation restrictions
interface RestrictedNavLinkProps {
  permissionKey: 'can_download' | 'can_share' | 'can_view_activity_logs';
  children: ReactNode;
  to: string;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
}

export function RestrictedNavLink({
  permissionKey,
  children,
  to,
  className,
  activeClassName,
  exact
}: RestrictedNavLinkProps) {
  const { permissions, showPermissionError } = usePlanPermissions();
  const hasPermission = permissions[permissionKey];
  const navigate = useNavigate();
  
  const handleClick = (e: React.MouseEvent) => {
    if (!hasPermission) {
      e.preventDefault();
      showPermissionError(getFeatureName(permissionKey));
      return;
    }
    
    navigate(to);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={className}
            onClick={handleClick}
            style={{ cursor: hasPermission ? 'pointer' : 'not-allowed' }}
          >
            {children}
            {!hasPermission && <Lock className="h-3.5 w-3.5 ml-1.5 text-red-500" />}
          </div>
        </TooltipTrigger>
        {!hasPermission && (
          <TooltipContent side="right">
            <p>Your current plan doesn't allow {getFeatureName(permissionKey)}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
