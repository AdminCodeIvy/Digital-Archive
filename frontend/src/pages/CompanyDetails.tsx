
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Edit, FileEdit, Search, Calendar, Users, Wallet, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchCompany } from '@/services/api';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

const CompanyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';
  
  const { data: companyResponse, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompany(id as string),
    enabled: !!id,
  });
  
  const company = companyResponse?.data;
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Calculate invoice statistics
  const invoiceStats = React.useMemo(() => {
    if (!company?.invoices || company.invoices.length === 0) {
      return { 
        totalInvoiceValue: 0, 
        paidInvoices: 0, 
        unpaidInvoices: 0 
      };
    }
    
    const totalInvoiceValue = company.invoices.reduce(
      (sum, invoice) => sum + (invoice.invoice_value || 0), 0
    );
    
    const paidInvoices = company.invoices.filter(
      invoice => invoice.invoice_submitted
    ).length;
    
    const unpaidInvoices = company.invoices.filter(
      invoice => !invoice.invoice_submitted
    ).length;
    
    return {
      totalInvoiceValue,
      paidInvoices,
      unpaidInvoices
    };
  }, [company?.invoices]);
  
  if (isCompanyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-orange-500 rounded-full"></div>
        <p className="ml-3">Loading company details...</p>
      </div>
    );
  }
  
  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium mb-2">Company not found</h2>
        <p className="text-muted-foreground mb-4">The company you are looking for does not exist or has been deleted.</p>
        <Button 
          onClick={() => navigate(`/${userRole}/dashboard`)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  const createdDate = company.created_at ? formatDate(company.created_at) : 'N/A';
  
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/${userRole}/dashboard`)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Company #{company.id.substring(0, 5)}</h1>
          </div>
          <p className="text-sm text-muted-foreground">Clients</p>
        </div>
      </div>
      
      <div className="flex items-center">
        <h2 className="text-xl font-medium">{company.name}</h2>
        <Badge className="ml-4 bg-orange-100 text-orange-800 hover:bg-orange-200">
          {company.plan ? company.plan.name : 'No Plan'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center mb-1">
                <Wallet className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="text-muted-foreground text-sm">Invoice Value</h3>
              </div>
              <div className="flex items-end">
                <span className="text-3xl font-semibold">${company.invoice_value_total || 0}</span>
                <span className="text-sm text-muted-foreground ml-2 mb-1">{createdDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center mb-1">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-muted-foreground text-sm">User List</h3>
              </div>
              <div className="text-3xl font-semibold">
                {company.users ? company.users.length : 0}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center mb-1">
                <FileEdit className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-muted-foreground text-sm">Published Documents</h3>
              </div>
              <div className="text-3xl font-semibold">
                {company.total_documents_published || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center mb-1">
                <Receipt className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-muted-foreground text-sm">Paid Invoices</h3>
              </div>
              <div className="text-3xl font-semibold">
                {invoiceStats.paidInvoices}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center mb-1">
                <Receipt className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-muted-foreground text-sm">Unpaid Invoices</h3>
              </div>
              <div className="text-3xl font-semibold">
                {invoiceStats.unpaidInvoices}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center mb-1">
                <Calendar className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="text-muted-foreground text-sm">Total Uploaded Documents</h3>
              </div>
              <div className="text-3xl font-semibold">
                {company.total_documents_uploaded || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Company ID</h4>
            <p className="font-medium">{company.id.substring(0, 5)}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Point of Contact</h4>
            <p className="font-medium">{company.admin_name || (company.contact_email ? company.contact_email.split('@')[0] : 'N/A')}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Last Edit Date</h4>
            <p className="font-medium">{createdDate}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Last Edit User</h4>
            <p className="font-medium text-orange-500">{company.admin_name || (company.contact_email ? company.contact_email.split('@')[0] : 'N/A')}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Storage Assigned</h4>
            <p className="font-medium">200 GB</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Subscription Status</h4>
            <Badge className={getStatusColor(company.status || 'Active')}>
              {company.status || 'Active'}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Plan Name</h4>
            <p className="font-medium">{company.plan?.name || 'No Plan'}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Plan Price</h4>
            <p className="font-medium">${company.plan?.price_description || '0'}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Total Users</h4>
            <p className="font-medium">{company.users?.length || 0}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Total Documents</h4>
            <p className="font-medium">{company.total_documents_uploaded || 0}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Documents Published</h4>
            <p className="font-medium">{company.total_documents_published || 0}</p>
          </div>
          
          <div>
            <h4 className="text-sm text-muted-foreground mb-1">Plan Features</h4>
            <div className="flex flex-wrap gap-1">
              {company.plan?.can_share_document && 
                <Badge variant="outline" className="text-xs">Document Sharing</Badge>}
              {company.plan?.can_view_activity_logs && 
                <Badge variant="outline" className="text-xs">Activity Logs</Badge>}
              {company.plan?.can_add_client && 
                <Badge variant="outline" className="text-xs">Add Client</Badge>}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Invoice History</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices..."
                className="pl-8 max-w-md"
              />
            </div>
            <Button variant="outline" size="sm">
              Filter
            </Button>
          </div>
        </div>
        
        <Card className="bg-white border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Month</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.invoices && company.invoices.length > 0 ? (
                company.invoices.map((invoice, index) => (
                  <TableRow key={invoice.id || index}>
                    <TableCell>{invoice.invoice_month || 'N/A'}</TableCell>
                    <TableCell>${invoice.invoice_value?.toFixed(2) || 0}</TableCell>
                    <TableCell>${invoice.monthly || 0}</TableCell>
                    <TableCell>
                      <Badge 
                        className={getStatusColor(invoice.invoice_submitted ? 'Paid' : 'Pending')}
                      >
                        {invoice.invoice_submitted ? 'Paid' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{invoice.created_at ? formatDate(invoice.created_at) : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs h-7 text-orange-500 border-orange-200"
                        onClick={() => navigate(`/${userRole}/invoices/${invoice.id || '12345'}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Users List</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                className="pl-8 max-w-md"
              />
            </div>
          </div>
        </div>
        
        <Card className="bg-white border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.users && company.users.length > 0 ? (
                company.users.map((user, index) => (
                  <TableRow key={user.id || index}>
                    <TableCell>{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{user.role || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge 
                        className={getStatusColor(user.status || 'active')}
                      >
                        {user.status ? user.status.charAt(0).toUpperCase() + user.status.slice(1) : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No users found
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

export default CompanyDetails;
