
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
import { Loader2, FileText, Search, RefreshCw, Mail, Plus, Send } from 'lucide-react';
import {
  fetchCompanies,
  fetchInvoices,
  generateInvoices,
  sendInvoiceReminders,
  checkInvoiceSubmission,
  submitAllCompaniesInvoices
} from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Invoice } from '@/types';
import CreateCustomInvoiceModal from '@/components/invoices/CreateCustomInvoiceModal';
import InvoiceFilters, { InvoicePeriod, InvoiceStatus, InvoiceType } from '@/components/invoices/InvoiceFilters';
import { isCurrentMonth, isLastMonth } from '@/utils/dateFilters';

const Invoices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'owner';
  const [isCustomInvoiceModalOpen, setIsCustomInvoiceModalOpen] = useState(false);
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

  // Check if we should show the "Send Current Month Invoice" button
  const { data: checkInvoiceData } = useQuery({
    queryKey: ['check-invoice-submission'],
    queryFn: checkInvoiceSubmission,
  });

  React.useEffect(() => {
    if (checkInvoiceData?.data) {
      setShowSendInvoiceButton(checkInvoiceData.data.showSendInvoice);
    }
  }, [checkInvoiceData]);

  const generateInvoicesMutation = useMutation({
    mutationFn: generateInvoices,
    onSuccess: async (data) => {
      if (data?.data && Array.isArray(data.data)) {
        const created = data.data.filter(item =>
          item.status === 'Invoice created' || item.status === 'Invoice created and emailed'
        );
      
        if (created.length > 0) {
          const { data: invoices } = await refetchInvoices();
          if (invoices?.data?.some(invoice => invoice.is_submitted === false)) {
            setShowSendInvoiceButton(true)
          }
          toast.info('Invoice Generated Successfully');
        } else {
          toast.info('All invoices for current month already generated');
        }
      }
    },
    onError: (error) => {
      toast.error('Failed to generate invoices');
    }
  });

  const sendRemindersMutation = useMutation({
    mutationFn: sendInvoiceReminders,
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

  const submitAllInvoicesMutation = useMutation({
    mutationFn: submitAllCompaniesInvoices,
    onSuccess: () => {
      toast.success("All invoices sent successfully");
      setShowSendInvoiceButton(false);
      refetchInvoices();
    },
    onError: () => {
      toast.error("Failed to submit invoices");
    }
  });

  const isLoading = isLoadingInvoices || isLoadingCompanies || generateInvoicesMutation.isPending || sendRemindersMutation.isPending;

  const handleGenerateInvoices = () => {
    generateInvoicesMutation.mutate();
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
      return 'Admin Verified';
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
        <p className="text-muted-foreground">Manage invoices for all companies</p>
      </div>

      <div className="flex flex-col justify-start items-start">
        <div className="relative w-full flex flex-row w-full gap-5">
          <div className='w-full'>
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {
            isAdmin && (
              <>
                <Button
                  onClick={() => setIsCustomInvoiceModalOpen(true)}
                  variant="outline"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Custom Invoice
                </Button>

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
                  onClick={handleGenerateInvoices}
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={generateInvoicesMutation.isPending}
                >
                  {generateInvoicesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Invoices
                    </>
                  )}
                </Button>
              </>
            )
          }
        </div>

        <div className="flex gap-4 mt-5">
          {isAdmin && (
            <>
              {showSendInvoiceButton && (
                <Button
                  onClick={() => submitAllInvoicesMutation.mutate()}
                  className="bg-green-500 hover:bg-green-600"
                  disabled={submitAllInvoicesMutation.isPending}
                >
                  {submitAllInvoicesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Current Month Invoices
                    </>
                  )}
                </Button>
              )}
            </>
          )}
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
                <TableHead>Company</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Admin Verified</TableHead>
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
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                          {invoice.company_name?.[0] || 'C'}
                        </div>
                        <span>{invoice.company_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.invoice_month || 'Current Month'}</TableCell>
                    <TableCell>{invoice.owner_name || 'Not specified'}</TableCell>
                    <TableCell>
                    ${parseFloat(invoice.invoice_value || invoice.amount || invoice.total || 0).toFixed(2)}
                    </TableCell>
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

      <CreateCustomInvoiceModal
        isOpen={isCustomInvoiceModalOpen}
        onClose={() => setIsCustomInvoiceModalOpen(false)}
        onSuccess={() => {
          // Refetch invoices after successful creation
          refetchInvoices();
        }}
      />
    </div>
  );
};

export default Invoices;
