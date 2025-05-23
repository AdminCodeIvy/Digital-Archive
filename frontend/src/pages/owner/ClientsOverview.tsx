
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { fetchClients, fetchClientPlans, updateClient, deleteClient, fetchClientOverviewMetrics } from '@/services/api';
import { PlusCircle, Search, Edit, Trash2, FileText, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ClientEditModal from '@/components/clients/ClientEditModal';

const ClientsOverview = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedClient, setSelectedClient] = React.useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  
  const { data: clientsData, isLoading: isLoadingClients, refetch: refetchClients } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
  
  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['clientPlans'],
    queryFn: fetchClientPlans,
  });
  
  const isLoading = isLoadingClients || isLoadingPlans;
  
  // Metrics calculations
  const totalClients = clientsData?.data?.length || 0;
  const totalDocsShared = clientsData?.data?.reduce((sum: number, client: any) => sum + (client.document_shared || 0), 0) || 0;
  const totalDocsDownloaded = clientsData?.data?.reduce((sum: number, client: any) => sum + (client.document_downloaded || 0), 0) || 0;

  const { data: clientMetricsResponse, isLoading: isClientMetricsLoading } = useQuery({
    queryKey: ['client-overview-metrics'],
    queryFn: fetchClientOverviewMetrics
  });

  const clientMetrics = clientMetricsResponse?.data;
  const totalInvoiceValue = clientMetrics?.totalInvoiceValue || "0.00";

  const handleEditClient = (client: any) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
  };

  const handleStatusChange = async (clientId: string, newStatus: 'active' | 'canceled') => {
    try {
      await updateClient(clientId, { status: newStatus });
      refetchClients();
      toast.success(`Client status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Failed to update client status');
    }
  };
  
  const handleDeleteClient = async (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteClient(clientId);
        refetchClients();
        toast.success('Client deleted successfully');
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };
  
  // Filter clients based on search query
  const filteredClients = clientsData?.data?.filter((client: any) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.plan_name.toLowerCase().includes(query) ||
      client.status.toLowerCase().includes(query)
    );
  });
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">Clients</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/owner/clients/plans')}
            variant="outline"
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Client Plans
          </Button>
          
          <Button 
            onClick={() => navigate('/owner/clients/create')}
            className="bg-orange-500 hover:bg-orange-600 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create New Account
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Invoice Value</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">${totalInvoiceValue}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Documents Downloaded</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">{totalDocsDownloaded}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Documents Shared</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">{totalDocsShared}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Client List</h3>
            <div className="mt-2 flex items-baseline">
              <span className="text-3xl font-semibold text-gray-900">{totalClients}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <Input 
            type="search" 
            className="pl-10" 
            placeholder="Search by Name, Date, Status etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card className="bg-white rounded-lg border">
        <div className="p-4 flex items-center justify-between border-b">
          <h3 className="font-medium">Subscription Details</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Date Subscribed</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    <span className="ml-3">Loading clients...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredClients?.length > 0 ? (
              filteredClients.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 mr-2 overflow-hidden flex items-center justify-center">
                        <div className="text-xs text-gray-600">{client.name.split(' ').map((n: string) => n[0]).join('')}</div>
                      </div>
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(client.subscription_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={client.status === 'active' ? 'success' : 
                              client.status === 'pending' ? 'warning' : 'destructive'}
                      className={
                        client.status === 'active' ? 'bg-green-100 text-green-800' : 
                        client.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }
                    >
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => navigate(`/owner/clients/${client.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {client.status === 'active' ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-red-500 border-red-200 hover:bg-red-50"
                          onClick={() => handleStatusChange(client.id, 'canceled')}
                        >
                          Block
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-green-500 border-green-200 hover:bg-green-50"
                          onClick={() => handleStatusChange(client.id, 'active')}
                        >
                          Unblock
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No clients match your search criteria' : 'No clients found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Client Edit Modal */}
      {selectedClient && (
        <ClientEditModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          client={selectedClient}
          onSuccess={refetchClients}
        />
      )}
    </div>
  );
};

export default ClientsOverview;
