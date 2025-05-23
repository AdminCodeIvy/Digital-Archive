
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Lock, Unlock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { fetchPlans, updateCompany } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface SubscriptionTableProps {
  subscriptions: {
    id: string;
    subscriber: string;
    teamCount: number;
    docsModified: number;
    storageLimit: string;
    status: 'Active' | 'Cancelled' | 'Pending' | 'Failed';
    lastPaidInvoice?: string;
    plan_id?: string;
    admin_name?: string;
  }[];
  isLoading?: boolean;
  onStatusChange?: (id: string, newStatus: string) => Promise<void>;
}

export const SubscriptionTable = ({ 
  subscriptions, 
  isLoading = false, 
  onStatusChange 
}: SubscriptionTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<{
    id: string;
    name: string;
    admin_name: string;
    plan_id?: string;
  } | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';

  const { data: plansResponse } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });

  const plansData = plansResponse?.data;

  const filteredSubscriptions = subscriptions.filter((sub) =>
    sub.subscriber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (subscription: any) => {
    setSelectedCompany({
      id: subscription.id,
      name: subscription.subscriber,
      admin_name: subscription.admin_name,
      plan_id: subscription.plan_id
    });
    setCompanyName(subscription.subscriber);
    setOwnerName(subscription.admin_name);
    setSelectedPlanId(subscription.plan_id || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!selectedCompany) return;
    
    try {
      setIsUpdatingPlan(true);
      await updateCompany(selectedCompany.id, {
        name: companyName,
        admin_name: ownerName,
        plan_id: selectedPlanId
      });
      toast.success('Company details updated successfully');
      setIsEditDialogOpen(false);
      // Trigger the refetch by calling onStatusChange with the current status
      const subscription = subscriptions.find(s => s.id === selectedCompany.id);
      if (subscription && onStatusChange) {
        await onStatusChange(subscription.id, subscription.status);
      }
    } catch (error) {
      console.error('Failed to update company details:', error);
      toast.error('Failed to update company details');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    if (!onStatusChange) return;
    
    try {
      setUpdatingId(id);
      const newStatus = currentStatus === 'Active' ? 'Cancelled' : 'Active';
      await onStatusChange(id, newStatus);
      toast.success(`Account ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update account status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium">Subscription Details</h2>
          {isLoading && (
            <div className="flex items-center ml-2">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search subscribers..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="ml-3">Loading subscriptions...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length > 0 ? (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                          {subscription.subscriber[0]}
                        </div>
                        <Button 
                          variant="link" 
                          className="p-0 text-foreground hover:text-orange-500"
                          onClick={() => navigate(`/${userRole}/companies/${subscription.id}`)}
                        >
                          {subscription.subscriber}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{subscription.admin_name}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs border border-orange-200 hover:bg-orange-50"
                          onClick={() => handleEditClick(subscription)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={updatingId === subscription.id}
                          className={`h-8 px-2 text-xs border ${
                            subscription.status === 'Active'
                              ? 'border-red-200 hover:bg-red-50 text-red-600'
                              : 'border-green-200 hover:bg-green-50 text-green-600'
                          }`}
                          onClick={() => handleStatusChange(subscription.id, subscription.status)}
                        >
                          {updatingId === subscription.id ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : subscription.status === 'Active' ? (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Block
                            </>
                          ) : (
                            <>
                              <Unlock className="h-3 w-3 mr-1" />
                              Unblock
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {searchTerm ? 'No subscriptions found matching your search' : 'No subscriptions found. Create a new company to get started.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Company Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Company Name</p>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Owner Name</p>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter owner name"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Subscription Plan</p>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plansData?.map((plan: any) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdatingPlan}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePlan} 
              disabled={isUpdatingPlan || !selectedPlanId || !companyName || !ownerName}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isUpdatingPlan ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
