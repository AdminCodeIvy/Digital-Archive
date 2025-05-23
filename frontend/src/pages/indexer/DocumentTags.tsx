
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Filter as FilterIcon, Folder, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// API function to fetch document tags
const fetchDocumentTags = async () => {
  try {
    const response = await fetch('https://digital-archive-beta.vercel.app/document-tags', {
      headers: {
        'Authorization': `Bearer ${document.cookie.split('jwt_token=')[1]?.split(';')[0] || ''}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch document tags');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching document tags:', error);
    toast.error('Failed to fetch document tags');
    return [];
  }
};

const DocumentTags = () => {
  const navigate = useNavigate();
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch document tags from API
  const { data: documentTags = [], isLoading, error } = useQuery({
    queryKey: ['documentTags'],
    queryFn: fetchDocumentTags
  });
  
  // Filter tags based on search query
  const filteredTags = documentTags.filter(tag => 
    tag.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Document Tag</h1>
          <p className="text-sm text-muted-foreground">Document Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
          </div>
          <Input 
            type="search" 
            className="pl-10" 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* <Button variant="outline" size="sm" className="gap-2">
          <FilterIcon className="h-4 w-4" />
          Filter
        </Button> */}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Failed to load document tags. Please try again later.
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No matching document tags found.' : 'No document tags found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTags.map((tag) => (
            <Card key={tag.id} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Folder className="h-6 w-6 text-orange-500" />
                    <h3 className="text-lg font-medium">
                      {tag.title.length > 20 ? tag.title.substring(0, 20) + '...' : tag.title}
                    </h3>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Documents</p>
                  <p className="text-3xl font-bold text-orange-500">
                    {(tag.complete_documents || 0) + (tag.incomplete_documents || 0)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Incomplete</p>
                    <Badge tag={tag.incomplete_documents || 0} color="red" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <Badge tag={tag.complete_documents || 0} color="green" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Badge component for document counts
const Badge = ({ tag, color }: { tag: number, color: 'red' | 'green' }) => {
  return (
    <div className={`mt-1 inline-block rounded-md px-2 py-1 text-xs font-medium ${
      color === 'red' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
    }`}>
      {tag}
    </div>
  );
};

export default DocumentTags;
