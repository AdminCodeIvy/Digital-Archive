
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, CheckCircle2, Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchInvoices, fetchCustomInvoice, submitInvoice, updateInvoiceCustomItems } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { CustomInvoiceItem, Invoice } from '@/types';
import CustomInvoiceModal from '@/components/invoices/CustomInvoiceModal';

const InvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';
  const isAdmin = userRole === 'admin';
  const isOwner = userRole === 'owner';
  const queryClient = useQueryClient();
  
  const [isCustomItemsModalOpen, setIsCustomItemsModalOpen] = useState(false);

  const { data: invoicesData, isLoading: isInvoicesLoading, refetch: refetchInvoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
  });

  // Get regular invoice first
  const regularInvoice = invoicesData?.data?.find((inv: Invoice) => inv.id === id);
  const isCustomInvoice = regularInvoice?.type === 'custom';
  
  // If it's a custom invoice, fetch its details
  const { data: customInvoiceData, isLoading: isCustomInvoiceLoading, refetch: refetchCustomInvoice } = useQuery({
    queryKey: ['customInvoice', id],
    queryFn: () => fetchCustomInvoice(id || ''),
    enabled: !!id && isCustomInvoice,
  });

  const isLoading = isInvoicesLoading || (isCustomInvoice && isCustomInvoiceLoading);
  
  const invoice = isCustomInvoice && customInvoiceData?.data 
    ? { ...regularInvoice, ...customInvoiceData.data } 
    : regularInvoice;

  const refetchData = async () => {
    await refetchInvoices();
    if (isCustomInvoice) {
      await refetchCustomInvoice();
    }
  };

  const submitInvoiceMutation = useMutation({
    mutationFn: (invoiceId: string) => submitInvoice(invoiceId),
    onSuccess: () => {
      toast.success('Invoice verified successfully');
      refetchData().then(() => {
        navigate(`/${userRole}/invoices`);
      });
    },
    onError: () => {
      toast.error('Failed to verify invoice');
    }
  });

  const updateCustomItemsMutation = useMutation({
    mutationFn: (items: CustomInvoiceItem[]) => {
      if (!id) throw new Error('Invoice ID is required');
      return updateInvoiceCustomItems(id, items);
    },
    onSuccess: (data) => {
      toast.success('Custom invoice items updated successfully');
      if (data?.data?.updated_invoice_value) {
        toast.info(`New invoice total: $${data.data.updated_invoice_value}`);
      }
      setIsCustomItemsModalOpen(false);
      refetchData();
    },
    onError: () => {
      toast.error('Failed to update custom invoice items');
    }
  });

  const handleSubmitInvoice = () => {
    if (!id) return;
    submitInvoiceMutation.mutate(id);
  };

  const handleSaveCustomItems = (items: CustomInvoiceItem[]) => {
    updateCustomItemsMutation.mutate(items);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-3">Loading invoice details...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">Invoice Not Found</h2>
        <p className="text-muted-foreground mb-4">The invoice you are looking for does not exist.</p>
        <Button onClick={() => navigate(`/${userRole}/invoices`)}>Back to Invoices</Button>
      </div>
    );
  }

  // Determine the status badge color and text
  const getStatusBadge = () => {
    if (invoice.invoice_submitted_admin) {
      return <Badge className="bg-green-100 text-green-800">Admin Verified</Badge>;
    } else if (invoice.invoice_submitted) {
      return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if(userRole  === "admin"){
                navigate(`/${userRole}/invoices`)
              }else{
                navigate(`/${userRole}/company-invoices`)
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
          <h1 className="text-2xl font-semibold">Invoice Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          {isCustomInvoice && (
            <Badge className="bg-blue-100 text-blue-800 ml-2">Custom Invoice</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">{invoice.company_name || 'Company'}</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Email: </span>
                  <span>{invoice.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Owner: </span>
                  <span>{invoice.owner_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Invoice ID: </span>
                  <span>{invoice.id}</span>
                </div>
                {isCustomInvoice && invoice.bill_to && (
                  <div>
                    <span className="text-gray-500">Bill To: </span>
                    <span>{invoice.bill_to}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-gray-500">Invoice Month:</div>
                <div className="font-medium">{invoice.invoice_month || 'Current Month'}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-gray-500">Created Date:</div>
                <div>{formatDate(invoice.created_at)}</div>
              </div>
              {isCustomInvoice && invoice.date && (
                <div className="flex justify-between">
                  <div className="text-gray-500">Invoice Date:</div>
                  <div>{formatDate(invoice.date)}</div>
                </div>
              )}
              {isCustomInvoice && invoice.due_date && (
                <div className="flex justify-between">
                  <div className="text-gray-500">Due Date:</div>
                  <div>{formatDate(invoice.due_date)}</div>
                </div>
              )}
              {isCustomInvoice && invoice.payment_term && (
                <div className="flex justify-between">
                  <div className="text-gray-500">Payment Terms:</div>
                  <div>{invoice.payment_term}</div>
                </div>
              )}
              {invoice.paid_date && (
                <div className="flex justify-between">
                  <div className="text-gray-500">Paid Date:</div>
                  <div>{formatDate(invoice.paid_date)}</div>
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-md overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {isCustomInvoice && invoice.quantities ? (
                  invoice.quantities.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} × ${item.rate.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">${item.amount.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <>
                    {invoice.other_invoices && invoice.other_invoices.length > 0 && (
                      invoice.other_invoices.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-3 px-4">{item.type}</td>
                          <td className="py-3 px-4 text-right">${item.ammount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </>
                )}
              </tbody>
              <tfoot>
                {isCustomInvoice ? (
                  <>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold">Subtotal</td>
                      <td className="py-3 px-4 font-semibold text-right">${invoice.subtotal?.toFixed(2) || '0.00'}</td>
                    </tr>
                    {invoice.discount_percent ? invoice.discount_percent > 0 ? (
                      <tr className="bg-gray-50">
                        <td className="py-3 px-4 font-semibold">Discount ({invoice.discount_percent}%)</td>
                        <td className="py-3 px-4 font-semibold text-right">
                          -${((invoice.subtotal || 0) * (invoice.discount_percent / 100)).toFixed(2)}
                        </td>
                      </tr>
                    ) : null : null}
                    {invoice.tax_percent ? invoice.tax_percent > 0 ? (
                      <tr className="bg-gray-50">
                        <td className="py-3 px-4 font-semibold">Tax ({invoice.tax_percent}%)</td>
                        <td className="py-3 px-4 font-semibold text-right">
                          +${((invoice.subtotal || 0) * (1 - invoice.discount_percent / 100) * (invoice.tax_percent / 100)).toFixed(2)}
                        </td>
                      </tr>
                    ) : null : null}
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold">Total</td>
                      <td className="py-3 px-4 font-semibold text-right">${invoice.total?.toFixed(2) || '0.00'}</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold">Documents Uploaded</td>
                      <td className="py-3 px-4 font-semibold text-right">({invoice.document_uploaded || 0}) ${invoice.upload_amount || 0}.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold">Documents Shared</td>
                      <td className="py-3 px-4 font-semibold text-right">({invoice.document_shared || 0}) ${invoice.shared_amount || 0}.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold">Documents Downloaded</td>
                      <td className="py-3 px-4 font-semibold text-right">({invoice.document_downloaded || 0}) ${invoice.download_amount || 0}.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold">Monthly Plan</td>
                      <td className="py-3 px-4 font-semibold text-right">${invoice.monthly || 0}.00</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 font-semibold">Total</td>
                      <td className="py-3 px-4 font-semibold text-right">${invoice.invoice_value || 0}</td>
                    </tr>
                  </>
                )}
              </tfoot>
            </table>
          </div>

          {isCustomInvoice && invoice.notes && (
            <div className="mb-6 border-t pt-4">
              <h3 className="text-sm font-semibold mb-1">Notes:</h3>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            {(isAdmin && !invoice.invoice_submitted) && (
              <Button 
                onClick={() => setIsCustomItemsModalOpen(true)}
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                disabled={isCustomInvoice} // Disable for custom invoices
              >
                <Edit className="mr-2 h-4 w-4" />
                Configure Custom Items
              </Button>
            )}
            <div className="flex-1"></div>
          </div>

          {/* Show verify button only if admin/owner and invoice is submitted but not admin verified */}
          {isAdmin && invoice.invoice_submitted && !invoice.invoice_submitted_admin && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitInvoice}
                disabled={submitInvoiceMutation.isPending}
                className="bg-green-500 hover:bg-green-600"
              >
                {submitInvoiceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verify Invoice
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Show submit button for users who haven't submitted yet */}
          {!invoice.invoice_submitted && isOwner && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmitInvoice}
                disabled={submitInvoiceMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {submitInvoiceMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <CustomInvoiceModal 
        isOpen={isCustomItemsModalOpen}
        onClose={() => setIsCustomItemsModalOpen(false)}
        onSave={handleSaveCustomItems}
        initialItems={invoice.other_invoices || []}
        isLoading={updateCustomItemsMutation.isPending}
      />
    </div>
  );
};

export default InvoiceDetails;
