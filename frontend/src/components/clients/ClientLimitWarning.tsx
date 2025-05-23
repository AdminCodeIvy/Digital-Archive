
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '@/services/api';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';

interface ClientLimitWarningProps {
  onLimitExceeded: (isExceeded: boolean) => void;
}

export default function ClientLimitWarning({ onLimitExceeded }: ClientLimitWarningProps) {
  const { canAddClient, clientLimit, isLoading: isLoadingPermissions } = usePlanPermissions();
  const [clientCount, setClientCount] = useState<number>(0);
  
  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    enabled: canAddClient
  });

  useEffect(() => {
    if (clientsData?.data) {
      const count = Array.isArray(clientsData.data) ? clientsData.data.length : 0;
      setClientCount(count);
      
      // Notify parent component if limit exceeded
      onLimitExceeded(count >= clientLimit || !canAddClient);
    }
  }, [clientsData, clientLimit, canAddClient, onLimitExceeded]);

  if (isLoadingPermissions || isLoadingClients) {
    return null;
  }

  if (!canAddClient) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Permission denied</AlertTitle>
        <AlertDescription>
          Your current plan does not include client management features.
        </AlertDescription>
      </Alert>
    );
  }

  if (clientCount >= clientLimit) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Client limit reached</AlertTitle>
        <AlertDescription>
          You have reached your plan's client limit of {clientLimit}. 
          Please upgrade your plan to add more clients.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Client usage</AlertTitle>
      <AlertDescription>
        You currently have {clientCount} of {clientLimit} allowed clients.
      </AlertDescription>
    </Alert>
  );
}
