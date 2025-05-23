import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Search, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { getDocumentHistory } from "@/services/documentHistoryApi";
import { format } from "date-fns";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";

interface DocumentHistoryEntry {
  id: string;
  document_id: string;
  edited_by_name: string;
  role: string;
  edit_description: string;
  edit_details: string;
  created_at: string;
}

interface DocumentHistoryProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentHistory = ({ documentId, isOpen, onClose }: DocumentHistoryProps) => {
  const [historyEntries, setHistoryEntries] = useState<DocumentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEntries, setExpandedEntries] = useState<string[]>([]);
  const { permissions, isLoading: isCheckingPermissions, showPermissionError } = usePlanPermissions();
  
  useEffect(() => {
    if (isOpen && documentId && permissions.can_view_activity_logs) {
      fetchDocumentHistory();
    } else if (isOpen && !permissions.can_view_activity_logs && !isCheckingPermissions) {
      showPermissionError("activity logs");
      onClose();
    }
  }, [isOpen, documentId, permissions.can_view_activity_logs, isCheckingPermissions]);
  
  const fetchDocumentHistory = async () => {
    if (!documentId) return;
    
    setLoading(true);
    try {
      const { data, error } = await getDocumentHistory(documentId);
      
      if (error) {
        toast.error(`Error: ${error}`);
        return;
      }
      
      if (data) {
        setHistoryEntries(data);
      }
    } catch (error) {
      console.error("Error fetching document history:", error);
      toast.error("Failed to load document history");
    } finally {
      setLoading(false);
    }
  };
  
  const toggleEntryDetails = (entryId: string) => {
    setExpandedEntries(prev => 
      prev.includes(entryId) 
        ? prev.filter(id => id !== entryId)
        : [...prev, entryId]
    );
  };

  const filteredEntries = historyEntries.filter(entry => 
    entry.edit_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.edited_by_name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (e) {
      return dateString;
    }
  };
  
  if (isCheckingPermissions) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-orange-500" />
            Activity Log
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search activities..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredEntries.length > 0 ? (
            <div className="space-y-0.5">
              <div className="grid grid-cols-5 gap-4 bg-gray-100 p-3 rounded-t-md font-medium text-sm">
                <div>Date and Time</div>
                <div>User</div>
                <div>Role</div>
                <div>Activity</div>
                <div>Details</div>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="border-b">
                    <div className="grid grid-cols-5 gap-4 p-3 text-sm hover:bg-gray-50">
                      <div>{formatDate(entry.created_at)}</div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">
                          {entry.edited_by_name.charAt(0)}
                        </div>
                        <span>{entry.edited_by_name}</span>
                      </div>
                      <div>{entry.role}</div>
                      <div>{entry.edit_description}</div>
                      <div>
                        {entry.edit_details && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => toggleEntryDetails(entry.id)}
                          >
                            {expandedEntries.includes(entry.id) ? (
                              <>
                                Hide Details
                                <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Show Details
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    {expandedEntries.includes(entry.id) && entry.edit_details && (
                      <div className="p-4 bg-gray-50 text-sm">
                        <div className="font-medium mb-2">Change Details:</div>
                        <div className="text-gray-600">{entry.edit_details}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <History className="h-12 w-12 mb-2 text-gray-300" />
              <p>No activity records found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentHistory;
