
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  onClick?: () => void;
  color?: string;
  className?: string;
  linkTo?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  onClick,
  color = 'bg-orange-50 text-orange-500',
  className,
  linkTo = true,
}: StatsCardProps) {
  return (
    <Card 
      onClick={onClick} 
      className={cn(
        "overflow-hidden cursor-pointer transition-all hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          
          {icon && (
            <div className={cn("p-3 rounded-full", color)}>
              {icon}
            </div>
          )}
        </div>
        
      </CardContent>
    </Card>
  );
}
