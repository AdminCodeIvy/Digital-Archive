import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Subscriptions from "./pages/Subscriptions";
import CreateEditPlan from "./pages/CreateEditPlan";
import CreateCompany from "./pages/CreateCompany";
import CompanyDetails from "./pages/CompanyDetails";
import GenerateInvoice from "./pages/GenerateInvoice";
import Invoices from "./pages/Invoices";
import InvoiceDetails from "./pages/InvoiceDetails";
import Help from "./pages/Help";
import UserManagement from "./pages/UserManagement";
import FilteredDocumentsPage from "./pages/documents/FilteredDocumentsPage";
import ProfilePage from "./pages/ProfilePage";
import PDFView from "./pages/public/PDFView";

// Owner pages
import UserManagementOverview from "./pages/owner/UserManagementOverview";
import CreateUser from "./pages/owner/CreateUser";
import ConfigureRoles from "./pages/owner/ConfigureRoles";
import RoleDetails from "./pages/owner/RoleDetails";
import CreateEditRole from "./pages/owner/CreateEditRole";
import DocumentDashboard from "./pages/owner/DocumentDashboard";
import DocumentTags from "./pages/owner/DocumentTags";
import CreateDocumentTag from "./pages/owner/CreateDocumentTag";
import DocumentView from "./pages/owner/DocumentView";
import ScanDocument from "./pages/owner/ScanDocument";
import SearchDocuments from "./pages/owner/SearchDocuments";
import OwnerDocumentReviews from "./pages/owner/DocumentReviews";
import OwnerDisputes from "./pages/owner/Disputes";
import CompanyReport from "./pages/owner/CompanyReport";

// Owner Client Management Pages
import ClientsOverview from "./pages/owner/ClientsOverview";
import ClientPlans from "./pages/owner/ClientPlans";
import CreateEditClientPlan from "./pages/owner/CreateEditClientPlan";
import CreateClient from "./pages/owner/CreateClient";
import ClientDetails from "./pages/owner/ClientDetails";
import ClientInvoices from "./pages/owner/ClientInvoices";

// Manager pages
import ManagerUserManagementOverview from "./pages/manager/UserManagementOverview";
import ManagerCreateUser from "./pages/manager/CreateUser";
import ManagerDocumentDashboard from "./pages/manager/DocumentDashboard";
import ManagerDocumentTags from "./pages/manager/DocumentTags";
import ManagerCreateDocumentTag from "./pages/manager/CreateDocumentTag";
import ManagerDocumentView from "./pages/manager/DocumentView";
import ManagerScanDocument from "./pages/manager/ScanDocument";
import ManagerSearchDocuments from "./pages/manager/SearchDocuments";
import ManagerDocumentReviews from "./pages/manager/DocumentReviews";
import ManagerDisputes from "./pages/manager/Disputes";
import CompanyReport1 from "./pages/manager/CompanyReport";

// Scanner pages
import ScannerDocumentDashboard from "./pages/scanner/DocumentDashboard";
import ScannerDocumentTags from "./pages/scanner/DocumentTags";
// import ScannerCreateDocumentTag from "./pages/scanner/CreateDocumentTag";
import ScannerDocumentView from "./pages/scanner/DocumentView";
import ScannerScanDocument from "./pages/scanner/ScanDocument";
import ScannerSearchDocuments from "./pages/scanner/SearchDocuments";
import ScannerDocumentReviews from "./pages/scanner/DocumentReviews";
import ScannerDisputes from "./pages/scanner/Disputes";

// Indexer pages
import IndexerDocumentDashboard from "./pages/indexer/DocumentDashboard";
import IndexerDocumentTags from "./pages/indexer/DocumentTags";
// import IndexerCreateDocumentTag from "./pages/indexer/CreateDocumentTag";
import IndexerDocumentView from "./pages/indexer/DocumentView";
import IndexerSearchDocuments from "./pages/indexer/SearchDocuments";
import IndexerDocumentReviews from "./pages/indexer/DocumentReviews";
import IndexerDisputes from "./pages/indexer/Disputes";

// QA pages
import QADocumentDashboard from "./pages/qa/DocumentDashboard";
import QADocumentTags from "./pages/qa/DocumentTags";
// import QACreateDocumentTag from "./pages/qa/CreateDocumentTag";
import QADocumentView from "./pages/qa/DocumentView";
import QASearchDocuments from "./pages/qa/SearchDocuments";
import QADocumentReviews from "./pages/qa/DocumentReviews";
import QADisputes from "./pages/qa/Disputes";

// Client pages
import ClientDocumentDashboard from "./pages/client/DocumentDashboard";
import ClientDocumentTags from "./pages/client/DocumentTags";
// import ClientCreateDocumentTag from "./pages/client/CreateDocumentTag";
import ClientDocumentView from "./pages/client/DocumentView";
import ClientUploadDocument from "./pages/client/UploadDocument";
import ClientSearchDocuments from "./pages/client/SearchDocuments";
import ClientSharedDocuments from "./pages/client/SharedDocuments";
import ClientDisputes from "./pages/client/Disputes";
import CompanyInvoice from "./pages/owner/Invoices";
import ClientInvoiceDetails from "./pages/ClientInvoiceDetails";
import ClientInvoice from "./pages/client/Invoice";
import InvoiceDetailsClient from "./pages/client/InvoiceDetails";
import OwnerDashboard from "./pages/owner/Dashboard";
import ManagerDashboard from "./pages/manager/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <SonnerToaster />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Public PDF viewer route (doesn't need authentication) */}
            <Route path="/pdf-view/:id" element={<PDFView />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<MainLayout requiredRole={['admin']}><Index /></MainLayout>} />
            <Route path="/admin/subscriptions" element={<MainLayout requiredRole={['admin']}><Subscriptions /></MainLayout>} />
            <Route path="/admin/invoices" element={<MainLayout requiredRole={['admin']}><Invoices /></MainLayout>} />
            <Route path="/admin/invoices/:id" element={<MainLayout requiredRole={['admin']}><InvoiceDetails /></MainLayout>} />
            <Route path="/admin/plans/new" element={<MainLayout requiredRole={['admin']}><CreateEditPlan /></MainLayout>} />
            <Route path="/admin/plans/:id" element={<MainLayout requiredRole={['admin']}><CreateEditPlan /></MainLayout>} />
            <Route path="/admin/companies/new" element={<MainLayout requiredRole={['admin']}><CreateCompany /></MainLayout>} />
            <Route path="/admin/companies/:id" element={<MainLayout requiredRole={['admin']}><CompanyDetails /></MainLayout>} />
            <Route path="/admin/companies/:id/invoice" element={<MainLayout requiredRole={['admin']}><GenerateInvoice /></MainLayout>} />
            <Route path="/admin/help" element={<MainLayout requiredRole={['admin']}><Help /></MainLayout>} />
            <Route path="/admin/users" element={<MainLayout requiredRole={['admin']}><UserManagement /></MainLayout>} />
            <Route path="/admin/profile" element={<MainLayout requiredRole={['admin']}><ProfilePage /></MainLayout>} />
            
            {/* Owner Routes - redirect dashboard to documents */}
            <Route path="/owner/dashboard" element={<MainLayout requiredRole={['owner']}><OwnerDashboard /></MainLayout>} />
            <Route path="/owner/documents" element={<MainLayout requiredRole={['owner']}><DocumentDashboard /></MainLayout>} />
            <Route path="/owner/documents/reviews" element={<MainLayout requiredRole={['owner']}><OwnerDocumentReviews /></MainLayout>} />
            <Route path="/owner/documents/filtered/:filterType" element={<MainLayout requiredRole={['owner']}><FilteredDocumentsPage /></MainLayout>} />
            <Route path="/owner/search" element={<MainLayout requiredRole={['owner']}><SearchDocuments /></MainLayout>} />
            <Route path="/owner/invoices" element={<MainLayout requiredRole={['owner']}><Invoices /></MainLayout>} />
            <Route path="/owner/invoices/:id" element={<MainLayout requiredRole={['owner']}><InvoiceDetails /></MainLayout>} />
            <Route path="/owner/companies/:id/invoice" element={<MainLayout requiredRole={['owner']}><GenerateInvoice /></MainLayout>} />
            <Route path="/owner/help" element={<MainLayout requiredRole={['owner']}><Help /></MainLayout>} />
            <Route path="/owner/profile" element={<MainLayout requiredRole={['owner']}><ProfilePage /></MainLayout>} />
            <Route path="/owner/disputes" element={<MainLayout requiredRole={['owner']}><OwnerDisputes /></MainLayout>} />
            <Route path="/owner/companies/:id" element={<MainLayout requiredRole={['owner']}><CompanyDetails /></MainLayout>} />
            <Route path="/owner/company-invoices" element={<MainLayout requiredRole={['owner']}><CompanyInvoice /></MainLayout>} />
            <Route path="/owner/client-invoices/:id" element={<MainLayout requiredRole={['owner']}><ClientInvoiceDetails /></MainLayout>} />

            {/* Owner User Management Routes */}
            <Route path="/owner/users" element={<MainLayout requiredRole={['owner']}><UserManagementOverview /></MainLayout>} />
            <Route path="/owner/users/create" element={<MainLayout requiredRole={['owner']}><CreateUser /></MainLayout>} />
            <Route path="/owner/users/roles" element={<MainLayout requiredRole={['owner']}><ConfigureRoles /></MainLayout>} />
            <Route path="/owner/roles/details/:roleKey" element={<MainLayout requiredRole={['owner']}><RoleDetails /></MainLayout>} />
            <Route path="/owner/roles/create" element={<MainLayout requiredRole={['owner']}><CreateEditRole /></MainLayout>} />
            <Route path="/owner/roles/:id" element={<MainLayout requiredRole={['owner']}><CreateEditRole /></MainLayout>} />
            
            {/* Owner Document Management Routes */}
            <Route path="/owner/documents/tags" element={<MainLayout requiredRole={['owner']}><DocumentTags /></MainLayout>} />
            <Route path="/owner/documents/tags/create" element={<MainLayout requiredRole={['owner']}><CreateDocumentTag /></MainLayout>} />
            <Route path="/owner/documents/:id" element={<MainLayout requiredRole={['owner']}><DocumentView /></MainLayout>} />
            <Route path="/owner/documents/scan" element={<MainLayout requiredRole={['owner']}><ScanDocument /></MainLayout>} />
            
            {/* Owner Client Management Routes */}
            <Route path="/owner/clients" element={<MainLayout requiredRole={['owner']}><ClientsOverview /></MainLayout>} />
            <Route path="/owner/clients/plans" element={<MainLayout requiredRole={['owner']}><ClientPlans /></MainLayout>} />
            <Route path="/owner/clients/plans/create" element={<MainLayout requiredRole={['owner']}><CreateEditClientPlan /></MainLayout>} />
            <Route path="/owner/clients/plans/:id/edit" element={<MainLayout requiredRole={['owner']}><CreateEditClientPlan /></MainLayout>} />
            <Route path="/owner/clients/create" element={<MainLayout requiredRole={['owner']}><CreateClient /></MainLayout>} />
            <Route path="/owner/clients/:id" element={<MainLayout requiredRole={['owner']}><ClientDetails /></MainLayout>} />
            <Route path="/owner/client-invoices" element={<MainLayout requiredRole={['owner']}><ClientInvoices /></MainLayout>} />
            <Route path="/owner/company-report" element={<MainLayout requiredRole={['owner']}><CompanyReport /></MainLayout>} />
            
            {/* Manager Routes */}
            <Route path="/manager/dashboard" element={<MainLayout requiredRole={['manager']}><ManagerDashboard /></MainLayout>} />
            <Route path="/manager/documents" element={<MainLayout requiredRole={['manager']}><ManagerDocumentDashboard /></MainLayout>} />
            <Route path="/manager/documents/reviews" element={<MainLayout requiredRole={['manager']}><ManagerDocumentReviews /></MainLayout>} />
            <Route path="/manager/documents/filtered/:filterType" element={<MainLayout requiredRole={['manager']}><FilteredDocumentsPage /></MainLayout>} />
            <Route path="/manager/invoices" element={<MainLayout requiredRole={['manager']}><Invoices /></MainLayout>} />
            <Route path="/manager/companies/:id/invoice" element={<MainLayout requiredRole={['manager']}><GenerateInvoice /></MainLayout>} />
            <Route path="/manager/help" element={<MainLayout requiredRole={['manager']}><Help /></MainLayout>} />
            <Route path="/manager/profile" element={<MainLayout requiredRole={['manager']}><ProfilePage /></MainLayout>} />
            <Route path="/manager/disputes" element={<MainLayout requiredRole={['manager']}><ManagerDisputes /></MainLayout>} />
            <Route path="/manager/company-report" element={<MainLayout requiredRole={['manager']}><CompanyReport1 /></MainLayout>} />
            
            {/* Manager User Management Routes */}
            <Route path="/manager/users" element={<MainLayout requiredRole={['manager']}><ManagerUserManagementOverview /></MainLayout>} />
            <Route path="/manager/users/create" element={<MainLayout requiredRole={['manager']}><ManagerCreateUser /></MainLayout>} />
            
            {/* Manager Document Management Routes */}
            <Route path="/manager/documents/tags" element={<MainLayout requiredRole={['manager']}><ManagerDocumentTags /></MainLayout>} />
            <Route path="/manager/documents/tags/create" element={<MainLayout requiredRole={['manager']}><ManagerCreateDocumentTag /></MainLayout>} />
            <Route path="/manager/documents/:id" element={<MainLayout requiredRole={['manager']}><ManagerDocumentView /></MainLayout>} />
            <Route path="/manager/documents/scan" element={<MainLayout requiredRole={['manager']}><ManagerScanDocument /></MainLayout>} />
            <Route path="/manager/search" element={<MainLayout requiredRole={['manager']}><ManagerSearchDocuments /></MainLayout>} />
            
            {/* Scanner Routes */}
            <Route path="/scanner/dashboard" element={<Navigate to="/scanner/documents" replace />} />
            <Route path="/scanner/documents" element={<MainLayout requiredRole={['scanner']}><ScannerDocumentDashboard /></MainLayout>} />
            <Route path="/scanner/documents/reviews" element={<MainLayout requiredRole={['scanner']}><ScannerDocumentReviews /></MainLayout>} />
            <Route path="/scanner/documents/filtered/:filterType" element={<MainLayout requiredRole={['scanner']}><FilteredDocumentsPage /></MainLayout>} />
            <Route path="/scanner/documents/tags" element={<MainLayout requiredRole={['scanner']}><ScannerDocumentTags /></MainLayout>} />
            {/* <Route path="/scanner/documents/tags/create" element={<MainLayout requiredRole={['scanner']}><ScannerCreateDocumentTag /></MainLayout>} /> */}
            <Route path="/scanner/documents/:id" element={<MainLayout requiredRole={['scanner']}><ScannerDocumentView /></MainLayout>} />
            <Route path="/scanner/documents/scan" element={<MainLayout requiredRole={['scanner']}><ScannerScanDocument /></MainLayout>} />
            <Route path="/scanner/search" element={<MainLayout requiredRole={['scanner']}><ScannerSearchDocuments /></MainLayout>} />
            <Route path="/scanner/help" element={<MainLayout requiredRole={['scanner']}><Help /></MainLayout>} />
            <Route path="/scanner/profile" element={<MainLayout requiredRole={['scanner']}><ProfilePage /></MainLayout>} />
            <Route path="/scanner/disputes" element={<MainLayout requiredRole={['scanner']}><ScannerDisputes /></MainLayout>} />
            
            {/* Indexer Routes */}
            <Route path="/indexer/dashboard" element={<Navigate to="/indexer/documents" replace />} />
            <Route path="/indexer/documents" element={<MainLayout requiredRole={['indexer']}><IndexerDocumentDashboard /></MainLayout>} />
            <Route path="/indexer/documents/reviews" element={<MainLayout requiredRole={['indexer']}><IndexerDocumentReviews /></MainLayout>} />
            <Route path="/indexer/documents/filtered/:filterType" element={<MainLayout requiredRole={['indexer']}><FilteredDocumentsPage /></MainLayout>} />
            <Route path="/indexer/documents/tags" element={<MainLayout requiredRole={['indexer']}><IndexerDocumentTags /></MainLayout>} />
            {/* <Route path="/indexer/documents/tags/create" element={<MainLayout requiredRole={['indexer']}><IndexerCreateDocumentTag /></MainLayout>} /> */}
            <Route path="/indexer/documents/:id" element={<MainLayout requiredRole={['indexer']}><IndexerDocumentView /></MainLayout>} />
            <Route path="/indexer/search" element={<MainLayout requiredRole={['indexer']}><IndexerSearchDocuments /></MainLayout>} />
            <Route path="/indexer/help" element={<MainLayout requiredRole={['indexer']}><Help /></MainLayout>} />
            <Route path="/indexer/profile" element={<MainLayout requiredRole={['indexer']}><ProfilePage /></MainLayout>} />
            <Route path="/indexer/disputes" element={<MainLayout requiredRole={['indexer']}><IndexerDisputes /></MainLayout>} />
            
            {/* QA Routes */}
            <Route path="/qa/dashboard" element={<Navigate to="/qa/documents" replace />} />
            <Route path="/qa/documents" element={<MainLayout requiredRole={['qa']}><QADocumentDashboard /></MainLayout>} />
            <Route path="/qa/documents/reviews" element={<MainLayout requiredRole={['qa']}><QADocumentReviews /></MainLayout>} />
            <Route path="/qa/documents/filtered/:filterType" element={<MainLayout requiredRole={['qa']}><FilteredDocumentsPage /></MainLayout>} />
            <Route path="/qa/documents/tags" element={<MainLayout requiredRole={['qa']}><QADocumentTags /></MainLayout>} />
            {/* <Route path="/qa/documents/tags/create" element={<MainLayout requiredRole={['qa']}><QACreateDocumentTag /></MainLayout>} /> */}
            <Route path="/qa/documents/:id" element={<MainLayout requiredRole={['qa']}><QADocumentView /></MainLayout>} />
            <Route path="/qa/search" element={<MainLayout requiredRole={['qa']}><QASearchDocuments /></MainLayout>} />
            <Route path="/qa/help" element={<MainLayout requiredRole={['qa']}><Help /></MainLayout>} />
            <Route path="/qa/profile" element={<MainLayout requiredRole={['qa']}><ProfilePage /></MainLayout>} />
            <Route path="/qa/disputes" element={<MainLayout requiredRole={['qa']}><QADisputes /></MainLayout>} />
            
            {/* Client Routes */}
            <Route path="/client/dashboard" element={<Navigate to="/client/documents" replace />} />
            <Route path="/client/documents" element={<MainLayout requiredRole={['client']}><ClientDocumentDashboard /></MainLayout>} />
            <Route path="/client/documents/filtered/:filterType" element={<MainLayout requiredRole={['client']}><FilteredDocumentsPage /></MainLayout>} />
            <Route path="/client/documents/tags" element={<MainLayout requiredRole={['client']}><ClientDocumentTags /></MainLayout>} />
            {/* <Route path="/client/documents/tags/create" element={<MainLayout requiredRole={['client']}><ClientCreateDocumentTag /></MainLayout>} /> */}
            <Route path="/client/documents/:id" element={<MainLayout requiredRole={['client']}><ClientDocumentView /></MainLayout>} />
            <Route path="/client/documents/upload" element={<MainLayout requiredRole={['client']}><ClientUploadDocument /></MainLayout>} />
            <Route path="/client/search" element={<MainLayout requiredRole={['client']}><ClientSearchDocuments /></MainLayout>} />
            <Route path="/client/documents/shared" element={<MainLayout requiredRole={['client']}><ClientSharedDocuments /></MainLayout>} />
            <Route path="/client/help" element={<MainLayout requiredRole={['client']}><Help /></MainLayout>} />
            <Route path="/client/profile" element={<MainLayout requiredRole={['client']}><ProfilePage /></MainLayout>} />
            <Route path="/client/disputes" element={<MainLayout requiredRole={['client']}><ClientDisputes /></MainLayout>} />
            <Route path="/client/current-invoices" element={<MainLayout requiredRole={['client']}><ClientInvoice /></MainLayout>} />
            <Route path="/client/invoices/:id" element={<MainLayout requiredRole={['client']}><InvoiceDetailsClient /></MainLayout>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
