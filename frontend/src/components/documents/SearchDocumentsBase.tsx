
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Filter as FilterIcon, Search as SearchIcon, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchDocuments } from '@/services/api';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { DocumentFilterModal, DocumentFilters } from '@/components/filters/DocumentFilterModal';

interface SearchDocumentsBaseProps {
  userRole: 'owner' | 'manager' | 'qa' | 'scanner' | 'indexer';
}

const SearchDocumentsBase = ({ userRole }: SearchDocumentsBaseProps) => {
  const navigate = useNavigate();
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>({});

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchDocuments();

        if (error) {
          toast.error(`Error loading documents: ${error}`);
          return;
        }

        if (data) {
          setDocuments(data);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const getDocumentStatus = (doc: any) => {
    if (doc.progress_number === 3 && doc.is_published) {
      return { status: 'Complete', variant: 'success' };
    } else if (doc.progress_number === 3 && !doc.is_published) {
      return { status: 'Unpublished', variant: 'warning' };
    } else {
      return { status: 'Incomplete', variant: 'destructive' };
    }
  };

  // Apply filters function
  const applyFilters = (filters: DocumentFilters) => {
    setActiveFilters(filters);
  };

  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(doc => {
    // Search term filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      // (doc.title?.toLowerCase().includes(searchLower)) ||
      (doc.tag_name?.toLowerCase().includes(searchLower)) ||
      (doc.added_by_user && typeof doc.added_by_user === 'string' && doc.added_by_user.toLowerCase().includes(searchLower));
    
    if (!matchesSearch) return false;
    
    // Status filter
    if (activeFilters.status && activeFilters.status !== 'all') {
      const { status } = getDocumentStatus(doc);
      if (activeFilters.status === 'complete' && status !== 'Complete') return false;
      if (activeFilters.status === 'incomplete' && status !== 'Incomplete') return false;
      if (activeFilters.status === 'unpublished' && status !== 'Unpublished') return false;
    }
    
    // Role filter
    if (activeFilters.role && activeFilters.role !== 'all') {
      const role = doc.role || 
        (doc.added_by_user && typeof doc.added_by_user === 'object' ? 
          doc.added_by_user.role : null);
      
      if (!role || role.toLowerCase() !== activeFilters.role.toLowerCase()) {
        return false;
      }
    }
    
    // Date filters
    if (activeFilters.startDate) {
      const docDate = doc.created_at ? new Date(doc.created_at) : new Date(doc.date || Date.now());
      if (docDate < activeFilters.startDate) return false;
    }
    
    if (activeFilters.endDate) {
      const endDate = new Date(activeFilters.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      const docDate = doc.created_at ? new Date(doc.created_at) : new Date(doc.date || Date.now());
      if (docDate > endDate) return false;
    }
    
    return true;
  });

  const handleViewDocument = (docId: string) => {
    navigate(`/${userRole}/documents/${docId}`);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Search</h1>
          <p className="text-sm text-muted-foreground">Search Documents</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      {/* Document Cards Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <Skeleton className="w-full h-40" />
                  <div className="absolute top-2 right-2">
                    <Skeleton className="w-24 h-6 rounded-full" />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <Skeleton className="w-full h-5" />
                  <Skeleton className="w-2/3 h-5" />
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="w-5 h-5 rounded-sm" />
                    ))}
                  </div>
                  <Skeleton className="w-1/2 h-4 mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredDocuments.slice(0, 3).map((doc, index) => {
            const { status, variant } = getDocumentStatus(doc);
            return (
              <Card key={index} className="overflow-hidden cursor-pointer hover:shadow-md transition-all" 
                onClick={() => handleViewDocument(doc.id || '12345')}>
                <CardContent className="p-0">
                  <div className="relative">
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img 
                        src={doc.url || '/placeholder.svg'} 
                        alt={doc.tag_name || 'Document Preview'} 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge 
                        variant={variant as any}
                        className={
                          status === 'Complete' ? 'bg-green-100 text-green-800' : 
                          status === 'Unpublished' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }
                      >
                        {status}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      className="absolute bottom-2 right-2 h-7 w-7 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Additional options could be implemented here
                      }}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Document Name</span>
                        <span className="text-sm">{doc.title || '12345'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Document Tag</span>
                        <span className="text-sm">{doc.tag_name || 'Residential Plot File'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Document Progress</span>
                        <div className="flex gap-1">
                          {[1, 2, 3].map((step, i) => (
                            <div 
                              key={i} 
                              className={`w-5 h-5 rounded-sm flex items-center justify-center ${
                                i < (doc.progress_number || 0) ? 'bg-orange-500 text-white' : 'bg-gray-200'
                              }`}
                            >
                              {i < (doc.progress_number || 0) ? '✓' : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-4 h-4 text-gray-500" />
          </div>
          <Input 
            type="search" 
            className="pl-10" 
            placeholder="Search by ID, Tag, Status, Date etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setFilterModalOpen(true)}
        >
          <FilterIcon className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Recently Edited Documents */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="font-medium">Recently Edited Documents</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Initiated By</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Edit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Document Name</TableHead>
              <TableHead>Document Tag</TableHead>
              <TableHead>Document Progress</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array(5).fill(null).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No documents match your search criteria' : 'No documents found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc, index) => {
                const { status, variant } = getDocumentStatus(doc);
                const addedByName = doc.added_by_user 
                  ? (typeof doc.added_by_user === 'object' 
                    ? doc.added_by_user?.name 
                    : doc.added_by_user) 
                  : "N/A";

                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center">
                        {addedByName || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>{doc.role || 'QA'}</TableCell>
                    <TableCell>{doc.date || doc.created_at?.split("T")[0] || '11/12/2024'}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={variant as any}
                        className={
                          status === 'Complete' ? 'bg-green-100 text-green-800' : 
                          status === 'Unpublished' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.title || '12345'}</TableCell>
                    <TableCell>{doc.tag_name || 'Residential Plot File'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {[1, 2, 3].map((step, i) => (
                          <div 
                            key={i} 
                            className={`w-5 h-5 rounded-sm flex items-center justify-center ${
                              i < (doc.progress_number || 0) ? 'bg-orange-500 text-white' : 'bg-gray-200'
                            }`}
                          >
                            {i < (doc.progress_number || 0) ? '✓' : ''}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {status === 'Incomplete' ? (
                        <Button 
                          size="sm" 
                          className="text-xs h-8 bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => handleViewDocument(doc.id || '12345')}
                        >
                          Continue Editing
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-xs h-8 text-orange-500 border-orange-200"
                          onClick={() => handleViewDocument(doc.id || '12345')}
                        >
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DocumentFilterModal 
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={applyFilters}
        initialFilters={activeFilters}
      />
    </div>
  );
};

export default SearchDocumentsBase;
