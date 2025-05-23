import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, FileText, Search, RefreshCw } from 'lucide-react';
import { fetchCompanies, fetchInvoices, generateInvoices, checkInvoiceSubmission, submitAllCompaniesInvoices } from '@/services/api';
import { Invoice } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import InvoiceFilters, { InvoicePeriod, InvoiceStatus, InvoiceType } from '@/components/invoices/InvoiceFilters';
import { isCurrentMonth, isLastMonth } from '@/utils/dateFilters';

const ClientInvoice = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';
  const [showSendInvoiceButton, setShowSendInvoiceButton] = useState(false);
  
  // Filter states
  const [periodFilter, setPeriodFilter] = useState<InvoicePeriod>('all');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [typeFilter, setTypeFilter] = useState<InvoiceType>('all');

  const { 
    data: invoicesData, 
    isLoading: isLoadingInvoices, 
    refetch: refetchInvoices 
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });

  const { 
    data: companiesData, 
    isLoading: isLoadingCompanies 
  } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });

  // Add query to check if send invoice button should be shown
  const { data: invoiceSubmissionData, refetch: refetchInvoiceSubmission } = useQuery({
    queryKey: ['invoiceSubmission'],
    queryFn: checkInvoiceSubmission,
    onSuccess: (data) => {
      if (data?.data?.showSendInvoice) {
        setShowSendInvoiceButton(true);
      } else {
        setShowSendInvoiceButton(false);
      }
    },
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: generateInvoices,
    onSuccess: (data) => {
      toast.success('Invoices generated successfully');
      refetchInvoices();
      
      // Check if we should show the "Send Current Month Invoice" button after generating
      refetchInvoiceSubmission();
      
      // Show detailed results
      if (data?.data && Array.isArray(data.data)) {
        const created = data.data.filter(item => item.status === 'Invoice created and emailed').length;
        const existing = data.data.filter(item => item.status === 'Already exists').length;
        const failed = data.data.filter(item => item.status.includes('failed')).length;
        
        toast.info(`Invoice Generated Successfully`);
      }
    },
    onError: (error) => {
      toast.error('Failed to generate invoices');
    }
  });

  // Add mutation for submitting all company invoices
  const submitAllInvoicesMutation = useMutation({
    mutationFn: submitAllCompaniesInvoices,
    onSuccess: () => {
      toast.success('All invoices sent successfully');
      setShowSendInvoiceButton(false); // Hide the button after successful submission
      refetchInvoices();
    },
    onError: (error) => {
      toast.error('Failed to submit client invoices');
    }
  });

  const isLoading = isLoadingInvoices || isLoadingCompanies || generateInvoicesMutation.isPending;

  const handleGenerateInvoices = () => {
    generateInvoicesMutation.mutate();
  };

  const handleSubmitAllInvoices = () => {
    submitAllInvoicesMutation.mutate();
  };

  const filteredInvoices = React.useMemo(() => {
    if (!invoicesData?.data) return [];
    
    return invoicesData.data.filter((invoice: Invoice) => {
      // Apply text search filter
      const matchesSearch = 
        invoice.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoice_month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // Apply period filter
      if (periodFilter === 'current_month' && !isCurrentMonth(invoice.created_at)) {
        return false;
      }
      
      if (periodFilter === 'last_month' && !isLastMonth(invoice.created_at)) {
        return false;
      }
      
      // Apply status filter
      if (statusFilter === 'paid' && !invoice.invoice_submitted) {
        return false;
      }
      
      if (statusFilter === 'unpaid' && invoice.invoice_submitted) {
        return false;
      }
      
      // Apply type filter
      if (typeFilter === 'custom' && invoice.type !== 'custom') {
        return false;
      }
      
      if (typeFilter === 'monthly' && invoice.type === 'custom') {
        return false;
      }
      
      return true;
    });
  }, [invoicesData, searchTerm, periodFilter, statusFilter, typeFilter]);

  const getStatusBadgeClass = (submitted: boolean | undefined, adminVerified: boolean | undefined) => {
    if (adminVerified) {
      return 'bg-green-100 text-green-800';
    } else if (submitted) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (submitted: boolean | undefined, adminVerified: boolean | undefined) => {
    if (adminVerified) {
      return 'Owner Verified';
    } else if (submitted) {
      return 'Submitted';
    } else {
      return 'Pending';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Invoice Management</h1>
        <p className="text-muted-foreground">Manage invoices</p>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          {showSendInvoiceButton && (
            <Button 
              variant="success"
              className="flex items-center gap-2"
              onClick={handleSubmitAllInvoices}
              disabled={submitAllInvoicesMutation.isPending}
            >
              {submitAllInvoicesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              Send Current Month Invoice
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate(`/${userRole}/dashboard`)}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Add Invoice Filters */}
      <InvoiceFilters 
        period={periodFilter}
        status={statusFilter}
        type={typeFilter}
        onPeriodChange={setPeriodFilter}
        onStatusChange={setStatusFilter}
        onTypeChange={setTypeFilter}
      />

      {isLoading && !generateInvoicesMutation.isPending ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="ml-3">Loading invoices...</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner Verified</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice: Invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {invoice.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{invoice.invoice_month || 'Current Month'}</TableCell>
                    <TableCell>{invoice.owner_name || 'Not specified'}</TableCell>
                    <TableCell>${invoice.invoice_value || invoice.amount || Math.round(invoice.total * 100) / 100 || 0}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(invoice.invoice_submitted, invoice.invoice_submitted_admin)}>
                        {getStatusText(invoice.invoice_submitted, invoice.invoice_submitted_admin)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeClass(invoice.invoice_submitted_admin, invoice.invoice_submitted_admin)}>
                        {getStatusText(invoice.invoice_submitted_admin, invoice.invoice_submitted_admin)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.created_at 
                        ? new Date(invoice.created_at).toLocaleDateString() 
                        : 'Unknown date'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs border border-orange-200 hover:bg-orange-50"
                        onClick={() => navigate(`/${userRole}/invoices/${invoice.id}`)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {searchTerm || periodFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'No invoices found matching your filters' 
                      : 'No invoices found. Generate new invoices to get started.'
                    }
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ClientInvoice;
