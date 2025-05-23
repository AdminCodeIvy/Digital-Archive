
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

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

// Function to create a document tag
const createDocumentTag = async (data: { title: string; properties: { name: string; type: string }[] }) => {
  const response = await fetch('https://digital-archive-beta.vercel.app/document-tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${document.cookie.split('jwt_token=')[1]?.split(';')[0] || ''}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to create document tag');
  }

  return response.json();
};

const CreateDocumentTag = () => {
  const navigate = useNavigate();
  const [tagTitle, setTagTitle] = useState('');
  const [fields, setFields] = useState<Property[]>([
    { id: 1, name: '', type: '' }
  ]);
  
  // Get current date and time
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  // Mutation for creating document tag
  const mutation = useMutation({
    mutationFn: createDocumentTag,
    onSuccess: () => {
      toast.success("Document tag created successfully!");
      navigate('/client/documents/tags');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create document tag: ${error.message}`);
    },
  });

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
    
    if (!tagTitle) {
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
    
    mutation.mutate({ title: tagTitle, properties });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => navigate('/client/documents/tags')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Create New Document Tag</h1>
          </div>
          <p className="text-sm text-muted-foreground">Document Management &gt; Document Tag</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tagTitle">Document Tag Title</Label>
            <Input 
              id="tagTitle"
              className="mt-2"
              placeholder="Enter document tag title"
              value={tagTitle}
              onChange={(e) => setTagTitle(e.target.value)}
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

        <div className="flex justify-end gap-4 pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/client/documents/tags')}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-orange-500 hover:bg-orange-600 text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateDocumentTag;
