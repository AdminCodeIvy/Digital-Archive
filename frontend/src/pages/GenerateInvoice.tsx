
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCompany, sendInvoice, checkInvoiceSubmission } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

const GenerateInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSendInvoiceButton, setShowSendInvoiceButton] = useState(false);

  // Fetch company data
  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompany(id as string),
    enabled: !!id,
  });

  // Check if we can show the send invoice button
  const { refetch: refetchInvoiceSubmission } = useQuery({
    queryKey: ['invoice-submission'],
    queryFn: checkInvoiceSubmission,
    onSuccess: (data) => {
      if (data?.data?.showSendInvoice) {
        setShowSendInvoiceButton(true);
      } else {
        setShowSendInvoiceButton(false);
      }
    },
  });

  const company = companyData?.data;
  const currentDate = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  const invoiceNo = `INV${Math.floor(Math.random() * 100000)}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateFormatted = dueDate.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleSubmitInvoice = async () => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await sendInvoice(id);
      toast.success('Invoice submitted successfully');
      
      // After successful submission, check if we should show the send invoice button
      await refetchInvoiceSubmission();
      
      navigate('/');
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast.error('Failed to submit invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-3">Loading company details...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-2">Company Not Found</h2>
        <p className="text-muted-foreground mb-4">The company you are looking for does not exist.</p>
        <Button onClick={() => navigate('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Company #{company.id.substring(0, 5)}</h1>
          <p className="text-muted-foreground">Clients</p>
        </div>
        <div className="text-right text-sm text-gray-500">{currentDate}</div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">{company.name} - Invoice</h2>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-gray-500 mb-1">Bill To</div>
              <div className="font-medium">{company.name}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-gray-500">Invoice No.</div>
                <div className="font-medium">{invoiceNo}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-gray-500">Issue Date</div>
                <div>{new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-gray-500">Due Date</div>
                <div>{dueDateFormatted}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-gray-500">Reference</div>
                <div>{invoiceNo}</div>
              </div>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 px-4 text-left">Company ID</th>
                  <th className="py-3 px-4 text-left">Storage Assigned</th>
                  <th className="py-3 px-4 text-left">Documents Viewed</th>
                  <th className="py-3 px-4 text-left">Documents Downloaded</th>
                  <th className="py-3 px-4 text-left">Documents Scanned</th>
                  <th className="py-3 px-4 text-left">Documents Indexed</th>
                  <th className="py-3 px-4 text-left">Documents QA Passed</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 border-t">{company.id.substring(0, 5)}</td>
                  <td className="py-3 px-4 border-t">{company.storage_assigned} GB</td>
                  <td className="py-3 px-4 border-t">{company.documents_viewed}</td>
                  <td className="py-3 px-4 border-t">{company.documents_downloaded}</td>
                  <td className="py-3 px-4 border-t">{company.documents_scanned}</td>
                  <td className="py-3 px-4 border-t">{company.documents_indexed}</td>
                  <td className="py-3 px-4 border-t">{company.documents_qa_passed}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <div className="w-1/3">
              <div className="flex justify-between py-2 border-b">
                <div className="font-medium">TOTAL (USD)</div>
                <div className="font-medium">${company.invoice_value_total || 0}.00</div>
              </div>
              <div className="flex justify-between py-2">
                <div className="font-medium">TOTAL DUE (USD)</div>
                <div className="font-medium">${company.invoice_value_total || 0}.00</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/invoices')}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleSubmitInvoice}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>

        {showSendInvoiceButton && (
          <Button 
            className="bg-green-500 hover:bg-green-600 ml-2"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Current Month Invoices
          </Button>
        )}
      </div>
    </div>
  );
};

export default GenerateInvoice;
