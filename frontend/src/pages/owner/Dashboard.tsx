
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/ui/stats-card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, FileText, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { fetchStats, fetchDocuments, fetchClientOverviewMetrics, fetchUsers } from '@/services/api';
import { ClientOverviewMetrics, Document } from '@/types';
import { usePlanPermissions } from '@/hooks/usePlanPermissions';
import { toast } from 'sonner';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { permissions } = usePlanPermissions();

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['ownerStats'],
    queryFn: fetchStats
  });

  const { data: documentsData, isLoading: isLoadingDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments
  });

  const { data: clientMetricsResponse, isLoading: isClientMetricsLoading } = useQuery({
    queryKey: ['client-overview-metrics'],
    queryFn: fetchClientOverviewMetrics
  });
  
  const clientMetrics = clientMetricsResponse?.data;

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });

  const totalUsers = clientMetrics?.clients?.length || 0;
  const documents = documentsData?.data || [];
  const totalDocuments = documents.length;
  const completeDocuments = documents.filter(doc => doc.is_published).length;
  const incompleteDocuments = totalDocuments - completeDocuments;

  // Get client invoice data safely
  const totalInvoiceValue = clientMetrics?.totalInvoiceValue || "0.00";
  const totalPaidInvoices = clientMetrics?.totalInvoicesPaid || 0;
  const totalDocumentsDownloaded = clientMetrics?.totalDocumentsDownloaded || 0;

  // Fetch disputes directly from the DisputesPage component logic
  const [disputes, setDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(true);

  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';

        const response = await fetch("https://digitial-archieve-backend.vercel.app/disputes", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch disputes");
        }

        const data = await response.json();
        setDisputes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching disputes:", error);
        setDisputes([]);
      } finally {
        setDisputesLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  // Calculate active and resolved disputes count with safe array check
  const activeDisputesCount = Array.isArray(disputes) ? disputes.filter(dispute => !dispute.resolve).length : 0;
  const resolvedDisputesCount = Array.isArray(disputes) ? disputes.filter(dispute => dispute.resolve).length : 0;

  const isLoading = isLoadingStats || isLoadingDocs || isClientMetricsLoading || isLoadingUsers || disputesLoading;

  const handleNavigateToReport = (path: string) => {
    if (!permissions.can_view_activity_logs) {
      toast.error("Your current plan doesn't allow access to reports.");
      return;
    }
    navigate(path);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome to your dashboard</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <StatsCard
          title="Total Clients Invoice Value"
          value={`$${totalInvoiceValue}`}
          icon={<DollarSign className="h-5 w-5" />}
          color="bg-green-50 text-green-600"
          onClick={() => navigate('/owner/client-invoices')}
        />

        <StatsCard
          title="Total Clients Paid Invoices"
          value={`$${totalPaidInvoices}`}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-blue-50 text-blue-600"
          onClick={() => navigate('/owner/client-invoices')}
        />

        <StatsCard
          title="Total Clients"
          value={totalUsers}
          icon={<Users className="h-5 w-5" />}
          color="bg-purple-50 text-purple-600"
          onClick={() => navigate('/owner/clients')}
        />

        <StatsCard
          title="Total Documents"
          value={totalDocuments}
          icon={<FileText className="h-5 w-5" />}
          color="bg-indigo-50 text-indigo-600"
          onClick={() => navigate('/owner/documents')}
        />

        <StatsCard
          title="Active Disputes"
          value={activeDisputesCount}
          icon={<AlertCircle className="h-5 w-5" />}
          color="bg-orange-50 text-orange-600"
          onClick={() => navigate('/owner/disputes')}
        />

        <StatsCard
          title="Resolved Disputes"
          value={resolvedDisputesCount}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-teal-50 text-teal-600"
          onClick={() => navigate('/owner/disputes')}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc: Document) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${doc.is_published ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <div>
                      <p className="font-medium">{doc.title || 'Untitled Document'}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.is_published ? 'Complete' : 'In Progress'}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={doc.is_published ? 'success' : 'warning'}
                    className={
                      doc.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {doc.is_published ? 'Complete' : 'In Progress'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Document Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="text-muted-foreground">Total Documents</span>
                <span className="font-medium">{totalDocuments}</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="text-muted-foreground">Complete Documents</span>
                <span className="font-medium">{completeDocuments}</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="text-muted-foreground">Incomplete Documents</span>
                <span className="font-medium">{incompleteDocuments}</span>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <span className="text-muted-foreground">Documents Downloaded</span>
                <span className="font-medium">{totalDocumentsDownloaded}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
