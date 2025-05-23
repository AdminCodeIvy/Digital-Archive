
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface InvoiceCardProps {
  invoices: any[];
  isLoading: boolean;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoices, isLoading }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || 'user';

  const displayInvoices = invoices?.slice(0, 5) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-md font-medium">Recent Invoices</CardTitle>
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/${userRole}/invoices`)}
          className="h-8 px-2 text-xs"
        >
          View All
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-sm">Loading invoices...</span>
          </div>
        ) : displayInvoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    #{invoice.id.substring(0, 6)}...
                  </TableCell>
                  <TableCell>{invoice.invoice_month || 'Current'}</TableCell>
                  <TableCell>${invoice.invoice_value || invoice.amount || 0}</TableCell>
                  <TableCell>
                    <Badge 
                      className={invoice.invoice_submitted 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {invoice.invoice_submitted ? 'Submitted' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => navigate(`/${userRole}/invoices/${invoice.id}`)}
                    >
                      <FileText className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No invoices found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;
