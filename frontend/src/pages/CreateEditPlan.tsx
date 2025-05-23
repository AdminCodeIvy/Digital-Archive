import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchPlan, createPlan, updatePlan } from '@/services/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CreateEditPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [planName, setPlanName] = useState('');
  const [canAddClient, setCanAddClient] = useState(false);
  const [numberOfClients, setNumberOfClients] = useState('0');
  const [totalUsers, setTotalUsers] = useState('0');
  const [canShareDocument, setCanShareDocument] = useState(false);
  const [canViewActivityLogs, setCanViewActivityLogs] = useState(false);
  const [canViewChat, setCanViewChat] = useState(false);
  const [docsUploadLimit, setDocsUploadLimit] = useState('0');
  const [priceDescription, setPriceDescription] = useState('');
  const [storageLimit, setStorageLimit] = useState('0');
  const [canViewReports, setCanViewReports] = useState(false);
  const [allowMultipleUploads, setAllowMultipleUploads] = useState(false);
  const [billingDuration, setBillingDuration] = useState('1'); // Default to monthly
  
  // Document Pricing - added count fields
  const [downloadPricePerThousand, setDownloadPricePerThousand] = useState('0');
  const [downloadCount, setDownloadCount] = useState('1000');
  const [sharePricePerThousand, setSharePricePerThousand] = useState('0');
  const [shareCount, setShareCount] = useState('1000');
  const [uploadPricePerTen, setUploadPricePerTen] = useState('0');
  const [uploadCount, setUploadCount] = useState('10');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: planData, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => fetchPlan(id!),
    enabled: isEditing,
  });
  
  useEffect(() => {
    if (isEditing && planData?.data) {
      const plan = planData.data;
      setPlanName(plan.name);
      setCanAddClient(plan.can_add_client || false);
      setNumberOfClients(plan.number_of_clients?.toString() || '0');
      setTotalUsers(plan.total_users?.toString() || '0');
      setCanShareDocument(plan.can_share_document || false);
      setCanViewActivityLogs(plan.can_view_activity_logs || false);
      setCanViewChat(plan.can_view_chat || false);
      setDocsUploadLimit(plan.docs_upload_limit?.toString() || '0');
      setPriceDescription(plan.price_description || '');
      setStorageLimit(plan.storage_limit_gb?.toString() || '0');
      setCanViewReports(plan.can_view_reports || false);
      setAllowMultipleUploads(plan.allow_multiple_uploads || false);
      setBillingDuration(plan.billing_duration?.toString() || '1');
      
      // Set document pricing values
      setDownloadPricePerThousand(plan.download_price_per_thousand?.toString() || '0');
      setDownloadCount(plan.download_count?.toString() || '1000');
      setSharePricePerThousand(plan.share_price_per_thousand?.toString() || '0');
      setShareCount(plan.share_count?.toString() || '1000');
      setUploadPricePerTen(plan.upload_price_per_ten?.toString() || '0');
      setUploadCount(plan.upload_count?.toString() || '10');
    }
  }, [isEditing, planData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planName.trim()) {
      toast.error('Plan name is required');
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      return;
    }
    
    const planData = {
      name: planName.trim(),
      can_add_client: canAddClient,
      number_of_clients: Number(numberOfClients),
      total_users: Number(totalUsers),
      can_share_document: canShareDocument,
      can_view_activity_logs: canViewActivityLogs,
      can_view_chat: canViewChat,
      storage_limit_gb: Number(storageLimit),
      docs_upload_limit: Number(docsUploadLimit),
      price_description: priceDescription,
      can_view_reports: canViewReports,
      allow_multiple_uploads: allowMultipleUploads,
      document_search: false, // We're removing this from UI, but setting default value
      billing_duration: Number(billingDuration),
      
      // Document Pricing with count fields
      download_price_per_thousand: Number(downloadPricePerThousand),
      download_count: Number(downloadCount),
      share_price_per_thousand: Number(sharePricePerThousand),
      share_count: Number(shareCount),
      upload_price_per_ten: Number(uploadPricePerTen),
      upload_count: Number(uploadCount),
    };
    
    try {
      setIsSubmitting(true);
      
      if (isEditing) {
        await updatePlan(id!, planData);
        toast.success('Plan updated successfully');
      } else {
        await createPlan(planData);
        toast.success('Plan created successfully');
      }
      navigate('/admin/subscriptions');
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Loading plan data...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin/subscriptions')}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">{isEditing ? `Edit Plan` : 'Create New Plan'}</h1>
          </div>
          <p className="text-sm text-muted-foreground">Client Management</p>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="planName" className="block text-sm font-medium mb-1">
                Plan Name
              </label>
              <Input
                id="planName"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
                className="w-full"
              />
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Client Management</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canAddClient" 
                    checked={canAddClient} 
                    onCheckedChange={(checked) => setCanAddClient(checked as boolean)}
                  />
                  <label htmlFor="canAddClient" className="text-sm font-medium">
                    Can Add Client
                  </label>
                </div>
                
                <div>
                  <label htmlFor="numberOfClients" className="block text-sm font-medium mb-1">
                    Number of Clients
                  </label>
                  <Input
                    id="numberOfClients"
                    type="number"
                    min="0"
                    value={numberOfClients}
                    onChange={(e) => setNumberOfClients(e.target.value)}
                    placeholder="Enter number of clients allowed"
                    className="w-full max-w-xs"
                    disabled={!canAddClient}
                  />
                </div>

                <div>
                  <label htmlFor="totalUsers" className="block text-sm font-medium mb-1">
                    Total Users (Manager, QA, Scanner, Indexer)
                  </label>
                  <Input
                    id="totalUsers"
                    type="number"
                    min="0"
                    value={totalUsers}
                    onChange={(e) => setTotalUsers(e.target.value)}
                    placeholder="Enter total number of users allowed"
                    className="w-full max-w-xs"
                  />
                </div>

                <div>
                  <label htmlFor="storageLimit" className="block text-sm font-medium mb-1">
                    Storage Limit (GB)
                  </label>
                  <Input
                    id="storageLimit"
                    type="number"
                    min="0"
                    value={storageLimit}
                    onChange={(e) => setStorageLimit(e.target.value)}
                    placeholder="Enter storage limit in GB"
                    className="w-full max-w-xs"
                  />
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Document Management</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canShareDocument" 
                    checked={canShareDocument} 
                    onCheckedChange={(checked) => setCanShareDocument(checked as boolean)}
                  />
                  <label htmlFor="canShareDocument" className="text-sm font-medium">
                    Document Share
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canViewActivityLogs" 
                    checked={canViewActivityLogs} 
                    onCheckedChange={(checked) => setCanViewActivityLogs(checked as boolean)}
                  />
                  <label htmlFor="canViewActivityLogs" className="text-sm font-medium">
                    Documents Activity Log
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canViewChat" 
                    checked={canViewChat} 
                    onCheckedChange={(checked) => setCanViewChat(checked as boolean)}
                  />
                  <label htmlFor="canViewChat" className="text-sm font-medium">
                    Can Chat with Document
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="canViewReports" 
                    checked={canViewReports} 
                    onCheckedChange={(checked) => setCanViewReports(checked as boolean)}
                  />
                  <label htmlFor="canViewReports" className="text-sm font-medium">
                    Can View Reports
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="allowMultipleUploads" 
                    checked={allowMultipleUploads} 
                    onCheckedChange={(checked) => setAllowMultipleUploads(checked as boolean)}
                  />
                  <label htmlFor="allowMultipleUploads" className="text-sm font-medium">
                    Allow Multiple Uploads
                  </label>
                </div>
                
                {/* Document Search checkbox removed */}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Plan Limits & Billing</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="docsUploadLimit" className="block text-sm font-medium mb-1">
                    Docs Upload Limit
                  </label>
                  <Input
                    id="docsUploadLimit"
                    type="number"
                    min="0"
                    value={docsUploadLimit}
                    onChange={(e) => setDocsUploadLimit(e.target.value)}
                    placeholder="Enter document upload limit"
                    className="w-full max-w-xs"
                  />
                </div>
                
                <div>
                  <label htmlFor="priceDescription" className="block text-sm font-medium mb-1">
                    Price/per month USD
                  </label>
                  <Input
                    id="priceDescription"
                    value={priceDescription}
                    onChange={(e) => setPriceDescription(e.target.value)}
                    placeholder="Enter price per month in USD"
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="billingDuration" className="block text-sm font-medium mb-1">
                    Billing Frequency
                  </label>
                  <Select
                    value={billingDuration}
                    onValueChange={setBillingDuration}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select billing frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monthly</SelectItem>
                      <SelectItem value="2">Every 2 months</SelectItem>
                      <SelectItem value="3">Quarterly</SelectItem>
                      <SelectItem value="4">Every 4 months</SelectItem>
                      <SelectItem value="6">Bi-annually</SelectItem>
                      <SelectItem value="12">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    How often the client will be billed
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Document Pricing</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="downloadPricePerThousand" className="block text-sm font-medium mb-1">
                    Download Price
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="relative w-full max-w-xs">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input
                        id="downloadPricePerThousand"
                        type="number"
                        min="0"
                        step="0.01"
                        value={downloadPricePerThousand}
                        onChange={(e) => setDownloadPricePerThousand(e.target.value)}
                        placeholder="Enter price"
                        className="pl-8"
                      />
                    </div>
                    <span className="text-gray-500">per</span>
                    <div className="w-full max-w-xs">
                      <Input
                        id="downloadCount"
                        type="number"
                        min="1"
                        value={downloadCount}
                        onChange={(e) => setDownloadCount(e.target.value)}
                        placeholder="Enter count"
                      />
                    </div>
                    <span className="text-gray-500">downloads</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="sharePricePerThousand" className="block text-sm font-medium mb-1">
                    Share Price
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="relative w-full max-w-xs">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input
                        id="sharePricePerThousand"
                        type="number"
                        min="0"
                        step="0.01"
                        value={sharePricePerThousand}
                        onChange={(e) => setSharePricePerThousand(e.target.value)}
                        placeholder="Enter price"
                        className="pl-8"
                      />
                    </div>
                    <span className="text-gray-500">per</span>
                    <div className="w-full max-w-xs">
                      <Input
                        id="shareCount"
                        type="number"
                        min="1"
                        value={shareCount}
                        onChange={(e) => setShareCount(e.target.value)}
                        placeholder="Enter count"
                      />
                    </div>
                    <span className="text-gray-500">shares</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="uploadPricePerTen" className="block text-sm font-medium mb-1">
                    Upload Price
                  </label>
                  <div className="flex gap-4 items-center">
                    <div className="relative w-full max-w-xs">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <Input
                        id="uploadPricePerTen"
                        type="number"
                        min="0"
                        step="0.01"
                        value={uploadPricePerTen}
                        onChange={(e) => setUploadPricePerTen(e.target.value)}
                        placeholder="Enter price"
                        className="pl-8"
                      />
                    </div>
                    <span className="text-gray-500">per</span>
                    <div className="w-full max-w-xs">
                      <Input
                        id="uploadCount"
                        type="number"
                        min="1"
                        value={uploadCount}
                        onChange={(e) => setUploadCount(e.target.value)}
                        placeholder="Enter count"
                      />
                    </div>
                    <span className="text-gray-500">uploads</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/admin/subscriptions')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Saving...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Save' : 'Create Plan'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEditPlan;
