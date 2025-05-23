import { toast } from "sonner";

interface DocumentHistoryEntry {
  id: string;
  document_id: string;
  edited_by: string;
  role: string;
  edit_description: string;
  created_at: string;
}

export const addDocumentHistory = async (document_id: string, edit_description: string, edit_details?: string) => {
  try {
    const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';
    
    const response = await fetch('https://digitial-archieve-backend.vercel.app/document-history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        document_id,
        edit_description,
        edit_details
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add document history entry');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding document history:', error);
    return { error: `Failed to log document activity: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};

export const getDocumentHistory = async (document_id: string) => {
  try {
    const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';
    
    const response = await fetch(`https://digitial-archieve-backend.vercel.app/document-history/${document_id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch document history');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching document history:', error);
    toast.error(`Failed to fetch document history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { data: [], error: `Failed to fetch document history: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
};
