
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeletePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  planName: string;
  isLoading: boolean;
  error?: {
    message: string;
    companies?: Array<{
      company_name: string;
      admin_name: string;
      contact_email: string;
    }>;
    clients?: Array<{
      client_name: string;
      status: string;
      contact_email: string;
    }>;
  };
}

const DeletePlanModal: React.FC<DeletePlanModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  planName,
  isLoading,
  error
}) => {
  const hasError = error && (error.companies || error.clients);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {hasError ? 'Cannot Delete Plan' : 'Delete Plan'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {hasError ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>{error.message}</p>
                  
                  {error.companies && error.companies.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Companies using this plan:</p>
                      <ul className="space-y-1 text-sm">
                        {error.companies.map((company, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>{company.company_name}</span>
                            <span className="text-xs text-gray-500">{company.contact_email}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {error.clients && error.clients.length > 0 && (
                    <div>
                      <p className="font-medium mb-2">Clients using this plan:</p>
                      <ul className="space-y-1 text-sm">
                        {error.clients.map((client, index) => (
                          <li key={index} className="flex items-center justify-between">
                            <span>{client.client_name}</span>
                            <span className="text-xs text-gray-500">{client.contact_email}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the plan "{planName}"? This action cannot be undone.
            </p>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          {!hasError && (
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onConfirm} 
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Plan'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePlanModal;
