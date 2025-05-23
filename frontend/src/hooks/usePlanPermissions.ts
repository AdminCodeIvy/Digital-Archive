
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlanInformation } from '@/services/api';
import { toast } from 'sonner';
import { PlanPermissions } from '@/types';

export function usePlanPermissions() {
  const [permissions, setPermissions] = useState<PlanPermissions>({
    can_download: false,
    can_share: false,
    can_view_activity_logs: false,
    can_view_chat: false,
    can_view_reports: false
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['plan-permissions'],
    queryFn: fetchPlanInformation,
  });

  const showPermissionError = (feature: string) => {
    toast.error(`Your current plan doesn't allow access to ${feature}.`, {
      duration: 4000,
    });
  };

  useEffect(() => {
    if (data?.plan) {
      setPermissions(data.plan);
    }
  }, [data]);

  return {
    canAddClient: data?.plan?.can_add_client,
    clientLimit: data?.plan?.number_of_clients,
    permissions: data?.plan,
    isLoading,
    error,
    showPermissionError,
    canViewChat: Boolean(data?.plan?.can_view_chat) // Explicitly convert to boolean to handle null values
  };
}
