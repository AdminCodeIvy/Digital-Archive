
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Check, Users, Sparkles, ShieldCheck, Clock, Layers, Folder, RefreshCw, Mail, Trash2, MessageCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClientPlans, generateClientInvoices, sendUnpaidInvoiceReminders, deleteClientPlan } from '@/services/api';
import { ClientPlan } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import DeletePlanModal from '@/components/plans/DeletePlanModal';

const ClientPlans = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [groupedPlans, setGroupedPlans] = useState<Record<string, ClientPlan[]>>({});
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    plan: ClientPlan | null;
    error?: any;
  }>({
    isOpen: false,
    plan: null
  });

  const { data: clientPlansData, isLoading } = useQuery({
    queryKey: ['clientPlans'],
    queryFn: fetchClientPlans,
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: generateClientInvoices,
    onSuccess: (data) => {
      if (data?.data) {
        const successful = data.data.filter(item => item.status === "Invoice created").length;
        const existing = data.data.filter(item => item.status === "Invoice already exists").length;
        const failed = data.data.filter(item => item.status === "Failed to create invoice").length;
        
        toast.success(`Generated ${successful} new invoices`);
        if (existing > 0) toast.info(`${existing} invoices already existed`);
        if (failed > 0) toast.error(`Failed to create ${failed} invoices`);
      }
    },

  });

  const sendRemindersMutation = useMutation({
    mutationFn: sendUnpaidInvoiceReminders,
    onSuccess: (data) => {
      if (data?.data) {
        const sent = data.data.filter(item => item.status === "Reminder sent").length;
        const failed = data.data.filter(item => item.status === "Failed to send reminder").length;
        
        if (sent > 0) toast.success(`Sent ${sent} reminders successfully`);
        if (failed > 0) toast.error(`Failed to send ${failed} reminders`);
      }
    },
    onError: () => {
      toast.error('Failed to send reminders');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClientPlan,
    onSuccess: (response) => {
      // Check if the response has an error property or is an empty success response
      if (response?.error) {
        console.log('Delete error from success handler:', response.error);
        toast.error('Failed to delete client plan');
        setDeleteModal({ isOpen: false, plan: null });
        return;
      }
      
      // If we got here, it was a successful deletion
      toast.success('Client plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['clientPlans'] });
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
        } else if (typeof error === 'object' && error.clients) {
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
          toast.error(errorData?.message || 'Failed to delete client plan');
          setDeleteModal({ isOpen: false, plan: null });
        }
      } catch (parseError) {
        console.error('Error parsing delete response:', parseError);
        toast.error('Failed to delete client plan');
        setDeleteModal({ isOpen: false, plan: null });
      }
    }
  });

  useEffect(() => {
    if (clientPlansData?.data) {
      const plans = clientPlansData.data;
      // Group plans by name for display
      const grouped: Record<string, ClientPlan[]> = {};
      
      plans.forEach((plan: ClientPlan) => {
        const planName = plan.name;
        if (!grouped[planName]) {
          grouped[planName] = [];
        }
        grouped[planName].push(plan);
      });
      
      setGroupedPlans(grouped);
    }
  }, [clientPlansData]);

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case "view": return <Users className="h-4 w-4" />;
      case "download": return <ShieldCheck className="h-4 w-4" />;
      case "share": return <Sparkles className="h-4 w-4" />;
      case "chat": return <MessageCircle className="h-4 w-4" />;
      default: return <Check className="h-4 w-4" />;
    }
  };

  const getPlanIcon = (index: number) => {
    const icons = [<Folder />, <Layers />, <Clock />];
    return icons[index % icons.length];
  };

  const handleDeleteClick = (plan: ClientPlan, e: React.MouseEvent) => {
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
    <div className="p-6 space-y-8">
      <div className="rounded-lg bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/owner/clients')}
                className="bg-white/80 hover:bg-white shadow-sm"
              >
                <ArrowLeft className="h-5 w-5 text-orange-500" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Client Plans</h1>
            </div>
            <p className="text-sm text-gray-600 mt-1">Manage subscription plans for your clients</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => sendRemindersMutation.mutate()}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
              disabled={sendRemindersMutation.isPending}
            >
              {sendRemindersMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Reminders
                </>
              )}
            </Button>

            <Button 
              onClick={() => generateInvoicesMutation.mutate()}
              className="bg-orange-500 hover:bg-orange-600"
              disabled={generateInvoicesMutation.isPending}
            >
              {generateInvoicesMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Invoices
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => navigate('/owner/clients/plans/create')} 
              className="bg-orange-500 hover:bg-orange-600 shadow-md transition-all transform hover:scale-105"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading plans...</span>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedPlans).map(([planName, plans], index) => (
            <div key={planName} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-500">
                    {getPlanIcon(index)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{planName}</h2>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs px-2 border-orange-200 text-orange-700 bg-orange-50">
                        {plans.length} {plans.length === 1 ? 'client' : 'clients'}
                      </Badge>
                      <p className="text-sm text-gray-500">
                        ${plans[0].monthly_bill}/month
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/owner/clients/plans/${plans[0].id}/edit`)}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Plan
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => handleDeleteClick(plans[0], e)}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Plan
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className="overflow-hidden border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-md"
                    onClick={() => navigate(`/owner/clients/plans/${plan.id}/edit`)}
                  >
                    <div className="h-1.5 bg-gradient-to-r from-orange-400 to-amber-300"></div>
                    <CardContent className="p-0">
                      <div className="p-5">
                        <h3 className="font-semibold text-lg text-gray-800">{planName}</h3>
                        <div className="flex items-center gap-1 mb-4">
                          <span className="text-lg font-bold text-orange-600">${plan.monthly_bill}</span>
                          <span className="text-sm text-gray-500">/month</span>
                          {plan.discount_percent > 0 && (
                            <Badge className="ml-2 bg-green-100 text-green-700 border-0 text-xs px-2">
                              {plan.discount_percent}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-3 mt-4">
                          <div className={`flex items-center text-sm ${plan.can_view ? 'text-gray-700' : 'text-gray-400'}`}>
                            <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${plan.can_view ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {getFeatureIcon("view")}
                            </div>
                            <span>View Documents</span>
                          </div>
                          
                          <div className={`flex items-center text-sm ${plan.can_download ? 'text-gray-700' : 'text-gray-400'}`}>
                            <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${plan.can_download ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {getFeatureIcon("download")}
                            </div>
                            <span>Download Documents</span>
                          </div>
                          
                          <div className={`flex items-center text-sm ${plan.can_share ? 'text-gray-700' : 'text-gray-400'}`}>
                            <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${plan.can_share ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {getFeatureIcon("share")}
                            </div>
                            <span>Share Documents</span>
                          </div>
                          
                          <div className={`flex items-center text-sm ${plan.can_view_chat ? 'text-gray-700' : 'text-gray-400'}`}>
                            <div className={`h-5 w-5 rounded-full mr-2 flex items-center justify-center ${plan.can_view_chat ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {getFeatureIcon("chat")}
                            </div>
                            <span>Chat with Documents</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(groupedPlans).length === 0 && !isLoading && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mb-4">
                <Folder className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No client plans found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Create your first client plan to start managing subscriptions for your customers.
              </p>
              <Button 
                onClick={() => navigate('/owner/clients/plans/create')}
                className="bg-orange-500 hover:bg-orange-600 shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
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

export default ClientPlans;
