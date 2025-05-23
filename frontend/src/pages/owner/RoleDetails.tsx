
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/services/api';

const RoleDetails = () => {
  const { roleKey } = useParams<{ roleKey: string }>();
  const navigate = useNavigate();
  const capitalizedRole = roleKey ? roleKey.charAt(0).toUpperCase() + roleKey.slice(1) : '';
  
  const { data: usersData, isLoading, isError } = useQuery({
    queryKey: ['users', roleKey],
    queryFn: async () => {
      const response = await fetchUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Filter users by role
      const filteredUsers = response.data?.filter(
        user => user.role.toLowerCase() === roleKey?.toLowerCase()
      ) || [];
      
      return filteredUsers;
    }
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/owner/users/roles')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{capitalizedRole} Users</h1>
            <p className="text-sm text-muted-foreground">Role Details</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="font-medium">{capitalizedRole} User List</h3>
          <div className="text-sm text-muted-foreground">
            Total: {usersData?.length || 0} users
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading users. Please try again.</div>
        ) : usersData?.length === 0 ? (
          <div className="p-8 text-center">No {capitalizedRole} users found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Full Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Publish</TableHead>
                <TableHead>Dispute</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                        <User className="h-full w-full p-1 text-gray-500" />
                      </div>
                      {user.name}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'active' ? 'success' : 'destructive'} 
                      className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {user.status === 'active' ? 'Active' : 'Blocked'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.allow_to_publish ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {user.create_dispute ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default RoleDetails;
