
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

interface OverviewSectionProps {
  title: string;
  buttonText: string;
  navigateTo: string;
  icon: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  iconClassName?: string;
}

export const OverviewSection = ({
  title,
  buttonText,
  navigateTo,
  icon,
  isLoading = false,
  className,
  iconClassName
}: OverviewSectionProps) => {
  const navigate = useNavigate();
  
  return (
    <Card 
      className={cn(
        "border-none shadow-sm relative overflow-hidden group cursor-pointer h-36", 
        className
      )}
      onClick={() => navigate(navigateTo)}
    >
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-lg">{title}</h3>
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", iconClassName || "bg-orange-100 text-orange-600")}>
            {icon}
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-6">
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent hover:text-orange-600 p-0 flex items-center gap-2"
          >
            {buttonText}
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
