
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, Calendar, Check, FileText, Search, X, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface Dispute {
  id: string;
  user_id: string;
  company_id: string;
  document_id: string;
  dispute_description: string;
  resolve: boolean;
  created_at: string;
  created_by_name: string;
  document_name: string;
}

const DisputesPage = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const isManagerOrOwner = user?.role?.toLowerCase() === 'manager' || user?.role?.toLowerCase() === 'owner';

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';
      
      const response = await fetch("https://digital-archive-beta.vercel.app/disputes", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch disputes");
      }

      const data = await response.json();
      setDisputes(data);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (disputeId: string) => {
    try {
      const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';
      
      const response = await fetch(`https://digital-archive-beta.vercel.app/disputes/${disputeId}/resolve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to resolve dispute");
      }

      await response.json();
      toast.success("Dispute resolved successfully");
      
      // Update local state
      setDisputes(prevDisputes => 
        prevDisputes.map(dispute => 
          dispute.id === disputeId ? { ...dispute, resolve: true } : dispute
        )
      );
    } catch (error) {
      console.error("Error resolving dispute:", error);
      toast.error("Failed to resolve dispute");
    }
  };

  const handleViewDocument = (documentId: string) => {
    if (!documentId) {
      toast.error("Document ID not available");
      return;
    }
    
    const userRole = user?.role.toLowerCase();
    navigate(`/${userRole}/documents/${documentId}`);
  };

  const filteredDisputes = disputes.filter(dispute => 
    dispute.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dispute.dispute_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-orange-500" />
          Disputes Management
        </h1>
        
        <div className="flex items-center w-1/3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search disputes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredDisputes.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No disputes found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {searchTerm ? "Try adjusting your search terms." : "You don't have any disputes at the moment."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisputes.map((dispute) => (
            <Card key={dispute.id} className={dispute.resolve ? "opacity-75" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-md flex items-center gap-2 truncate">
                    <FileText className="h-4 w-4 flex-shrink-0 text-orange-500" />
                    <span className="truncate">{dispute.document_name === "Unknown Document" ? '-' : dispute.document_name}</span>
                  </CardTitle>
                  <Badge className={dispute.resolve ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                    {dispute.resolve ? "Resolved" : "Open"}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(dispute.created_at), "MMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-3 rounded-md text-sm mb-2 min-h-[80px] max-h-[120px] overflow-y-auto">
                  {dispute.dispute_description}
                </div>
                <p className="text-xs text-gray-500">
                  Reported by: <span className="font-medium">{dispute.created_by_name}</span>
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleViewDocument(dispute.document_id)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Document
                </Button>
                {isManagerOrOwner && !dispute.resolve && (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleResolveDispute(dispute.id)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisputesPage;
