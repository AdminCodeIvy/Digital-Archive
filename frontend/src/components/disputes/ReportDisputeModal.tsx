import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { logReportCreated } from "@/utils/documentHistory";

const ReportDisputeModal = ({
  documentId,
  isOpen,
  onClose
}: {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitReport = async () => {
    if (!reportDetails.trim()) {
      toast.error("Please provide both a reason and details for the report.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';
      const response = await fetch('https://digitial-archieve-backend.vercel.app/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          document_id: documentId,
          dispute_description: reportDetails,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit report');
      }

      toast.success("Report submitted successfully!");
      
      // Log report creation
      await logReportCreated(documentId);

      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(`Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      setReportReason('');
      setReportDetails('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report an Issue</DialogTitle>
          <DialogDescription>
            Please provide details about the issue you've encountered.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Details of the Issue</label>
            <Textarea
              placeholder="Describe the issue in detail"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmitReport}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDisputeModal;
