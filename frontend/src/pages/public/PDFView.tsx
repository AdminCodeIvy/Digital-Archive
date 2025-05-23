
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Download, Printer, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { verifySharedDocument } from "@/services/api";

const PDFView = () => {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) {
      toast.error("Invalid document ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await verifySharedDocument(id, password);

      if (response.error) {
        toast.error("Incorrect password");
        setIsLoading(false);
        return;
      }
      
      if (response.data && response.data.shared.document_link) {
        setPdfUrl(response.data.shared.document_link);
        setIsAuthenticated(true);
        toast.success("Access granted");
      } else {
          toast.error("Incorrect password");
      }
    } catch (error) {
      console.error("Error verifying document:", error);
      toast.error("Failed to verify document access");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2.5));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  
  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };
  
  const handlePrint = () => {
    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }
  };
  
  useEffect(() => {
    // Reset authenticated state if ID changes
    setIsAuthenticated(false);
    setPassword("");
  }, [id]);
  
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-6 rounded-3xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-4 rounded-lg">
                <img 
                  src="/lovable-uploads/e58b11cd-fe49-4ce1-8294-9008fa0c7c77.png" 
                  alt="Logo" 
                  className="h-8"
                />
              </div>
            </div>
            
            <div className="text-center mb-8">
              <p className="text-gray-700">
                Document Access
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Enter Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                      placeholder="Type here"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Verifying...
                    </>
                  ) : (
                    "Access the Document"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="py-4 px-6 bg-white border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Document Title</h1>
          </div>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            })}
          </div>
        </div>
      </header>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-gray-800 p-2 rounded mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-white">
            <span className="text-sm">1 / 2</span>
            <span className="text-sm">82%</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              className="p-1 text-white hover:bg-gray-700 rounded"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button 
              className="p-1 text-white hover:bg-gray-700 rounded"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button 
              className="p-1 text-white hover:bg-gray-700 rounded"
              onClick={handleRotate}
            >
              <RotateCw className="h-5 w-5" />
            </button>
            <button 
              className="p-1 text-white hover:bg-gray-700 rounded"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5" />
            </button>
            <button 
              className="p-1 text-white hover:bg-gray-700 rounded"
              onClick={handlePrint}
            >
              <Printer className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div 
            style={{ 
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center top',
              transition: 'transform 0.3s ease'
            }}
            className="bg-white shadow-lg rounded"
          >
            <iframe
              id="pdf-iframe"
              src={`${pdfUrl}#toolbar=0`}
              title="PDF Viewer"
              className="w-full border-none"
              style={{ height: '85vh' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFView;
