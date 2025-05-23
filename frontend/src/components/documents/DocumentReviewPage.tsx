import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchDocumentProgress, fetchDocuments } from "@/services/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye, Pencil, FileCheck, FileText, Edit, Send, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { toast } from "sonner";

interface DocumentReviewPageProps {
  role: 'owner' | 'manager' | 'scanner' | 'qa' | 'indexer';
}

type TimeRangeType = 'week' | '15days' | 'month';

export default function DocumentReviewPage({ role }: DocumentReviewPageProps) {
  const navigate = useNavigate();
  const { permissions } = usePlanPermissions();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [progressData, setProgressData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<TimeRangeType>('week');
  
  const canViewReports = permissions?.can_view_reports;

  useEffect(() => {

    if (!canViewReports) {
      toast.error("Your current plan doesn't allow access to reports.");
      navigate(`/${role}/dashboard`);
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const progressResponse = await fetchDocumentProgress(timeRange);
        if (progressResponse.data) {
          setProgressData(progressResponse.data);
        }
        
        const docsResponse = await fetchDocuments();
        if (docsResponse.data) {
          const allDocs = Array.isArray(docsResponse.data) ? docsResponse.data : [];
          setDocuments(allDocs);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, permissions.can_view_activity_logs, navigate, role]);
  

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
  
    const searchLower = searchQuery.toLowerCase();
  
    return (
      (doc.title && doc.title.toLowerCase().includes(searchLower)) ||
      (doc.tag_name && doc.tag_name.toLowerCase().includes(searchLower)) ||
      (doc.properties && doc.properties.some((prop: any) =>
        (prop.name && prop.name.toString().toLowerCase().includes(searchLower)) 
      ||
        (prop.value && prop.value.toString().toLowerCase().includes(searchLower))
      ))
    );
  });  
  
  const prepareChartData = () => {
    if (!progressData?.progress) return [];
    
    if (timeRange === 'week') {
      // For week view, use days of week
      const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return daysOrder.map(day => ({
        day,
        documents: progressData.progress[day] || 0,
      }));
    } else {
      // For 15days or month view, use calendar dates
      return Object.entries(progressData.progress).map(([date, count]) => ({
        day: date,
        documents: count as number,
      }));
    }
  };
  
  const getRoleName = () => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'manager': return 'Manager';
      case 'scanner': return 'Scanner';
      case 'qa': return 'QA Specialist';
      case 'indexer': return 'Indexer';
      default: return String(role);
    }
  };
  
  const handleDocumentAction = (documentId: string, action: 'view' | 'edit') => {
    if (action === 'view') {
      navigate(`/${role}/documents/${documentId}`);
    } else if (action === 'edit') {
      navigate(`/${role}/documents/${documentId}`);
    }
  };
  
  const renderProgressBadge = (status: string) => {
    if (status === 'Incomplete') {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">{status}</Badge>;
    } else if (status === 'Published') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">{status}</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{status}</Badge>;
    }
  };

  const renderActivityMetrics = () => {
    const summary = progressData?.summary || {
      documents_indexed: 0,
      documents_viewed: 0,
      documents_changed: 0,
      documents_published: 0
    };

    // Define our metrics based on the real data now
    const metrics = [
      { id: 1, label: "Documents Indexed", value: summary.documents_indexed, icon: FileCheck },
      { id: 2, label: "PDFs Viewed", value: summary.documents_viewed, icon: FileText },
      { id: 3, label: "Documents Changed", value: summary.documents_changed, icon: Edit },
    ];

    // Add role-specific fourth metric
    if (role === 'qa') {
      metrics.push({ id: 4, label: "Documents Published", value: summary.documents_published, icon: Send });
    } else {
      metrics.push({ id: 4, label: "Documents Submitted", value: summary.documents_published, icon: Send });
    }

    // Add descriptive text based on role
    let roleDescription = "";
    if (role === 'qa') {
      roleDescription = "Document indexed includes: PDFs you viewed, documents you changed, and documents you reviewed and published.";
    } else {
      roleDescription = "Document indexed includes: PDFs you viewed, documents you changed, and documents you submitted.";
    }

    return (
      <>
        <div className="mb-4 text-sm text-muted-foreground">
          <p>{roleDescription}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <Card key={metric.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <metric.icon className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                    <h3 className="text-2xl font-bold">{metric.value}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  };

  const getTimeRangeDisplayName = () => {
    switch (timeRange) {
      case 'week': return 'Weekly';
      case '15days': return '15 Days';
      case 'month': return 'Monthly';
      default: return 'Weekly';
    }
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Overview</h1>
          <p className="text-muted-foreground">Reporting</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">{format(new Date(), "dd MMMM, yyyy")}</p>
          <p className="text-muted-foreground">{format(new Date(), "h:mm a")}</p>
        </div>
      </div>
      
      {renderActivityMetrics()}
      
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className="text-xl font-semibold">Indexing Progress</h2>
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-muted-foreground mr-1" />
          <Select 
            value={timeRange} 
            onValueChange={(value) => setTimeRange(value as TimeRangeType)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Weekly</SelectItem>
              <SelectItem value="15days">Last 15 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-6">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">{getTimeRangeDisplayName()} Indexing Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareChartData()} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: timeRange === 'week' ? 12 : 10 }}
                    angle={timeRange !== 'week' ? -45 : 0}
                    textAnchor={timeRange !== 'week' ? 'end' : 'middle'}
                    height={timeRange !== 'week' ? 60 : 30}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                  />
                  <Bar 
                    dataKey="documents" 
                    fill="#f97316" 
                    radius={[4, 4, 0, 0]} 
                    name="Documents Indexed"
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Document History</h2>
        </div>
        
        <div className="flex justify-between gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              type="search"
              placeholder="Search documents..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            Filter
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Title</TableHead>
                <TableHead>Date Initiated</TableHead>
                <TableHead>Date Completed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Document Tag</TableHead>
                <TableHead>Document Progress</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex justify-center">
                      <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc, index) => (
                  <TableRow key={doc.id || index}>
                    <TableCell className="font-medium">{doc.title || `-`}</TableCell>
                    <TableCell>{format(new Date(doc.created_at || new Date()), 'MM/dd/yyyy')}</TableCell>
                    <TableCell>{doc.completed_at ? format(new Date(doc.completed_at), 'MM/dd/yyyy') : '-'}</TableCell>
                    <TableCell>
                      {renderProgressBadge(doc.status || (Math.random() > 0.7 ? 'Incomplete' : 'Published'))}
                    </TableCell>
                    <TableCell>{doc.tag_name || 'Will'}</TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${doc.progress || 75}%` }}></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {doc.status === 'Incomplete' ? (
                        <Button 
                          variant="outline" 
                          className="text-orange-500 border-orange-500"
                          onClick={() => handleDocumentAction(doc.id, 'edit')}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Continue Editing
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={() => handleDocumentAction(doc.id, 'view')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
