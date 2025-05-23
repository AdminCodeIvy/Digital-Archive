
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, DollarSign } from 'lucide-react';
import { CustomInvoiceItem } from '@/types';
import { toast } from 'sonner';

interface CustomInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (items: CustomInvoiceItem[]) => void;
  initialItems?: CustomInvoiceItem[];
  isLoading?: boolean;
}

export const CustomInvoiceModal: React.FC<CustomInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItems = [],
  isLoading = false,
}) => {
  const [items, setItems] = useState<CustomInvoiceItem[]>([]);

  useEffect(() => {
    // Initialize with existing items or a single empty item
    setItems(initialItems.length > 0 
      ? [...initialItems] 
      : [{ type: '', ammount: 0 }]
    );
  }, [initialItems, isOpen]);

  const handleAddItem = () => {
    setItems([...items, { type: '', ammount: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'type' | 'ammount', value: string | number) => {
    const newItems = [...items];
    if (field === 'ammount') {
      // Ensure it's converted to a number
      newItems[index][field] = Number(value);
    } else {
      newItems[index][field] = value as string;
    }
    setItems(newItems);
  };

  const handleSave = () => {
    const hasEmptyFields = items.some(item => !item.type);
    if (hasEmptyFields) {
      toast.error("Please fill all fields with valid values");
      return;
    }

    onSave(items);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.ammount || 0), 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Custom Invoice Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="text-sm text-gray-500 mb-2">
            Add custom items to this invoice (e.g., additional services, fees)
          </div>
          
          {items.map((item, index) => (
            <div key={index} className="flex items-end space-x-2">
              <div className="flex-1">
                <Label htmlFor={`item-type-${index}`} className="text-xs">Item Description</Label>
                <Input
                  id={`item-type-${index}`}
                  value={item.type}
                  onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                  placeholder="e.g., Custom Service"
                  disabled={isLoading}
                />
              </div>
              <div className="w-24">
                <Label htmlFor={`item-amount-${index}`} className="text-xs">Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    id={`item-amount-${index}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.ammount || ''}
                    onChange={(e) => handleItemChange(index, 'ammount', e.target.value)}
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length <= 1 || isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={handleAddItem}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Item
          </Button>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between font-semibold">
              <span>Total Custom Items:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomInvoiceModal;
