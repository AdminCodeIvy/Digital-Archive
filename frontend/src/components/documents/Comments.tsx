
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { addDocumentComment } from "@/services/api";
import { toast } from "sonner";
import { format } from "date-fns";

interface Comment {
  comment: string;
  added_by: string;
  role: string;
  name: string;
  timestamp: string;
}

interface CommentsProps {
  documentId: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export const Comments = ({ documentId, comments, onCommentAdded }: CommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const { error } = await addDocumentComment(documentId, newComment);
      
      if (error) {
        toast.error(error);
        return;
      }

      toast.success("Comment added successfully");
      setNewComment("");
      onCommentAdded();
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.name}</span>
                <span className="text-xs text-gray-500">({comment.role})</span>
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.timestamp), "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <p className="text-gray-700">{comment.comment}</p>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4">No comments yet</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "Sending..." : "Send Comment"}
          </Button>
        </div>
      </form>
    </div>
  );
};
