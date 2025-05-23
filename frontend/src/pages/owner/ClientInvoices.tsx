
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
import { Loader2, FileText, Search, RefreshCw, Mail, Plus } from 'lucide-react';
import { checkInvoiceSubmission, fetchClientInvoices, generateClientInvoices, sendUnpaidInvoiceReminders, submitAllCompaniesInvoices } from '@/services/api';
import { Invoice } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import CreateClientCustomInvoiceModal from '@/components/invoices/CreateClientCustomInvoiceModal';
import InvoiceFilters, { InvoicePeriod, InvoiceStatus, InvoiceType } from '@/components/invoices/InvoiceFilters';
import { isCurrentMonth, isLastMonth } from '@/utils/dateFilters';

const ClientInvoices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';
  const isAdmin = userRole === 'owner';
  const [isCustomInvoiceModalOpen, setIsCustomInvoiceModalOpen] = useState(false);
  const [showSendInvoiceButton, setShowSendInvoiceButton] = useState(false);

  // Filter states
  const [periodFilter, setPeriodFilter] = useState<InvoicePeriod>('all');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [typeFilter, setTypeFilter] = useState<InvoiceType>('all');

  const {
    data: clientInvoicesData,
    isLoading: isLoadingInvoices,
    refetch: refetchInvoices
  } = useQuery({
    queryKey: ['client-invoices'],
    queryFn: fetchClientInvoices,
  });

  const generateInvoicesMutation = useMutation({
    mutationFn: generateClientInvoices,
    onSuccess: async (data) => {
      console.log("dataaaaa", data)
      if (data?.data && Array.isArray(data.data?.results)) {
        const created = data.data.results.filter(item =>
          item.status === 'Invoice created' || item.status === "Invoice generated successfully"
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
      console.log('error', error)
      refetchInvoices();
    }
  });

  const { data: checkInvoiceData } = useQuery({
    queryKey: ['check-invoice-submission'],
    queryFn: checkInvoiceSubmission,
  });

  React.useEffect(() => {
    if (checkInvoiceData?.data) {
      setShowSendInvoiceButton(checkInvoiceData.data.showSendInvoice);
    }
  }, [checkInvoiceData]);


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

  const handleSubmitAllInvoices = () => {
    submitAllInvoicesMutation.mutate();
  };

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

  const filteredInvoices = React.useMemo(() => {
    if (!clientInvoicesData?.data) return [];

    return clientInvoicesData.data.filter((invoice: Invoice) => {
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
  }, [clientInvoicesData, searchTerm, periodFilter, statusFilter, typeFilter]);

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
      <div className="rounded-lg bg-gradient-to-r from-orange-100 via-amber-50 to-orange-50 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Client Invoices</h1>
            <p className="text-sm text-gray-600 mt-1">Manage invoices for your clients</p>
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Button
                onClick={() => setIsCustomInvoiceModalOpen(true)}
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Invoice
              </Button>
            )}
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
          </div>
        </div>
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

      {isLoadingInvoices ? (
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
                        onClick={() => navigate(`/${userRole}/client-invoices/${invoice.id}`)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
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

      <CreateClientCustomInvoiceModal
        isOpen={isCustomInvoiceModalOpen}
        onClose={() => setIsCustomInvoiceModalOpen(false)}
        onSuccess={() => {
          refetchInvoices();
        }}
      />
    </div>
  );
};

export default ClientInvoices;
