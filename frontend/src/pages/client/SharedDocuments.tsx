
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileText, Users, Calendar, Eye, Download, Copy, Check, Link } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchDocuments } from '@/services/api';
import { toast } from 'sonner';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const SharedDocuments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  
  // Fetch documents
  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
    meta: {
      onError: (error: Error) => {
        toast.error(`Failed to load documents: ${error.message || 'Unknown error'}`);
      }
    }
  });
  
  console.log("Shared documents data:", documentsData);
  
  // Safe handling of documents array
  const rawDocuments = documentsData?.data || [];
  const documents = Array.isArray(rawDocuments) ? rawDocuments : [];
  
  console.log("Processed shared documents:", documents);
  
  // Filter documents based on search term and published status
  const filteredDocuments = documents.filter((doc: any) => 
    (searchTerm ? 
      doc.tag_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.id?.toString().includes(searchTerm) ||
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    : true) && doc.is_published
  );
  
  // Group documents by date
  const groupedDocuments = filteredDocuments.reduce((groups: any, document: any) => {
    const date = new Date(document.created_at || new Date()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(document);
    return groups;
  }, {});
  
  // Mock data for shared history - updated to use actual documents if possible
  const sharedHistory = documents
    .filter(doc => doc.is_published)
    .slice(0, 5)
    .map((doc, index) => ({
      id: String(index + 1),
      documentId: doc.id,
      documentName: doc.title || doc.tag_name,
      date: new Date(doc.created_at).toLocaleDateString(),
      links: Math.floor(Math.random() * 5) + 1 // Just for demo purposes
    }));
  
  // View document details
  const handleViewDocument = (documentId: string) => {
    navigate(`/client/documents/${documentId}`);
  };

  // Download document
  const handleDownloadDocument = (documentUrl: string, documentName: string) => {
    if (!documentUrl) {
      toast.error("No document URL found");
      return;
    }
    
    const link = document.createElement('a');
    link.href = documentUrl;
    link.target = '_blank';
    link.download = documentName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Document download started");
  };

  // Copy document link
  const handleCopyLink = (documentId: string) => {
    const shareableLink = `${window.location.origin}/pdf-view/${documentId}`;
    
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        setCopiedId(documentId);
        toast.success("Link copied to clipboard");
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      })
      .catch(err => {
        toast.error("Failed to copy link");
        console.error("Failed to copy link: ", err);
      });
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
          <h1 className="text-2xl font-semibold">Shared Documents</h1>
          <p className="text-sm text-muted-foreground">Manage documents you have shared with others</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by ID or tag..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Shared document history */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
          <h3 className="font-medium">Recently Shared Documents</h3>
          <Button variant="link" size="sm" className="text-orange-500">
            View All
          </Button>
        </div>
        
        {sharedHistory.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="mt-2 text-sm font-medium">No shared documents</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't shared any documents yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Share Date</TableHead>
                  <TableHead>Links Generated</TableHead>
                  <TableHead>Document Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sharedHistory.map((item) => (
                  <TableRow key={item.id} className="bg-white">
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="font-medium">{item.documentName || "Untitled"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{item.date}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge variant="outline">{item.links}</Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      {item.documentId && documents.find(d => d.id === item.documentId) ? 
                        renderProgressIndicators(documents.find(d => d.id === item.documentId)) : 
                        <div className="flex gap-1">
                          {[1, 2, 3].map((_, i) => (
                            <div key={i} className="w-5 h-5 rounded-sm bg-gray-200"></div>
                          ))}
                        </div>
                      }
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => handleViewDocument(item.documentId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                          onClick={() => handleCopyLink(item.documentId)}
                        >
                          {copiedId === item.documentId ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Link className="h-4 w-4 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* All documents that can be shared */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-medium mb-4">Available Documents</h2>
        
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
              {searchTerm ? 'Try adjusting your search terms.' : 'Upload a document to start sharing.'}
            </p>
            <div className="mt-6">
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => navigate('/client/documents/upload')}
              >
                Upload Document
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredDocuments.map((doc: any) => (
              <div 
                key={doc.id} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-all"
              >
                <div className="relative">
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img 
                      src={doc.url || '/placeholder.svg'} 
                      alt={doc.title || doc.tag_name || 'Document Preview'} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">ID: {doc.id?.substring(0, 8)}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 truncate">{doc.title || doc.tag_name || "Untitled"}</h4>
                  <div className="mt-3">{renderProgressIndicators(doc)}</div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Uploaded {new Date(doc.created_at).toLocaleString()}
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-green-600 hover:text-green-800 hover:bg-green-50"
                        onClick={() => handleDownloadDocument(doc.url, doc.tag_name)}
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                        onClick={() => handleCopyLink(doc.id)}
                      >
                        {copiedId === doc.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Link className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedDocuments;
