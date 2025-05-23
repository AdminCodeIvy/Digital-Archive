
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TeamMemberCardProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  teamCount: number;
  onClick?: () => void;
}

export const TeamMemberCard = ({ id, title, icon, teamCount, onClick }: TeamMemberCardProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/companies/${id}`);
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:border-orange-200 cursor-pointer" onClick={handleClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              {icon || title.charAt(0)}
            </div>
            <h3 className="font-medium">{title}</h3>
          </div>
          
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
            e.stopPropagation();
            navigate(`/companies/${id}`);
          }}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Team Count</p>
            <p className="text-3xl font-bold text-orange-500">{teamCount}</p>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};
