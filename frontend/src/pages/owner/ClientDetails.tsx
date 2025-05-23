import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { ArrowLeft, FileEdit, Search, Calendar, Wallet, Receipt, Share2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchClientData } from '@/services/api';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';

  const { data: response, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClientData(id as string),
    enabled: !!id,
  });

  const client = response?.data;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <p className="text-center p-6">Loading client details...</p>;
  }

  if (!client) {
    return <p className="text-center p-6">Client not found.</p>;
  }

  const invoiceStats = {
    total: client.invoices?.reduce((sum: number, i: any) => sum + i.invoice_value, 0) || 0,
    paid: client.invoices?.filter((i: any) => i.invoice_submitted).length || 0,
    unpaid: client.invoices?.filter((i: any) => !i.invoice_submitted).length || 0,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold">Client: {client.name}</h1>
        <Badge className={getStatusColor(client.status)}>{client.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-muted-foreground text-sm">Documents Uploaded</h3>
            <div className="text-3xl font-semibold">{client.document_uploaded || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-muted-foreground text-sm">Documents Downloaded</h3>
            <div className="text-3xl font-semibold">{client.document_downloaded || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="text-muted-foreground text-sm">Documents Shared</h3>
            <div className="text-3xl font-semibold">{client.document_shared || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-2">
            <h4 className="text-sm text-muted-foreground">Email</h4>
            <p className="text-base font-medium">{client.email}</p>
            <h4 className="text-sm text-muted-foreground mt-4">Subscription Date</h4>
            <p className="text-base font-medium">{formatDate(client.subscription_date)}</p>
            <h4 className="text-sm text-muted-foreground mt-4">Plan</h4>
            <p className="text-base font-medium">{client.plan?.name || 'No Plan Assigned'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-2">
            <h4 className="text-sm text-muted-foreground">Invoice Summary</h4>
            <div className="flex flex-col gap-2 text-base font-medium">
              <p>Total Invoiced: ${invoiceStats.total.toFixed(2)}</p>
              <p>Paid Invoices: {invoiceStats.paid}</p>
              <p>Unpaid Invoices: {invoiceStats.unpaid}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Invoice History</h2>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-8 max-w-sm" />
          </div>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.invoices && client.invoices?.length > 0 ? (
                client.invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell>{inv.invoice_month}</TableCell>
                    <TableCell>${inv.invoice_value?.toFixed(2)}</TableCell>
                    <TableCell>${inv.monthly?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(inv.invoice_submitted ? 'paid' : 'pending')}>
                        {inv.invoice_submitted ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(inv.created_at)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default ClientDetails;
