
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Pencil, Check, Loader2, X, Trash2 } from 'lucide-react';
import { fetchPlans, deletePlan } from '@/services/api';
import { Plan } from '@/types';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import DeletePlanModal from '@/components/plans/DeletePlanModal';

const Subscriptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const pathPrefix = location.pathname.startsWith('/admin') ? '/admin' : '';
  
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    plan: Plan | null;
    error?: any;
  }>({
    isOpen: false,
    plan: null
  });
  
  const { data: plansResponse, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans,
  });
  
  const deleteMutation = useMutation({
    mutationFn: deletePlan,
    onSuccess: (response) => {
      // Check if the response has an error property or is an empty success response
      if (response?.error) {
        console.log('Delete error from success handler:', response.error);
        toast.error('Failed to delete plan');
        setDeleteModal({ isOpen: false, plan: null });
        return;
      }
      
      // If we got here, it was a successful deletion
      toast.success('Plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      setDeleteModal({ isOpen: false, plan: null });
    },
    onError: (error: any) => {
      console.log('Delete error from error handler:', error);
      
      // Parse the error response properly
      try {
        let errorData;
        
        // Check if it's a fetch response error
        if (error.message && error.message.includes(' - ')) {
          const errorJson = error.message.split(' - ')[1];
          errorData = JSON.parse(errorJson);
        } else if (typeof error === 'object' && error.companies) {
          // Direct error object
          errorData = error;
        } else {
          // Fallback parsing
          try {
            errorData = JSON.parse(error.message || '{}');
          } catch (e) {
            errorData = error;
          }
        }
        
        console.log('Parsed error data:', errorData);
        
        // If we have companies or clients in the error, show in modal
        if (errorData && (errorData.companies || errorData.clients)) {
          setDeleteModal(prev => ({
            ...prev,
            error: errorData
          }));
        } else {
          // Generic error - close modal and show toast
          toast.error(errorData?.message || 'Failed to delete plan');
          setDeleteModal({ isOpen: false, plan: null });
        }
      } catch (parseError) {
        console.error('Error parsing delete response:', parseError);
        toast.error('Failed to delete plan');
        setDeleteModal({ isOpen: false, plan: null });
      }
    }
  });
  
  const plans = plansResponse?.data || [];
  
  const handleDeleteClick = (plan: Plan, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      plan,
      error: undefined
    });
  };
  
  const handleConfirmDelete = () => {
    if (deleteModal.plan) {
      deleteMutation.mutate(deleteModal.plan.id);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold mb-1">Subscription Plans</h1>
            <p className="text-muted-foreground">Clients</p>
          </div>
        </div>
        
        <Button 
          onClick={() => navigate(`${pathPrefix}/plans/new`)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Plan
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="ml-3">Loading plans...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.length > 0 ? (
            plans.map((plan: Plan) => (
              <Card 
                key={plan.id} 
                className="overflow-hidden relative transition-all hover:shadow-md border-gray-100"
                onClick={() => navigate(`${pathPrefix}/plans/${plan.id}`)}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <Check className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{plan.name}</h3>
                        {plan.price_description && (
                          <p className="text-sm text-orange-600 font-medium">{plan.price_description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`${pathPrefix}/plans/${plan.id}`);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDeleteClick(plan, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Team Limit</span>
                      <span className="text-sm font-medium">{plan.team_count_limit}</span>
                    </div>
                    <Progress value={60} className="h-1.5 bg-gray-100" />
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Storage</span>
                      <span className="text-sm font-medium">{plan.storage_limit_gb} GB</span>
                    </div>
                    <Progress value={75} className="h-1.5 bg-gray-100" />
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { 
                        check: plan.can_share_document, 
                        label: 'Document Share' 
                      },
                      { 
                        check: plan.can_view_activity_logs, 
                        label: 'Documents Activity Log' 
                      },
                      { 
                        check: plan.can_view_chat, 
                        label: 'Can Chat with Document' 
                      },
                      { 
                        check: plan.can_view_reports, 
                        label: 'Can View Reports' 
                      },
                      { 
                        check: plan.allow_multiple_uploads, 
                        label: 'Allow Multiple Uploads' 
                      },
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${feature.check ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {feature.check ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        </div>
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full mt-6 border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`${pathPrefix}/plans/${plan.id}`);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Plan
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground mb-4">No subscription plans found</p>
              <Button 
                onClick={() => navigate(`${pathPrefix}/plans/new`)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create First Plan
              </Button>
            </div>
          )}
        </div>
      )}
      
      <DeletePlanModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, plan: null })}
        onConfirm={handleConfirmDelete}
        planName={deleteModal.plan?.name || ''}
        isLoading={deleteMutation.isPending}
        error={deleteModal.error}
      />
    </div>
  );
};

export default Subscriptions;
