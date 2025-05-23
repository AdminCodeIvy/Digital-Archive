
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MetricsSummary } from '@/components/dashboard/MetricsSummary';
import { OverviewSection } from '@/components/dashboard/OverviewSection';
import { SubscriptionTable } from '@/components/dashboard/SubscriptionTable';
import { FileText, Users, PlusCircle } from 'lucide-react';
import { fetchCompanies, fetchPlans, updateCompanyStatus } from '@/services/api';
import { Company } from '@/types';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';
  
  const { data: plansResponse, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlans
  });

  const { data: companiesResponse, isLoading: isLoadingCompanies, refetch: refetchCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  });

  const plansData = plansResponse?.data;
  const companiesData = companiesResponse?.data;

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateCompanyStatus(id, newStatus);
      refetchCompanies(); // Refetch companies after status change
    } catch (error) {
      console.error('Error updating company status:', error);
      throw error;
    }
  };

  // Transform company data for subscription table
  const subscriptions = companiesData?.map((company: Company) => ({
    id: company.id,
    subscriber: company.name,
    admin_name: company.admin_name,
    teamCount: company.users?.length || 0, // Get actual team count from users array
    docsModified: company.documents_scanned || 0,
    storageLimit: `${company.storage_assigned || 100} GB`,
    status: company.status ? (company.status as "Active" | "Cancelled" | "Pending" | "Failed") : "Active",
    lastPaidInvoice: company.invoice_value_total ? 'Invoice' : undefined,
    plan_id: company.plan_id, // Add plan_id to pass to SubscriptionTable
  })) || [];

  if (isLoadingCompanies && isLoadingPlans) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-3">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Overview</h1>
        <p className="text-muted-foreground">Clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewSection
          title="Subscription Plans"
          buttonText="Manage Plans"
          navigateTo={`/${userRole}/subscriptions`}
          icon={<FileText className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300"
          iconClassName="bg-blue-100 text-blue-600"
          isLoading={isLoadingPlans}
        />
        
        <OverviewSection
          title="Invoices"
          buttonText="Manage Invoices"
          navigateTo={`/${userRole}/invoices`}
          icon={<FileText className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300"
          iconClassName="bg-green-100 text-green-600"
          isLoading={false}
        />
        
        <OverviewSection
          title="Create New Account"
          buttonText="Create Account"
          navigateTo={`/${userRole}/companies/new`}
          icon={<PlusCircle className="h-5 w-5" />}
          className="bg-gradient-to-br from-orange-50 to-orange-200 hover:from-orange-100 hover:to-orange-300 transition-all duration-300"
          iconClassName="bg-orange-200 text-orange-600"
          isLoading={false}
        />
      </div>

      <MetricsSummary />

      <SubscriptionTable 
        subscriptions={subscriptions.length > 0 ? subscriptions : []} 
        isLoading={isLoadingCompanies} 
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Index;
