
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

// Input types for document fields
const inputTypes = [
  { value: 'Text', label: 'Text' },
  { value: 'Number', label: 'Number' },
  { value: 'Date', label: 'Date' },
];

interface Property {
  id: number;
  name: string;
  type: string;
}

interface EditDocumentTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tagData: { title: string; properties: { name: string; type: string }[] }) => void;
  tag: any;
  isSaving: boolean;
}

export const EditDocumentTagModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  tag,
  isSaving
}: EditDocumentTagModalProps) => {
  const [title, setTitle] = useState('');
  const [fields, setFields] = useState<Property[]>([]);

  // Initialize form data when tag changes
  useEffect(() => {
    if (tag) {
      setTitle(tag.title || '');
      
      // Map properties to fields with unique IDs
      if (tag.properties && Array.isArray(tag.properties)) {
        const mappedFields = tag.properties.map((prop: any, index: number) => ({
          id: index + 1,
          name: prop.name || '',
          type: prop.type || ''
        }));
        
        setFields(mappedFields.length ? mappedFields : [{ id: 1, name: '', type: '' }]);
      } else {
        setFields([{ id: 1, name: '', type: '' }]);
      }
    }
  }, [tag]);

  // Update field name
  const handleNameChange = (fieldId: number, value: string) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, name: value } : field
    ));
  };

  // Update field type
  const handleTypeChange = (fieldId: number, value: string) => {
    setFields(fields.map(field => 
      field.id === fieldId ? { ...field, type: value } : field
    ));
  };

  // Add new empty field
  const addNewField = () => {
    const newId = Math.max(0, ...fields.map(f => f.id)) + 1;
    setFields([...fields, { id: newId, name: '', type: '' }]);
  };

  // Remove a field
  const removeField = (fieldId: number) => {
    if (fields.length > 1) {
      setFields(fields.filter(field => field.id !== fieldId));
    } else {
      toast.error("You must have at least one field");
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error("Please enter a document tag title");
      return;
    }
    
    // Validate if all fields have names and types
    const hasEmptyFields = fields.some(field => !field.name || !field.type);
    
    if (hasEmptyFields) {
      toast.error("Please fill in all field names and select input types");
      return;
    }
    
    // Prepare data for API submission
    const properties = fields.map(field => ({
      name: field.name,
      type: field.type
    }));
    
    onSave({ title, properties });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Edit Document Tag</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="tagTitle">Document Tag Title</Label>
              <Input 
                id="tagTitle"
                className="mt-2"
                placeholder="Enter document tag title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid md:grid-cols-3 gap-4 items-start border-b pb-4">
                <div>
                  <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
                  <Input 
                    id={`field-name-${field.id}`}
                    value={field.name}
                    onChange={(e) => handleNameChange(field.id, e.target.value)}
                    placeholder="Enter field name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor={`field-type-${field.id}`}>Input Type</Label>
                  <Select 
                    value={field.type} 
                    onValueChange={(value) => handleTypeChange(field.id, value)}
                  >
                    <SelectTrigger id={`field-type-${field.id}`} className="mt-2">
                      <SelectValue placeholder="Select Input Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inputTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end justify-center mt-8">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={() => removeField(field.id)}
                    className="h-9 w-9 rounded-full border-red-200 bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button 
              type="button" 
              variant="outline" 
              onClick={addNewField}
              className="w-full border-orange-200 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Entry Field
            </Button>
          </div>

          <DialogFooter className="flex justify-end gap-4 pt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
