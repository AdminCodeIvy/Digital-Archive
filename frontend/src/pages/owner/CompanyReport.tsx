
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchCompanyReport } from '@/services/api';
import { 
  DollarSign, 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Download, 
  Upload, 
  Share2,
  Calendar 
} from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';

type TimeRangeType = 'week' | '15days' | 'month';

export default function CompanyReport() {
  const [timeRange, setTimeRange] = useState<TimeRangeType>('week');
  
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['companyReport', timeRange],
    queryFn: () => fetchCompanyReport(timeRange)
  });

  const report = reportData?.data || {};
  const metrics = report.metrics || {};
  const invoiceBreakdown = report.invoiceBreakdown || {};

  const getTimeRangeDisplayName = () => {
    switch (timeRange) {
      case 'week': return 'Weekly';
      case '15days': return '15 Days';
      case 'month': return 'Monthly';
      default: return 'Weekly';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Company Report</h1>
          <p className="text-muted-foreground">
            Detailed overview of {report.company || 'Company'} performance and metrics
          </p>
        </div>
        
        {/* <Badge className="bg-orange-100 text-orange-800 text-sm">
          Next Billing Due: {report.nextBillingDueInDays || 0} days
        </Badge> */}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-3">Loading report data...</span>
        </div>
      ) : (
        <>
          <Card className="bg-white rounded-lg border">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg">Company Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="font-medium">{report.company || 'Not specified'}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="font-medium">{report.planName || 'Not specified'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            <StatsCard
              title="Total Invoice Value"
              value={`$${metrics.totalInvoiceValue || '0.00'}`}
              icon={<DollarSign className="h-5 w-5" />}
              color="bg-green-50 text-green-600"
            />
            
            <StatsCard
              title="Invoices Paid"
              value={`$${metrics.totalInvoicesPaid || '0.00'}`}
              icon={<CheckCircle className="h-5 w-5" />}
              color="bg-blue-50 text-blue-600"
            />
            
            <StatsCard
              title="Total Clients"
              value={metrics.totalClients || 0}
              icon={<Users className="h-5 w-5" />}
              color="bg-purple-50 text-purple-600"
            />

            <StatsCard
              title="Total Documents"
              value={metrics.totalDocuments || 0}
              icon={<FileText className="h-5 w-5" />}
              color="bg-indigo-50 text-indigo-600"
            />

            <StatsCard
              title="Complete Documents"
              value={metrics.completeDocuments || 0}
              icon={<CheckCircle className="h-5 w-5" />}
              color="bg-teal-50 text-teal-600"
            />
          </div>

          {/* <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Activity Metrics</h2>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
              <Select 
                value={timeRange} 
                onValueChange={(value) => setTimeRange(value as TimeRangeType)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={getTimeRangeDisplayName()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="15days">Last 15 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
 */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <Card className="bg-white rounded-lg border">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg">Expected Next Month Invoice Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-green-600" />
                      Monthly Charge
                    </span>
                    <span className="font-medium">${invoiceBreakdown.monthlyCharge || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <Upload className="mr-2 h-4 w-4 text-blue-600" />
                      Upload Charge
                    </span>
                    <span className="font-medium">${invoiceBreakdown.uploadCharge || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <Download className="mr-2 h-4 w-4 text-indigo-600" />
                      Download Charge
                    </span>
                    <span className="font-medium">${invoiceBreakdown.downloadCharge || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <Share2 className="mr-2 h-4 w-4 text-violet-600" />
                      Share Charge
                    </span>
                    <span className="font-medium">${invoiceBreakdown.shareCharge || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <span className="font-medium flex items-center">
                      <DollarSign className="mr-2 h-4 w-4 text-orange-600" />
                      Total Invoice Amount
                    </span>
                    <span className="font-bold text-lg text-orange-600">${invoiceBreakdown.totalInvoiceAmount || '0.00'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white rounded-lg border">
              <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg">Activity Metrics</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <Upload className="mr-2 h-4 w-4 text-blue-600" />
                      Documents Uploaded
                    </span>
                    <span className="font-medium">{metrics.documentsUploaded || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <Download className="mr-2 h-4 w-4 text-indigo-600" />
                      Documents Downloaded
                    </span>
                    <span className="font-medium">{metrics.documentsDownloaded || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <Share2 className="mr-2 h-4 w-4 text-violet-600" />
                      Documents Shared
                    </span>
                    <span className="font-medium">{metrics.documentsShared || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-orange-600" />
                      Active Disputes
                    </span>
                    <span className="font-medium">{metrics.activeDisputes || 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="text-muted-foreground flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Resolved Disputes
                    </span>
                    <span className="font-medium">{metrics.resolvedDisputes || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
