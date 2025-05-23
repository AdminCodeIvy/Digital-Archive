import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { fetchPlans, createCompany } from '@/services/api';
import { Plan } from '@/types';
import { toast } from 'sonner';

const CreateCompany = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    admin_name: '',
    contact_email: '',
    password: '',
    plan_id: '',
  });
  
  const { data: plansResponse, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });
  
  const plans = plansResponse?.data || [];
  
  const filteredPlans = plans.filter((plan: Plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handlePlanChange = (value: string) => {
    setFormData({
      ...formData,
      plan_id: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.admin_name || !formData.contact_email || !formData.password || !formData.plan_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // In a real app, we'd hash the password on the server
    const companyData = {
      name: formData.name,
      admin_name: formData.admin_name,
      contact_email: formData.contact_email,
      password_hash: formData.password, // In real app, we'd send plaintext and hash on server
      plan_id: formData.plan_id,
    };
    
    try {
      setIsSubmitting(true);
      const response = await createCompany(companyData);
      if (response.data) {
        toast.success('Company created successfully!');
        navigate('/');
      } else if (response.error) {
        toast.error(`Failed to create company: ${response.error}`);
      }
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Error creating company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold mb-1">Create New Account</h1>
          <p className="text-muted-foreground">Clients</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Here"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="admin_name">Company Owner Name</Label>
            <Input
              id="admin_name"
              name="admin_name"
              value={formData.admin_name}
              onChange={handleInputChange}
              placeholder="Enter Here"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_email">Point of Contact Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={handleInputChange}
              placeholder="Enter Here"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plan">Assign Subscription Plan</Label>
            <Select
              value={formData.plan_id}
              onValueChange={handlePlanChange}
              disabled={isSubmitting}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent>
                <div className="p-2">
                  <Input
                    id="plan-search"
                    name="plan-search"
                    value={searchQuery}
                    className='font-semibold'
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Plans"
                    disabled={isSubmitting}
                  />
                </div>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading plans...
                  </SelectItem>
                ) : filteredPlans.length > 0 ? (
                  filteredPlans.map((plan: Plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-plans" disabled>
                    No plans available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCompany;
