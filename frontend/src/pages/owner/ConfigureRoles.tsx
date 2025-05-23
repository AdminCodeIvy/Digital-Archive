
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, ArrowRight, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/services/api';

// Role definitions
const roles = [
  { id: '1', name: 'Scanner', key: 'scanner' },
  { id: '2', name: 'QA', key: 'qa' },
  { id: '3', name: 'Indexer', key: 'indexer' },
  { id: '4', name: 'Manager', key: 'manager' },
];

const ConfigureRoles = () => {
  const navigate = useNavigate();
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  // Fetch users data
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetchUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    }
  });

  // Count users by role
  const getRoleCount = (roleKey: string) => {
    if (!usersData || isLoading) return 0;
    return usersData.filter(user => 
      user.role.toLowerCase() === roleKey.toLowerCase()
    ).length;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Configure Roles</h1>
          <p className="text-sm text-muted-foreground">User Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Folder className="h-6 w-6 text-orange-500" />
                  <h3 className="text-xl font-medium">{role.name}</h3>
                </div>
                {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-5 w-5" />
                </Button> */}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Count</p>
                </div>
                <p className="text-3xl font-bold text-orange-500">
                  {isLoading ? "..." : getRoleCount(role.key)}
                </p>
              </div>
            </div>
            <div className="border-t p-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-orange-500"
                onClick={() => navigate(`/owner/roles/details/${role.key}`)}
              >
                <ArrowRight className="h-4 w-4 mr-1" />
                View Role Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConfigureRoles;
