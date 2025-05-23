import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchClientPlans, createClient, fetchClients } from '@/services/api';
import { toast } from 'sonner';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import ClientLimitWarning from '@/components/clients/ClientLimitWarning';

const CreateClient = () => {
  const navigate = useNavigate();
  
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLimitExceeded, setIsLimitExceeded] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // New state for password visibility
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get plan permissions to check if user can add clients
  const { canAddClient, clientLimit, showPermissionError } = usePlanPermissions();

  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['clientPlans'],
    queryFn: fetchClientPlans,
  });
  
  useEffect(() => {
    // If user doesn't have permission to add clients, show error
    if (!canAddClient) {
      toast.error('Your current plan does not allow adding clients.');
    }
  }, [canAddClient]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has permission to add clients
    if (!canAddClient) {
      showPermissionError('client management');
      return;
    }
    
    // Check if client limit is exceeded
    if (isLimitExceeded) {
      toast.error(`You have reached your plan's client limit of ${clientLimit}.`);
      return;
    }
    
    // Form validation
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }
    
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (!selectedPlanId) {
      toast.error('Please select a subscription plan');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedPlan = plansData?.data?.find((plan: any) => plan.id === selectedPlanId);
      
      await createClient({
        name: clientName.trim(),
        email: email.trim(),
        password: password,
        status: 'active',
        plan_id: selectedPlanId
      });
      
      toast.success('Client account created successfully');
      navigate('/owner/clients');
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Failed to create client account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const filteredPlans = plansData?.data?.filter((plan: any) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/owner/clients')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Create New Account</h1>
          </div>
          <p className="text-sm text-muted-foreground">Clients</p>
        </div>
      </div>
      
      {/* Show client limit warning */}
      <ClientLimitWarning onLimitExceeded={setIsLimitExceeded} />
      
      {!canAddClient ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Permission Denied</AlertTitle>
          <AlertDescription>
            Your current plan does not allow client management. Please upgrade your plan to access this feature.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="max-w-2xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium mb-1">
                Client Name
              </label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
                className="w-full"
                disabled={!canAddClient || isLimitExceeded}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Point of Contact Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full"
                disabled={!canAddClient || isLimitExceeded}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-10"
                  disabled={!canAddClient || isLimitExceeded}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-transparent"
                  onClick={togglePasswordVisibility}
                  disabled={!canAddClient || isLimitExceeded}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            
            <div>
              <label htmlFor="plan" className="block text-sm font-medium mb-1">
                Assign Subscription Plan
              </label>
              <Select 
                value={selectedPlanId} 
                onValueChange={setSelectedPlanId}
                disabled={!canAddClient || isLimitExceeded}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      id="plan-search"
                      name="plan-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Plans"
                      disabled={isSubmitting}
                      className="w-full font-semibold"
                    />
                  </div>
                  {isLoadingPlans ? (
                    <SelectItem value="loading" disabled>Loading plans...</SelectItem>
                  ) : filteredPlans?.length > 0 ? (
                    filteredPlans.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.monthly_bill}/month
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No plans available</SelectItem>
                  )}
                </SelectContent>
              </Select>
              {!plansData?.data?.length && !isLoadingPlans && (
                <p className="text-sm text-red-500 mt-1">
                  No plans available. Please create a plan first.
                </p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/owner/clients')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600"
                disabled={isSubmitting || isLoadingPlans || !canAddClient || isLimitExceeded}
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default CreateClient;
