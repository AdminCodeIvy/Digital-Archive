
import { DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';

interface MetricsCardsProps {
  totalInvoiceValue: string;
  totalPaidInvoices: number;
  completeDocuments: number;
  incompleteDocuments: number;
  isLoading: boolean;
}

export function MetricsCards({
  totalInvoiceValue,
  totalPaidInvoices,
  completeDocuments,
  incompleteDocuments,
  isLoading
}: MetricsCardsProps) {
  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 rounded-lg bg-gray-100 animate-pulse" />
      ))}
    </div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatsCard
        title="Total Clients Invoice Value"
        value={`$${totalInvoiceValue}`}
        icon={<DollarSign className="h-5 w-5" />}
        color="bg-green-50 text-green-600"
      />
      <StatsCard
        title="Total Clients Paid Invoices"
        value={`$${totalPaidInvoices}`}
        icon={<CheckCircle className="h-5 w-5" />}
        color="bg-blue-50 text-blue-600"
      />
      <StatsCard
        title="Complete Documents"
        value={completeDocuments}
        icon={<FileText className="h-5 w-5" />}
        color="bg-purple-50 text-purple-600"
      />
      <StatsCard
        title="Incomplete Documents"
        value={incompleteDocuments}
        icon={<AlertCircle className="h-5 w-5" />}
        color="bg-orange-50 text-orange-600"
      />
    </div>
  );
}
