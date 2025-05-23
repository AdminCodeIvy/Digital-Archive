import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Share, Link, Copy, History, AlertCircle, CloudFog, Send, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchCurrentUsers, fetchDocument, fetchUsers, updateDocumentProperties } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import DocumentHistory from "@/components/documents/DocumentHistory";
import { logDocumentOpened, logDocumentDownloaded, logFieldChanges, logDocumentShared, logDocumentSubmitted } from "@/utils/documentHistory";
import AssigneeModal from "@/components/documents/AssigneeModal";
import ReportDisputeModal from "@/components/disputes/ReportDisputeModal";
import { Comments } from "@/components/documents/Comments";
import { Textarea } from "@/components/ui/textarea";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";

import { createPartFromUri, GoogleGenAI } from "@google/genai";
import { useQuery } from "@tanstack/react-query";
import { addDocumentHistory } from "@/services/documentHistoryApi";

const API_KEY = "AIzaSyD8im5jeZnWZ_Rvf1qsHnWzxjUHzkvjuA4";

const ai = new GoogleGenAI({ apiKey: API_KEY });

export default function DocumentView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [document1, setDocumentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [originalProperties, setOriginalProperties] = useState<any[]>([]);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharePassword, setSharePassword] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [sharedUrl, setSharedUrl] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [isDocumentShared, setIsDocumentShared] = useState(false);
  const [isCheckingShare, setIsCheckingShare] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [reportDisputeModalOpen, setReportDisputeModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [published, setPublished] = useState(false);
  
  // Document chat states
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDocumentData = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchDocument(id);

        if (error) {
          toast.error(`Error: ${error}`);
          return;
        }

        if (data) {
          console.log("Document data:", data);

          const docData = Array.isArray(data) ? data[0] : data;

          setDocumentData(docData);
          setShowMore(docData.showMore || false);
          setPublished(docData.is_published || false);

          const docProperties = docData.properties || [];
          setProperties(docProperties);
          setOriginalProperties(JSON.parse(JSON.stringify(docProperties)));

          await logDocumentOpened(id);

          checkIfDocumentIsShared(id);

          const shouldExtractData = docData.file_id &&
            (docProperties.length === 0 ||
              docProperties.every((p: any) => !p.value || p.value === null || p.value === ""));

          if (shouldExtractData) {
            console.log("Properties are empty, extracting data from OpenAI...");
            const propertyNames = docProperties.map((p: any) => p.name);
            await queryOpenAI(docData.url, docProperties, propertyNames);
          }
        } else {
          toast.error(`Document with ID ${id} not found.`);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, [id, user]);

  const handlePublish = async () => {
    if (!id) return;

    try {
      setIsPublishing(true);
      toast.info("Publishing document...");

      await handleSave(properties);

      const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';

      const response = await fetch(`https://digital-archive-beta.vercel.app/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          document_id: id,
          properties: properties
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish document');
      }

      await addDocumentHistory(id, "Published the document");

      toast.success("Document has been published successfully");
      setTimeout(() => {
        navigate("/scanner/documents");
      }, 1000);

    } catch (error) {
      console.error("Error publishing document:", error);
      toast.error("Failed to publish document");
    } finally {
      setIsPublishing(false);
    }
  };

  const checkIfDocumentIsShared = async (documentId: string) => {
    try {
      setIsCheckingShare(true);
      const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';
      const response = await fetch(`https://digital-archive-beta.vercel.app/get-shared-url/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.document_link) {
        setIsDocumentShared(true);
        setSharedUrl(data.document_link);
      } else {
        setIsDocumentShared(false);
        setSharedUrl("");
      }
    } catch (error) {
      console.error("Error checking if document is shared:", error);
      setIsDocumentShared(false);
    } finally {
      setIsCheckingShare(false);
    }
  };

  const queryOpenAI = async (fileId: string, properties: any[], recordFields: string[]) => {
    setIsFetchingAI(true);
    try {
      toast.info("Extracting document data...");

      const pdfBuffer = await fetch(fileId)
        .then((response) => response.arrayBuffer());

      const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

      const file = await ai.files.upload({
        file: fileBlob,
      });

      let getFile = await ai.files.get({ name: file.name });
      while (getFile.state === 'PROCESSING') {
        getFile = await ai.files.get({ name: file.name });
        console.log(`current file status: ${getFile.state}`);
        console.log('File is still processing, retrying in 5 seconds');

        await new Promise((resolve) => {
          setTimeout(resolve, 5000);
        });
      }

      if (file.state === 'FAILED') {
        toast.info("File processing failed");
      }

      const content: any[] = [
        `Extract the relevant document properties in a structured JSON format as key-value pairs. Ensure values are strings, paragraphs or numbers only. Use the exact property names as they are show in this list:[${recordFields}]`,
      ];

      if (file.uri && file.mimeType) {
        const fileContent = createPartFromUri(file.uri, file.mimeType);
        content.push(fileContent);
      }

      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: content,
      });

      let rawContent = response.text || "";
      console.log("Raw Content:", rawContent);

      const jsonMatch = rawContent.match(/```json([\s\S]*?)```/);
      const jsonString = jsonMatch ? jsonMatch[1].trim() : rawContent;

      let generatedProperties;
      try {
        generatedProperties = JSON.parse(jsonString);
      } catch (err) {
        throw new Error("Failed to parse JSON response from OpenAI");
      }

      const tempProperties = properties.map((prop) => ({
        ...prop,
        value: generatedProperties[prop.name.trim()] || prop.value || ""
      }));

      setProperties(tempProperties);
      handleSave(tempProperties);
      toast.success("Document data extracted successfully");

    } catch (error) {
      console.error("Error querying OpenAI:", error);
      toast.error(`Failed to extract document data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFetchingAI(false);
    }
  };

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: fetchCurrentUsers
  });

  const handlePropertyChange = (index: number, newValue: string) => {
    setProperties(prevProps => prevProps.map((prop, i) => (i === index ? { ...prop, value: newValue } : prop)));
  };

  const getChangedFields = () => {
    const changedFields: Array<{name: string; oldValue: string; newValue: string}> = [];

    properties.forEach((prop, index) => {
      if (prop.value !== originalProperties[index]?.value) {
        changedFields.push({
          name: prop.name,
          oldValue: originalProperties[index]?.value || '',
          newValue: prop.value || ''
        });
      }
    });

    return changedFields;
  };

  const handleSave = async (propsToSave = properties) => {
    if (!id) return;

    try {
      setIsSaving(true);
      toast.info("Saving document properties...");
      const { error } = await updateDocumentProperties(id, propsToSave);

      if (error) {
        toast.error(`Error updating document: ${error}`);
        return;
      }

      const changedFields = getChangedFields();
      if (changedFields.length > 0) {
        await logFieldChanges(id, changedFields);

        setOriginalProperties(JSON.parse(JSON.stringify(propsToSave)));
      }

      toast.success("Document properties updated successfully");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Failed to update document properties");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssigneeSuccess = (assigneeId: string) => {
    if (id) {
      logDocumentSubmitted(id, "Review");

      fetchDocument(id).then(({ data }) => {
        if (data) {
          const docData = Array.isArray(data) ? data[0] : data;
          setDocumentData(docData);

          toast.success("Document has been assigned for review");

          setShowMore(false);
        }
      });
    }
  };

  const handleDownloadDocument = async () => {
    if (!id) return;

    try {
      setIsDownloading(true);
      toast.info("Preparing document for download...");

      const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';

      const response = await fetch(`https://digital-archive-beta.vercel.app/download-document/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download document');
      }

      const data = await response.json();

      if (data.document_url) {
        if (id) {
          await logDocumentDownloaded(id);
        }

        window.open(data.document_url, '_blank');
        toast.success("Document download initiated");
      } else {
        throw new Error('No document URL found in response');
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error(`Failed to download document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareDocument = async () => {
    if (!id || sharePassword.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    try {
      setIsSharing(true);

      const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';

      const response = await fetch("https://digital-archive-beta.vercel.app/share-document", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_link: document1.url,
          document_password: sharePassword,
          document_id: id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share document');
      }

      const data = await response.json();

      await logDocumentShared(id);

      toast.success("Document shared successfully");
      setShareDialogOpen(false);
      setIsDocumentShared(true);

      if (data.shared && data.shared.length > 0) {
        setSharedUrl(data.shared[0].document_link);
      }

      checkIfDocumentIsShared(id);

    } catch (error) {
      console.error("Error sharing document:", error);
      toast.error(`Failed to share document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyShareUrl = () => {
    if (!sharedUrl) {
      toast.error("No shared URL available");
      return;
    }

    navigator.clipboard.writeText(sharedUrl)
      .then(() => toast.success("Share link copied to clipboard"))
      .catch(err => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy to clipboard");
      });
  };

  const handleRescan = async () => {
    if (!document1?.url || !properties.length) return;

    try {
      setIsFetchingAI(true);
      toast.info("Re-scanning document...");

      const propertyNames = properties.map(p => p.name);
      await queryOpenAI(document1.url, properties, propertyNames);

      toast.success("Document re-scan completed successfully");
    } catch (error) {
      console.error("Error re-scanning document:", error);
      toast.error("Failed to re-scan document");
    } finally {
      setIsFetchingAI(false);
    }
  };

  const handleChatWithDocument = async () => {
    if (!chatInput.trim() || !document1?.url) return;
    
    try {
      setIsChatLoading(true);
      
      // Add user message to chat
      const newUserMessage = { role: "user", content: chatInput };
      setChatMessages(prev => [...prev, newUserMessage]);
      setChatInput("");
      
      const pdfBuffer = await fetch(document1.url)
        .then((response) => response.arrayBuffer());

      const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
      
      const file = await ai.files.upload({
        file: fileBlob,
      });
      
      let getFile = await ai.files.get({ name: file.name });
      while (getFile.state === 'PROCESSING') {
        getFile = await ai.files.get({ name: file.name });
        console.log(`current file status: ${getFile.state}`);
        
        await new Promise((resolve) => {
          setTimeout(resolve, 2000);
        });
      }
      
      if (getFile.state === 'FAILED') {
        toast.error("File processing failed");
        return;
      }
      
      const content: any[] = [
        `Answer the following question based on the content of the provided document: ${chatInput}`,
      ];
      
      if (file.uri && file.mimeType) {
        const fileContent = createPartFromUri(file.uri, file.mimeType);
        content.push(fileContent);
      }
      
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: content,
      });
      
      const aiResponse = { role: "assistant", content: response.text || "Sorry, I couldn't process that." };
      setChatMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error("Error chatting with document:", error);
      toast.error("Failed to process your request");
      setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, there was an error processing your request." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Add the Chat UI component with permission check
  const DocumentChatSection = () => {
    const { canViewChat, showPermissionError } = usePlanPermissions();
    
    const handleChat = () => {
      if (!canViewChat) {
        showPermissionError('chat with document');
        return;
      }
      
      handleChatWithDocument();
    };
    
    if (!canViewChat) {
      return (
        <div className="w-full border rounded-lg p-6 bg-gray-50">
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Chat with Document</h3>
            <p className="text-gray-500 mb-4">Your current plan doesn't include access to chat with documents.</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full border rounded-lg p-4 mt-6">
        <h3 className="font-medium text-lg mb-4 flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Chat with Document
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4 h-[300px] overflow-y-auto">
          {chatMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Ask questions about this document</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.role === "user" 
                      ? "bg-primary text-white self-end" 
                      : "bg-gray-200 self-start"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Textarea 
            placeholder="Ask a question about this document..." 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChat();
              }
            }}
            className="resize-none"
          />
          <Button 
            onClick={handleChat}
            disabled={isChatLoading || !chatInput.trim()}
            className="shrink-0"
          >
            {isChatLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        {/*         <h2 className="text-xl font-medium">{document1?.title || ""}</h2>
 */}
        <div className="flex-1"></div>

        {
          (usersData?.data?.length && usersData?.data[0]?.create_dispute) && <Button
            variant="outline"
            className="gap-2"
            onClick={() => setReportDisputeModalOpen(true)}
          >
            <AlertCircle className="h-4 w-4" />
            Report Issue
          </Button>
        }


        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setHistoryModalOpen(true)}
        >
          <History className="h-4 w-4" />
          Document History
        </Button>

        {isDocumentShared ? (
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleCopyShareUrl}
          >
            <Copy className="h-4 w-4" />
            Copy Share Link
          </Button>
        ) : (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShareDialogOpen(true)}
            disabled={isCheckingShare}
          >
            <Share className="h-4 w-4" />
            {isCheckingShare ? "Checking..." : "Share"}
          </Button>
        )}

        <Button
          variant="outline"
          className="gap-2"
          onClick={handleDownloadDocument}
          disabled={loading || !document1?.url || isDownloading}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download"}
        </Button>

        {
          (usersData?.data?.length && usersData?.data[0]?.allow_to_publish && !published) && <Button
            className="gap-2 bg-green-500 hover:bg-green-600 text-white"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            <Send className="h-4 w-4" />
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>
        }

      </div>

      {!loading && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border rounded-lg overflow-hidden h-[700px]">
              <iframe src={document1?.url} className="w-full h-full border-0" title="PDF Document"></iframe>
            </div>
            <div className="flex flex-col">
              <Tabs defaultValue="document">
                <TabsList className="mb-4">
                  <TabsTrigger value="document">Document</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                </TabsList>
                <TabsContent value="document" className="animate-fade-in">
                  <div className="border rounded-lg p-4">
                    <div className="mb-6">
                      <label className="text-sm font-medium mb-1 block">Document Tag</label>
                      <Select disabled value={document1?.tag_name || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tag" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={document1?.tag_name || ""}>{document1?.tag_name}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {properties.map((property, index) => (
                        <div key={index} className="space-y-1">
                          <label className="text-sm font-medium mb-1 block">{property.name}</label>
                          <Input
                            value={property.value || ""}
                            onChange={(e) => handlePropertyChange(index, e.target.value)}
                            placeholder={`Enter ${property.name}`}
                            type="text"
                          />
                        </div>
                      ))}
                    </div>

                    {
                      isFetchingAI || isSaving ? (
                        <div className="flex justify-center items-center mt-8">
                          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                          <span>{isFetchingAI ? "Extracting document data..." : "Saving changes..."}</span>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-4 mt-8">
                          <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleRescan}
                            disabled={isFetchingAI || isSaving}
                            className="gap-2"
                          >
                            {/* <Scan className="h-4 w-4" /> */}
                            Re-scan
                          </Button>
                          <Button
                            onClick={() => handleSave()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSaving}
                          >
                            Save Changes
                          </Button>
                          {
                            showMore && (
                              <Button
                                variant="default"
                                onClick={() => setAssigneeModalOpen(true)}
                                disabled={isSaving || isFetchingAI}
                              >
                                Submit for Indexing
                              </Button>
                            )
                          }
                        </div>
                      )
                    }
                  </div>
                </TabsContent>
                <TabsContent value="comments" className="animate-fade-in">
                  <div className="border rounded-lg p-4">
                    <Comments
                      documentId={id || ''}
                      comments={document1?.comments || []}
                      onCommentAdded={() => {
                        if (id) {
                          fetchDocument(id).then(({ data }) => {
                            if (data) {
                              const docData = Array.isArray(data) ? data[0] : data;
                              setDocumentData(docData);
                            }
                          });
                        }
                      }}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Document Chat Section - Below the PDF */}
          <DocumentChatSection />
        </div>
      )}

      {id && (
        <>
          <AssigneeModal
            documentId={id}
            isOpen={assigneeModalOpen}
            onClose={() => setAssigneeModalOpen(false)}
            onSuccess={handleAssigneeSuccess}
          />

          <DocumentHistory
            documentId={id}
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
          />

          <ReportDisputeModal
            documentId={id}
            isOpen={reportDisputeModalOpen}
            onClose={() => setReportDisputeModalOpen(false)}
          />

          <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Share Document</DialogTitle>
                <DialogDescription>
                  Create a shareable link for this document
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Set Password (required)</label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    This password will be required to access the document1.
                  </p>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleShareDocument}
                  disabled={!sharePassword || sharePassword.length < 4 || isSharing}
                >
                  <Link className="h-4 w-4 mr-2" />
                  {isSharing ? "Generating Link..." : "Generate Link"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
