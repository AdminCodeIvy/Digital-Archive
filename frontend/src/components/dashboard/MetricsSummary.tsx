
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatsCard } from '@/components/ui/stats-card';
import { DollarSign, FileUp, FileText } from 'lucide-react';
import { fetchStats } from '@/services/api';

export const MetricsSummary = () => {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatsCard
        title="Total Invoice Value"
        value={`$${statsData?.totalInvoiceAmount || 0}`}
        icon={<DollarSign className="h-5 w-5" />}
        color="bg-blue-50 text-blue-600"
      />
      
      <StatsCard
        title="Documents Uploaded"
        value={statsData?.totalDocumentsUploaded?.toLocaleString() || 0}
        icon={<FileUp className="h-5 w-5" />}
        color="bg-purple-50 text-purple-600"
      />
      
      <StatsCard
        title="Documents Published"
        value={statsData?.totalDocumentsPublished?.toLocaleString() || 0}
        icon={<FileText className="h-5 w-5" />}
        color="bg-green-50 text-green-600"
      />
    </div>
  );
};
