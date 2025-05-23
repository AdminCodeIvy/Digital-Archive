
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Filter as FilterIcon, Search as SearchIcon } from 'lucide-react';
import { fetchDocuments } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { DocumentFilterModal, DocumentFilters } from '@/components/filters/DocumentFilterModal';

const FilteredDocumentsPage = () => {
  const navigate = useNavigate();
  const { filterType } = useParams();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
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
          // Filter documents based on the filterType parameter
          let filteredDocs = data;
          
          if (filterType === 'complete') {
            filteredDocs = data.filter(doc => doc.progress_number === 3 && doc.is_published);
          } else if (filterType === 'incomplete') {
            filteredDocs = data.filter(doc => !(doc.progress_number === 3 && doc.is_published));
          }
          
          setDocuments(filteredDocs);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [filterType]);

  const getDocumentStatus = (doc: any) => {
    if (doc.progress_number === 3 && doc.is_published) {
      return { status: 'Complete', variant: 'success' };
    } else if (doc.progress_number === 3 && !doc.is_published) {
      return { status: 'Unpublished', variant: 'warning' };
    } else {
      return { status: 'Incomplete', variant: 'destructive' };
    }
  };

  // Apply filters to documents
  const applyFilters = (filters: DocumentFilters) => {
    setActiveFilters(filters);
  };

  const filteredDocuments = documents.filter(doc => {
    // Apply search query filtering
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      
      if (!(
        (doc.title && doc.title.toLowerCase().includes(searchLower)) ||
        (doc.tag_name && doc.tag_name.toLowerCase().includes(searchLower)) ||
        (doc.properties && doc.properties.some((prop: any) =>
          (prop.name && prop.name.toString().toLowerCase().includes(searchLower))
         ||
          (prop.value && prop.value.toString().toLowerCase().includes(searchLower))
        ))
      )) {
        return false;
      }
    }
    
    // Check status filter
    if (activeFilters.status && activeFilters.status !== 'all') {
      const { status } = getDocumentStatus(doc);
      if (activeFilters.status === 'complete' && status !== 'Complete') return false;
      if (activeFilters.status === 'incomplete' && status !== 'Incomplete') return false;
      if (activeFilters.status === 'unpublished' && status !== 'Unpublished') return false;
    }
    
    // Check role filter
    if (activeFilters.role && activeFilters.role !== 'all') {
      const docRole = doc.added_by_user?.role || doc.role;
      if (!docRole || docRole.toLowerCase() !== activeFilters.role.toLowerCase()) {
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

  const title = filterType === 'complete' ? 'Complete Documents' : 'Incomplete Documents';

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/${role}/documents`)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">{title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">Document Management</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-4 h-4 text-gray-500" />
          </div>
          <Input 
            type="search" 
            className="pl-10" 
            placeholder="Search by ID, Tag, Status, Date etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Loading documents...</span>
        </div>
      ) : (
        <Card className="bg-white rounded-lg border">
          <div className="p-4 flex items-center justify-between border-b">
            <h3 className="font-medium">{title}</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requested By</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document Name</TableHead>
                <TableHead>Document Tag</TableHead>
                <TableHead>Document Progress</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No documents match your search criteria' : 'No documents found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc, index) => {
                  const { status, variant } = getDocumentStatus(doc);
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 overflow-hidden flex items-center justify-center">
                            <div className="text-xs text-gray-600">DJ</div>
                          </div>
                          {doc.requested_by?.name}
                        </div>
                      </TableCell>
                      <TableCell>{doc.requested_by?.role}</TableCell>
                      <TableCell>{doc.created_at.split("T")[0]}</TableCell>
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
                      <TableCell>{doc.title}</TableCell>
                      <TableCell>{doc.tag_name || ''}</TableCell>
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
                            onClick={() => navigate(`/${role}/documents/${doc.id || '12345'}`)}
                          >
                            {role === 'qa' ? 'Review' : 'Continue Editing'}
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs h-8 text-orange-500 border-orange-200"
                            onClick={() => navigate(`/${role}/documents/${doc.id || '12345'}`)}
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
        </Card>
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

export default FilteredDocumentsPage;
