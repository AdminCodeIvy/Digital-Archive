
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { fetchClientPlans, updateClient } from '@/services/api';

interface ClientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onSuccess: () => void;
}

const ClientEditModal: React.FC<ClientEditModalProps> = ({ isOpen, onClose, client, onSuccess }) => {
  const [name, setName] = useState('');
  const [planId, setPlanId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setPlanId(client.plan_id);
    }
  }, [client]);

  useEffect(() => {
    const getPlans = async () => {
      setIsLoadingPlans(true);
      try {
        const response = await fetchClientPlans();
        if (response.data) {
          setPlans(response.data);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
        toast.error('Failed to load plans');
      } finally {
        setIsLoadingPlans(false);
      }
    };

    if (isOpen) {
      getPlans();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateClient(client.id, {
        name,
        plan_id: planId,
      });

      toast.success('Client updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Client name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              {isLoadingPlans ? (
                <div className="p-2 text-sm text-gray-500">Loading plans...</div>
              ) : (
                <Select
                  value={planId}
                  onValueChange={(value) => setPlanId(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.monthly_bill}/month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientEditModal;
