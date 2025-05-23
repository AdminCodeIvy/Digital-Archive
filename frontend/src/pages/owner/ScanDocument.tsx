import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CloudUpload, FileCheck, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { createDocument } from '@/services/api';
import { logDocumentScanned } from '@/utils/documentHistory';

// Document states for the UI flow
type DocumentState = 'upload' | 'initial' | 'loading' | 'editing';

// Fetch document tags
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

// Process document (PDF or image)
const processDocument = async (file: File) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "products");

  try {
    // For images and PDFs we use the same Cloudinary upload endpoint
    const response = await fetch(`https://api.cloudinary.com/v1_1/djunaxxv0/raw/upload`, {
      method: "POST",
      body: data,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Upload failed:", error);
    return null;
  }
};

const ScanDocument = () => {
  const navigate = useNavigate();
  const [documentState, setDocumentState] = useState<DocumentState>('upload');
  const [documentTitle, setDocumentTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Get current date and time
  const date = new Date();
  const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  const formattedTime = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;

  // Fetch document tags
  const { data: documentTags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['documentTags'],
    queryFn: fetchDocumentTags
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file type is accepted
      const acceptedFileTypes = [
        'application/pdf', 
      ];
      
      if (!acceptedFileTypes.includes(file.type)) {
        setUploadError('File type not supported. Please upload PDF only.');
        toast.error('File type not supported. Please upload PDF files only.');
        return;
      }
      
      setUploadedFile(file);
      setUploadError(null);
      toast.success("Document uploaded successfully!");
    }
  };

  // Clear uploaded file
  const handleClearFile = () => {
    setUploadedFile(null);
  };

  // Handle proceeding to next step
  const handleProceed = async () => {
    setUploadError(null);
    
    if (documentState === 'upload') {
      if (!uploadedFile) {
        toast.error("Please upload a document first");
        return;
      }
      
      if (!selectedTag) {
        toast.error("Please select a document tag");
        return;
      }
      
      // Start loading state
      setDocumentState('loading');
      setProcessingStage("Uploading document");
      
      try {
        console.log("Starting document processing with file:", uploadedFile.name);
        const documentData = await processDocument(uploadedFile);
        
        if (documentData && documentData.secure_url) {
          setProcessingStage("Processing document");
          console.log("Document uploaded to Cloudinary:", documentData.secure_url);
          
          setProcessingStage("Creating document record");
          
          // Get the tag name from the selected tag ID
          const tagName = documentTags.find((tag: any) => tag.id === selectedTag)?.title || "";
          
          // Create document in backend
          const data = {
            url: documentData.secure_url,
            tag_id: selectedTag,
            tag_name: tagName,
            file_id: '232',
            title: documentTitle
          };
          
          const response = await createDocument(data);
          
          setProcessingStage("Finishing up");
          
          if (response.error) {
            throw new Error(`Error creating document: ${response.error}`);
          }
          
          if (response.data && response.data[0] && response.data[0].id) {
            const documentId = response.data[0].id;
            
            // Log the document scanning action
            await logDocumentScanned(documentId);
            
            toast.success("Document processed successfully!");
            // Use a timeout to ensure the toast is visible before redirect
            setTimeout(() => {
              console.log(`Redirecting to /owner/documents/${documentId}`);
              navigate(`/owner/documents/${documentId}`);
            }, 1000);
          } else {
            throw new Error("Failed to process the document");
          }
        } else {
          throw new Error("Failed to upload the document to Cloudinary");
        }
      } catch (error) {
        console.error("Error processing document:", error);
        setUploadError(`Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast.error(`Error processing document: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDocumentState('upload');
      }
    } else if (documentState === 'initial') {
      setDocumentState('editing');
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved progress will be lost.")) {
      navigate('/owner/documents');
    }
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
              onClick={() => navigate('/owner/documents')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Scan Document</h1>
          </div>
          <p className="text-sm text-muted-foreground">Document Management</p>
        </div>
        <div className="text-right">
          <p className="text-sm">{formattedDate} {formattedTime}</p>
        </div>
      </div>

      {documentState === 'upload' && (
        <div className="space-y-6">
          <div className="border rounded-lg p-10">
            <div className="flex flex-col items-center justify-center space-y-4">
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center w-[400px]">
                  <div className="bg-orange-100 rounded-full p-4 mb-4">
                    <CloudUpload className="h-10 w-10 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-medium text-orange-500">Upload pdf here</h3>
                  <p className="text-sm text-gray-500">Files supported: PDF</p>
                  <p className="text-xs text-gray-400 mt-2">Max file size: 15 MB</p>
                  
                  {uploadError && (
                    <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                  )}
                  
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <CloudUpload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
              ) : (
                <div className="w-full max-w-md bg-white shadow-md rounded-lg overflow-hidden">
                  <div className="p-4 flex justify-between items-center bg-green-50 border-b border-green-200">
                    <div className="flex items-center">
                      <FileCheck className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">File Uploaded Successfully</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-gray-500 hover:bg-red-50 hover:text-red-500"
                      onClick={handleClearFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Filename:</span>
                      <span className="text-sm text-gray-600">{uploadedFile.name}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">File size:</span>
                      <span className="text-sm text-gray-600">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">File type:</span>
                      <span className="text-sm text-gray-600">{uploadedFile.type}</span>
                    </div>
                    
                    {uploadedFile.type.startsWith('image/') && (
                      <div className="mt-4 bg-gray-50 rounded-md p-2">
                        <img 
                          src={URL.createObjectURL(uploadedFile)} 
                          alt="Document Preview" 
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>
                    )}
                    
                    {uploadedFile.type === 'application/pdf' && (
                      <div className="mt-4 bg-gray-50 rounded-md p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <svg className="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.5 2H7.25C6.56 2 6 2.56 6 3.25v17.5c0 .69.56 1.25 1.25 1.25h9.5c.69 0 1.25-.56 1.25-1.25V6.75L12.5 2z"/>
                            <path d="M12 7V3l5 5h-4c-.55 0-1-.45-1-1z" fill="white"/>
                            <path d="M9 16.75c0-.41.34-.75.75-.75h4.5c.41 0 .75.34.75.75s-.34.75-.75.75h-4.5c-.41 0-.75-.34-.75-.75zm0-3c0-.41.34-.75.75-.75h4.5c.41 0 .75.34.75.75s-.34.75-.75.75h-4.5c-.41 0-.75-.34-.75-.75zm0-3c0-.41.34-.75.75-.75h2.5c.41 0 .75.34.75.75s-.34.75-.75.75h-2.5c-.41 0-.75-.34-.75-.75z"/>
                          </svg>
                          <span className="text-sm text-gray-600 mt-2">PDF Document</span>
                        </div>
                      </div>
                    )}
                    
                    {/* <Button
                      className="w-full mt-4 bg-orange-100 hover:bg-orange-200 text-orange-700"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Change File
                    </Button> */}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Title (Optional)</label>
              <Input 
                placeholder="Input here" 
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign Document Tag</label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Tag" />
                </SelectTrigger>
                <SelectContent>
                  {tagsLoading ? (
                    <SelectItem value="loading" disabled>Loading tags...</SelectItem>
                  ) : documentTags.length > 0 ? (
                    documentTags.map((tag: any) => (
                      <SelectItem key={tag.id} value={tag.id}>
                        {tag.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>No tags available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleProceed}
            >
              Proceed
            </Button>
          </div>
        </div>
      )}

      {documentState === 'loading' && (
        <div className="border rounded-lg p-20">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
            <h3 className="text-orange-500 font-medium">{processingStage || "Processing Document"}</h3>
            <p className="text-gray-500">Please Wait</p>
          </div>
        </div>
      )}

      {documentState === 'initial' && (
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-4">
                <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full">Incomplete</span>
              </div>
              <h2 className="text-xl font-medium mb-4">{documentTitle}</h2>
              <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
                  <Input 
                    value={documentTitle}
                    className="bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Document Tag</label>
                  <Input 
                    value={documentTags.find((tag: any) => tag.id === selectedTag)?.title || ""}
                    className="bg-gray-100"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleProceed}
            >
              Proceed
            </Button>
          </div>
        </div>
      )}

      {documentState === 'editing' && (
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-1">
                <div className="border-2 rounded-lg overflow-hidden">
                  <img 
                    src={uploadedFile ? URL.createObjectURL(uploadedFile) : "/placeholder.svg"} 
                    alt="Document Preview"
                    className="w-full h-[500px] object-contain bg-gray-100"
                  />
                </div>
              </div>
              <div className="col-span-1 overflow-y-auto max-h-[500px]">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Tag Title</label>
                    <Input 
                      value={documentTags.find((tag: any) => tag.id === selectedTag)?.title || ""}
                      className="bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  {/* Dynamic fields based on selected tag */}
                  {documentTags.find((tag: any) => tag.id === selectedTag)?.properties?.map((property: any, index: number) => (
                    <div key={index}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{property.name}</label>
                      {property.type === 'Date' ? (
                        <Input 
                          type="date"
                          className={index % 2 === 0 ? "bg-white" : "bg-orange-50"}
                        />
                      ) : property.type === 'Number' ? (
                        <Input 
                          type="number"
                          placeholder="Input here"
                          className={index % 2 === 0 ? "bg-white" : "bg-orange-50"}
                        />
                      ) : (
                        <Input 
                          placeholder="Input here"
                          className={index % 2 === 0 ? "bg-white" : "bg-orange-50"}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setDocumentState('initial')}
            >
              Back
            </Button>
            <div className="space-x-4">
              <Button 
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="outline"
                className="text-orange-500 border-orange-200 hover:bg-orange-50"
              >
                Save Draft
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Publish for Indexing
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanDocument;
