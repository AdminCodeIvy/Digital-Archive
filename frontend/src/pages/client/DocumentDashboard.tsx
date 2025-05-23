import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, FileText, Filter, Search, Upload, ChevronRight, Calendar, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { StatsCard } from '@/components/ui/stats-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { DocumentFilterModal, DocumentFilters } from '@/components/filters/DocumentFilterModal';

const DocumentDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<DocumentFilters>({});
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  
  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to load documents: ${error.message || 'Unknown error'}`);
      }
    }
  });
  
  console.log("Documents data in Dashboard:", documentsData);
  
  const rawDocuments = documentsData?.data || [];
  const documents = Array.isArray(rawDocuments) ? rawDocuments : [];
  
  console.log("Processed documents in Dashboard:", documents);
  
  if (error) {
    toast.error('Failed to load documents');
  }
  
  // Apply filters to documents
  const applyFilters = (filters: DocumentFilters) => {
    setActiveFilters(filters);
  };
  
  const filteredDocuments = documents.filter((doc: any) => {
    // Apply search term filtering
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (!(doc.tag_name?.toLowerCase().includes(searchLower) ||
           doc.title?.toLowerCase().includes(searchLower))) {
        return false;
      }
    }
    
    // Check status filter
    if (activeFilters.status && activeFilters.status !== 'all') {
      const { status } = getProgressStatus(doc);
      if (activeFilters.status === 'complete' && status !== 'Complete') return false;
      if (activeFilters.status === 'incomplete' && status !== 'In Progress' && status !== 'Pending') return false;
      if (activeFilters.status === 'unpublished' && status !== 'Pending') return false;
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
  
  const sharedDocuments = filteredDocuments.filter((doc: any) => doc.is_published);
  const uploadedDocuments = filteredDocuments;
  
  const handleDocumentClick = (documentId: string) => {
    navigate(`/client/documents/${documentId}`);
  };
  
  const getProgressStatus = (document: any) => {
    if (document.indexer_passed_id && document.qa_passed_id) {
      return { status: 'Complete', variant: 'success' as const };
    } else if (document.passed_to) {
      return { status: 'In Progress', variant: 'warning' as const };
    } else {
      return { status: 'Pending', variant: 'destructive' as const };
    }
  };

  const renderProgressIndicators = (doc: any) => {
    const progress = doc.progress_number || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((step, i) => (
          <div 
            key={i} 
            className={`w-5 h-5 rounded-sm flex items-center justify-center ${
              i < progress ? 'bg-orange-500 text-white' : 'bg-gray-200'
            }`}
          >
            {i < progress ? '✓' : ''}
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <StatsCard
          title="Uploaded Docs"
          value={uploadedDocuments.length}
          icon={<Upload className="h-5 w-5" />}
          color="bg-green-50 text-green-500"
        />
        
        <StatsCard
          title="Disputes"
          value="0"
          icon={<FileText className="h-5 w-5" />}
          color="bg-red-50 text-red-500"
        />
        
        <Card 
          className="bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition-all"
          onClick={() => navigate('/client/documents/upload')}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Upload Doc</h3>
            </div>
            <div className="flex items-center space-x-2">
              <Upload className="h-6 w-6" />
              <ChevronRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by ID, tag, title..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setFilterModalOpen(true)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center p-8 border rounded-lg">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100">
              <FileText className="h-10 w-10 text-orange-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No documents found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by uploading your first document.'}
            </p>
            <div className="mt-6">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => navigate('/client/documents/upload')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doc Title</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead>Document Tag</TableHead>
                <TableHead>Share Status</TableHead>
                <TableHead>Document Progress</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc: any) => {
                const { status } = getProgressStatus(doc);
                const isShared = doc.shared;
                return (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title || "Title Here"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>{doc.tag_name || "Untitled"}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={isShared ? "success" : "destructive"}
                        className={
                          isShared ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }
                      >
                        {isShared ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {renderProgressIndicators(doc)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => handleDocumentClick(doc.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
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

export default DocumentDashboard;
