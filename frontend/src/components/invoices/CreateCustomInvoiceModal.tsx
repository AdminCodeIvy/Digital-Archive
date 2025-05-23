
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash, RefreshCw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchCompanies, createCustomInvoice, updateCustomInvoice, fetchCustomInvoice } from '@/services/api';
import { CustomInvoice, InvoiceQuantity } from '@/types';
import { DatePicker } from '@/components/ui/date-picker';

interface CreateCustomInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId?: string;
  onSuccess?: () => void;
}

const DEFAULT_LINE_ITEM: InvoiceQuantity = {
  description: '',
  quantity: 1,
  rate: 0,
  amount: 0,
};

const calculateAmount = (quantity: number, rate: number): number => {
  return quantity * rate;
};

const calculateSubtotal = (quantities: InvoiceQuantity[]): number => {
  return quantities.reduce((sum, item) => sum + (item.amount || 0), 0);
};

const calculateTotal = (subtotal: number, discountPercent: number, taxPercent: number): number => {
  const afterDiscount = subtotal * (1 - discountPercent / 100);
  return afterDiscount * (1 + taxPercent / 100);
};

export const CreateCustomInvoiceModal: React.FC<CreateCustomInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
}) => {
  const [invoice, setInvoice] = useState<CustomInvoice>({
    is_client: true,
    date: format(new Date(), 'yyyy-MM-dd'),
    payment_term: 'Net 30',
    due_date: format(new Date(new Date().setDate(new Date().getDate() + 30)), 'yyyy-MM-dd'),
    company_name: '',
    bill_to: '',
    quantities: [{ ...DEFAULT_LINE_ITEM }],
    subtotal: 0,
    discount_percent: 0,
    tax_percent: 0,
    total: 0,
    notes: ''
  });

  const isEditMode = !!invoiceId;

  const { data: companiesData, isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });

  const { data: existingInvoice, isLoading: isLoadingInvoice } = useQuery({
    queryKey: ['custom-invoice', invoiceId],
    queryFn: () => fetchCustomInvoice(invoiceId as string),
    enabled: isEditMode && isOpen,
  });

  useEffect(() => {
    if (existingInvoice?.data && isEditMode) {
      setInvoice(existingInvoice.data);
    }
  }, [existingInvoice, isEditMode]);

  const createInvoiceMutation = useMutation({
    mutationFn: (data: CustomInvoice) => isEditMode 
      ? updateCustomInvoice(invoiceId as string, data) 
      : createCustomInvoice(data),
    onSuccess: () => {
      toast.success(isEditMode ? 'Invoice updated successfully' : 'Invoice created successfully');
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast.error(isEditMode ? 'Failed to update invoice' : 'Failed to create invoice');
    }
  });

  const handleInputChange = (field: keyof CustomInvoice, value: any) => {
    setInvoice(prev => {
      const updated = { ...prev, [field]: value };
      
      if (field === 'discount_percent' || field === 'tax_percent') {
        updated.total = calculateTotal(updated.subtotal, updated.discount_percent, updated.tax_percent);
      }
      
      return updated;
    });
  };

  const handleQuantityChange = (index: number, field: keyof InvoiceQuantity, value: any) => {
    setInvoice(prev => {
      const updatedQuantities = [...prev.quantities];
      updatedQuantities[index] = { 
        ...updatedQuantities[index], 
        [field]: value 
      };

      if (field === 'quantity' || field === 'rate') {
        updatedQuantities[index].amount = calculateAmount(
          updatedQuantities[index].quantity,
          updatedQuantities[index].rate
        );
      }

      const subtotal = calculateSubtotal(updatedQuantities);
      const total = calculateTotal(subtotal, prev.discount_percent, prev.tax_percent);
      
      return {
        ...prev,
        quantities: updatedQuantities,
        subtotal,
        total
      };
    });
  };

  const handleAddLineItem = () => {
    setInvoice(prev => ({
      ...prev,
      quantities: [...prev.quantities, { ...DEFAULT_LINE_ITEM }]
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    if (invoice.quantities.length <= 1) {
      return; // Keep at least one line item
    }

    setInvoice(prev => {
      const updatedQuantities = prev.quantities.filter((_, i) => i !== index);
      const subtotal = calculateSubtotal(updatedQuantities);
      const total = calculateTotal(subtotal, prev.discount_percent, prev.tax_percent);
      
      return {
        ...prev,
        quantities: updatedQuantities,
        subtotal,
        total
      };
    });
  };

  const handleDateChange = (field: 'date' | 'due_date', date: Date | undefined) => {
    if (date) {
      handleInputChange(field, format(date, 'yyyy-MM-dd'));
    }
  };

  const handleCompanyChange = (companyName: string) => {
    if (companiesData?.data) {
      const selectedCompany = companiesData.data.find((company: any) => company.name === companyName);
      if (selectedCompany) {
        handleInputChange('company_name', companyName);
        handleInputChange('company_id', selectedCompany.id);
      }
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!invoice.company_name || !invoice.date || !invoice.due_date || !invoice.payment_term) {
      toast.error("Please fill all required fields");
      return;
    }

    // Validate line items
    if (invoice.quantities.some(q => !q.description || q.quantity <= 0)) {
      toast.error("Please complete all line items (description and quantity are required)");
      return;
    }

    createInvoiceMutation.mutate(invoice);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {isEditMode ? 'Edit Custom Invoice' : 'Create Custom Invoice'}
          </DialogTitle>
        </DialogHeader>

        {(isLoadingInvoice || isLoadingCompanies) ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 text-orange-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Select
                    value={invoice.company_name}
                    onValueChange={handleCompanyChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companiesData?.data?.map((company: any) => (
                        <SelectItem key={company.id} value={company.name}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="date">Date</Label>
                    <DatePicker
                      date={invoice.date ? new Date(invoice.date) : undefined}
                      onSelect={(date) => handleDateChange('date', date)}
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="invoice_number">Invoice #</Label>
                    <Input
                      id="invoice_number"
                      placeholder="Auto-generated"
                      disabled
                      value={invoiceId || '#'}
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="payment_term">Payment Terms</Label>
                    <Input
                      id="payment_term"
                      placeholder="E.g., Net 30"
                      value={invoice.payment_term}
                      onChange={(e) => handleInputChange('payment_term', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="due_date">Due Date</Label>
                    <DatePicker
                      date={invoice.due_date ? new Date(invoice.due_date) : undefined}
                      onSelect={(date) => handleDateChange('due_date', date)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="space-y-2">
              <Label htmlFor="bill_to">Bill To (Optional)</Label>
              <Textarea
                id="bill_to"
                placeholder="Billing address or contact details"
                value={invoice.bill_to || ''}
                onChange={(e) => handleInputChange('bill_to', e.target.value)}
                rows={3}
              />
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-md p-3">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-center">Rate</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-1"></div>
                </div>
              </div>

              {invoice.quantities.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input
                      placeholder="Description of item/service..."
                      value={item.description}
                      onChange={(e) => handleQuantityChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, 'quantity', Number(e.target.value))}
                      className="text-center"
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleQuantityChange(index, 'rate', Number(e.target.value))}
                        className="pl-7 text-center"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-right py-2 px-3">
                    ${item.amount.toFixed(2)}
                  </div>
                  <div className="col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveLineItem(index)}
                      disabled={invoice.quantities.length <= 1}
                    >
                      <Trash className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={handleAddLineItem}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Line Item
              </Button>

              {/* Totals */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="space-y-3">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or terms..."
                    rows={4}
                    value={invoice.notes || ''}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                  />
                </div>

                <div className="space-y-3 border-l pl-8">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Discount:</span>
                      <div className="w-20">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={invoice.discount_percent}
                          onChange={(e) => handleInputChange('discount_percent', Number(e.target.value))}
                          className="h-8 text-right"
                        />
                      </div>
                      <span className="ml-2">%</span>
                    </div>
                    <span className="font-medium">
                      -${(invoice.subtotal * (invoice.discount_percent / 100)).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className="text-gray-600 mr-2">Tax:</span>
                      <div className="w-20">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={invoice.tax_percent}
                          onChange={(e) => handleInputChange('tax_percent', Number(e.target.value))}
                          className="h-8 text-right"
                        />
                      </div>
                      <span className="ml-2">%</span>
                    </div>
                    <span className="font-medium">
                      +${(invoice.subtotal * (1 - invoice.discount_percent / 100) * (invoice.tax_percent / 100)).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-t mt-2">
                    <span className="text-gray-800 font-medium">Total:</span>
                    <span className="text-xl font-semibold">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex items-center justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={createInvoiceMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={createInvoiceMutation.isPending}
          >
            {createInvoiceMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>{isEditMode ? 'Update Invoice' : 'Create Invoice'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomInvoiceModal;
