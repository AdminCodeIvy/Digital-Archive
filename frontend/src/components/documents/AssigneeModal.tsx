
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchAssignees, assignDocument } from '@/services/api';
import { toast } from 'sonner';

interface AssigneeModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (assigneeId: string) => void; // Updated to expect an assigneeId parameter
}

interface Assignee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AssigneeModal({ documentId, isOpen, onClose, onSuccess }: AssigneeModalProps) {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [selectedAssigneeName, setSelectedAssigneeName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableAssignees();
    }
  }, [isOpen]);

  const fetchAvailableAssignees = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await fetchAssignees();

      if (error) {
        toast.error(`Error fetching assignees: ${error}`);
        return;
      }

      if (data && Array.isArray(data)) {
        setAssignees(data);
        if (data.length > 0) {
          setSelectedAssigneeId(data[0].id);
        }
      } else {
        toast.error('Failed to fetch assignees');
      }
    } catch (error) {
      console.error('Error fetching assignees:', error);
      toast.error('An error occurred while fetching assignees');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedAssigneeId) {
      toast.error('Please select an assignee');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await assignDocument(documentId, selectedAssigneeId);

      if (error) {
        toast.error(`Error assigning document: ${error}`);
        return;
      }

      if (data) {
        toast.success('Document submitted for review successfully!');
        // Pass the selectedAssigneeId to the onSuccess callback without closing the modal
        // This ensures the parent component can update before any navigation happens
        onSuccess(selectedAssigneeId);
        
        // Only close the modal after onSuccess has been called
        setTimeout(() => {
          onClose();
        }, 100);
      }
    } catch (error) {
      console.error('Error assigning document:', error);
      toast.error('An error occurred while assigning the document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Document</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isFetching ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
              <span>Loading assignees...</span>
            </div>
          ) : assignees.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No assignees available
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Select Assignee
                </label>
                <Select
                  value={selectedAssigneeId}
                  onValueChange={(value) => {
                    setSelectedAssigneeId(value);
                    const selected = assignees.find(a => a.id === value);
                    if (selected) setSelectedAssigneeName(selected.name);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee.id} value={assignee.id}>
                        {assignee.name} ({assignee.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || isFetching || assignees.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Assigning...
              </>
            ) : (
              'Assign'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
