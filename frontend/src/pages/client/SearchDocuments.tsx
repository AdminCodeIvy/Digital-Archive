
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments } from '@/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentFilterModal, DocumentFilters } from '@/components/filters/DocumentFilterModal';

const SearchDocuments = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>({});
  
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  
  // Fetch documents
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to load documents: ${error.message || 'Unknown error'}`);
      }
    }
  });
  
  console.log("Search page documents data:", documentsData);
  
  const rawDocuments = documentsData?.data || [];
  const documents = Array.isArray(rawDocuments) ? rawDocuments : [];
  
  console.log("Processed documents in Search:", documents);
  
  // Process documents to determine statuses
  const processedDocuments = documents.map((doc: any) => {
    let status = 'pending';
    let progress = 1;
    
    if (doc.indexer_passed_id && doc.qa_passed_id) {
      status = 'complete';
      progress = 3;
    } else if (doc.passed_to) {
      status = 'in-progress';
      progress = 2;
    }
    
    return {
      ...doc,
      status,
      progress_number: doc.progress_number || progress
    };
  });
  
  // Apply filters to documents
  const applyFilters = (filters: DocumentFilters) => {
    setActiveFilters(filters);
  };
  
  // Filter documents based on search and filters
  const filteredDocuments = processedDocuments.filter((doc: any) => {
    // Check search query
    const matchesSearch = searchQuery === '' || 
      (doc.tag_name && doc.tag_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Check status filter
    if (activeFilters.status && activeFilters.status !== 'all') {
      if (activeFilters.status === 'complete' && doc.status !== 'complete') return false;
      if (activeFilters.status === 'incomplete' && doc.status === 'complete') return false;
      if (activeFilters.status === 'unpublished' && (doc.is_published !== false || doc.progress_number !== 3)) return false;
    }
    
    // Check role filter
    if (activeFilters.role && activeFilters.role !== 'all') {
      if (!doc.added_by_user?.role || doc.added_by_user.role.toLowerCase() !== activeFilters.role.toLowerCase()) {
        return false;
      }
    }
    
    // Check date filters
    if (activeFilters.startDate && new Date(doc.created_at) < activeFilters.startDate) return false;
    if (activeFilters.endDate) {
      const endDate = new Date(activeFilters.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      if (new Date(doc.created_at) > endDate) return false;
    }
    
    return true;
  });
  
  // Handle document click
  const handleDocumentClick = (documentId: string) => {
    navigate(`/client/documents/${documentId}`);
  };

  // Render document progress squares
  const renderProgressSquares = (progress: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className={`w-5 h-5 flex items-center justify-center ${
              step <= progress ? 'bg-orange-500 text-white' : 'bg-gray-200'
            }`}
          >
            {step <= progress ? '✓' : ''}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">Document Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by Name, Tag, Status, Date etc..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => setFilterModalOpen(true)}
        >
          <span>Filter</span>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <h3 className="mt-4 text-lg font-medium">No documents found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredDocuments.map((doc: any) => (
            <Card 
              key={doc.id}
              className="overflow-hidden hover:border-orange-300 hover:shadow-sm transition-all cursor-pointer"
              onClick={() => handleDocumentClick(doc.id)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {doc.url ? (
                      <iframe 
                        src={doc.url} 
                        title="Document Preview" 
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <div className="text-gray-400">No preview available</div>
                    )}
                  </div>
                  
                  {doc.shared && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Shared
                      </span>
                    </div>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-white/80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDocumentClick(doc.id);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Document Title</span>
                    <span className="text-sm">{doc.title || ''}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Document Tag</span>
                    <span className="text-sm">{doc.tag_name || 'Residential Plot File'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">Document Progress</span>
                    {renderProgressSquares(doc.progress_number || 1)}
                  </div>
                  
                  <div className="text-xs text-gray-500 pt-1">
                    Uploaded {doc.created_at.split('T')[0]}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <DocumentFilterModal 
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={applyFilters}
        initialFilters={activeFilters}
      />
    </div>
  );
};

export default SearchDocuments;
