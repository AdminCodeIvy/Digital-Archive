
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Search, Plus, FileText } from 'lucide-react';
import { toast } from 'sonner';

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
    throw error;
  }
};

const DocumentTags = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: tags = [], isLoading, error } = useQuery({
    queryKey: ['documentTags'],
    queryFn: fetchDocumentTags,
    meta: {
      onError: (err: Error) => {
        toast.error(`Error loading document tags: ${err.message || 'Unknown error'}`);
      },
    },
  });
  
  // Filter tags based on search term
  const filteredTags = searchTerm 
    ? tags.filter((tag: any) => 
        tag.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : tags;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Document Tags</h1>
          <p className="text-sm text-muted-foreground">View and manage document tag templates</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tags..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      ) : error ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-red-500">Error loading tags. Please try again.</p>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
            <Tag className="h-10 w-10 text-orange-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium">No document tags found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first document tag.'}
          </p>
          <div className="mt-6">
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => navigate('/client/documents/tags/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Tag
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTags.map((tag: any) => (
            <div 
              key={tag.id}
              className="border rounded-lg p-5 hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="bg-orange-100 rounded-full p-2 mr-3">
                    <Tag className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{tag.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{tag.properties?.length || 0} fields defined</p>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 p-0 h-8 w-8"
                  onClick={() => navigate(`/client/documents/upload?tagId=${tag.id}`)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
              
              {tag.properties && tag.properties.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium text-gray-600">Fields:</p>
                  <div className="flex flex-wrap gap-2">
                    {tag.properties.slice(0, 3).map((prop: any, index: number) => (
                      <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {prop.name}
                      </span>
                    ))}
                    {tag.properties.length > 3 && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        +{tag.properties.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentTags;
