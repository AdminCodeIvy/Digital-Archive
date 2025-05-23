import React, { useState, useEffect } from 'react';
import { ArrowRight, Circle, Settings, User, Filter as FilterIcon, Edit, Trash, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, updateUserStatus, deleteUser, updateUser } from '@/services/api';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User as UserType } from '@/types';

interface EditUserFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
}

const UserManagementOverview = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<EditUserFormData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    status: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  const { data: usersData, isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetchUsers();
      if (response.error) {
        throw new Error(response.error);
      }
      return Array.isArray(response.data) ? response.data as UserType[] : [];
    }
  });

  const filteredUsers = usersData && Array.isArray(usersData) 
    ? usersData.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      ) 
    : [];

  const totalUsers = Array.isArray(usersData) ? usersData.length : 0;
  const managers = Array.isArray(usersData) ? usersData.filter(user => user.role.toLowerCase() === 'manager').length : 0;
  const scanners = Array.isArray(usersData) ? usersData.filter(user => user.role.toLowerCase() === 'scanner').length : 0;
  const indexers = Array.isArray(usersData) ? usersData.filter(user => user.role.toLowerCase() === 'indexer').length : 0;
  const qaUsers = Array.isArray(usersData) ? usersData.filter(user => user.role.toLowerCase() === 'qa').length : 0;

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus.toLowerCase() === 'active' ? 'blocked' : 'active';
      const response = await updateUserStatus(userId, newStatus);
      
      if (response.error) {
        toast.error(`Failed to update user status: ${response.error}`);
        return;
      }
      
      toast.success(`User status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
        refetch();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const openEditDialog = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role.toLowerCase(),
      status: user.status
    });
    setIsEditDialogOpen(true);
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const numbersOnly = input.replace(/\D/g, '');
    setFormData({...formData, phone: numbersOnly});
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      const response = await updateUser(editingUser.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status
      });
      
      if (response.error) {
        toast.error(`Failed to update user: ${response.error}`);
        setIsSubmitting(false);
        return;
      }
      
      toast.success('User updated successfully');
      setIsEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">User Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
              <h3 className="text-3xl font-bold">{totalUsers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground mb-1">Managers</p>
              <h3 className="text-3xl font-bold">{managers}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/owner/users/roles')}>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium text-muted-foreground mb-1">Configure Roles</p>
              <div className="h-[38px] flex items-center mt-1">
                <Settings className="h-6 w-6 text-orange-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-orange-500">
              <span>View details</span>
              <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all bg-orange-500 text-white" onClick={() => navigate('/owner/users/create')}>
          <CardContent className="p-6">
            <div className="flex flex-col">
              <p className="text-sm font-medium mb-1">Create User</p>
              <div className="h-[38px] flex items-center mt-1">
                <User className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
              <span>Add now</span>
              <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h3 className="text-center text-lg font-medium mb-2">Scanners</h3>
            <p className="text-center text-3xl font-semibold">{scanners}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h3 className="text-center text-lg font-medium mb-2">Indexers</h3>
            <p className="text-center text-3xl font-semibold">{indexers}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <h3 className="text-center text-lg font-medium mb-2">QA</h3>
            <p className="text-center text-3xl font-semibold">{qaUsers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <Input 
            type="search" 
            className="pl-10" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <FilterIcon className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="font-medium">User List</h3>
        </div>
        {isLoading ? (
          <div className="p-8 text-center">Loading users...</div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500">Error loading users. Please try again.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Full Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.slice(0, 7).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                          <User className="h-full w-full p-1 text-gray-500" />
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'active' ? 'success' : 'destructive'} 
                        className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {user.status === 'active' ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-orange-200 text-orange-500 hover:bg-orange-50"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        
                        {user.status === 'active' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-red-200 text-red-500 hover:bg-red-50"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                          >
                            <Circle className="h-4 w-4 mr-1 fill-current" />
                            Block
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-green-200 text-green-500 hover:bg-green-50"
                            onClick={() => handleToggleStatus(user.id, user.status)}
                          >
                            <Circle className="h-4 w-4 mr-1 fill-current" />
                            Unblock
                          </Button>
                        )}
                        
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-red-200 text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="User name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="User email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handlePhoneInput}
                    placeholder="Phone number"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value})}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="indexer">Indexer</SelectItem>
                    <SelectItem value="scanner">Scanner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleEditUser}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementOverview;
