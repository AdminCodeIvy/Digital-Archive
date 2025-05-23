
export interface PlanPermissions {
  can_download: boolean;
  can_share: boolean;
  can_view_activity_logs: boolean;
  canAddClient?: boolean;
  clientLimit?: number;
}

export interface FieldChange {
  name: string;
  oldValue: string;
  newValue: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status?: string;
  documents_reviewed?: number;
}

export interface ClientOverviewMetrics {
  totalInvoiceValue: string;
  totalInvoicesPaid: number;
  totalDocumentsDownloaded: number;
  clients: any[];
  data?: any; // Added to make the API response compatible
}

export interface InvoiceQuantity {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CustomInvoice {
  id?: string;
  is_client: boolean;
  date: string;
  payment_term: string;
  due_date: string;
  company_name: string;
  company_id?: string;
  user_id?: string;
  client_name?: string;
  bill_to?: string;
  quantities: InvoiceQuantity[];
  subtotal: number;
  discount_percent: number;
  tax_percent: number;
  total: number;
  notes?: string;
  invoice_number?: string;
  type?: string;
  invoice_submitted?: boolean;
  invoice_submitted_admin?: boolean;
  invoice_month?: string;
  status?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  price_description?: string;
  duration_months: number;
  team_count_limit: number;
  storage_limit_gb: number;
  docs_upload_limit: number;
  docs_download_limit: number;
  
  // Permissions
  can_add_user: boolean;
  can_view_user: boolean;
  can_edit_user: boolean;
  can_delete_user: boolean;
  can_add_document: boolean;
  can_view_document: boolean;
  can_edit_document: boolean;
  can_delete_document: boolean;
  can_share_document: boolean;
  can_search_document: boolean;
  
  // Additional permissions
  can_view_activity_logs: boolean;
  can_register_users: boolean;
  can_download_reports: boolean;
  can_generate_reports: boolean;
  can_view_reports: boolean;
  allow_multiple_uploads: boolean;
  document_search: boolean;
  
  // Pricing components
  document_download_price?: number;
  document_download_limit?: number;
  document_share_price?: number;
  document_share_limit?: number;
  document_upload_price?: number;
  document_upload_limit?: number;
  
  // File types
  allow_jpeg: boolean;
  allow_png: boolean;
  allow_pdf: boolean;
  allow_doc: boolean;
  allow_csv: boolean;
}

export interface Invoice {
  id: string;
  company_id: string;
  company_name?: string;
  email?: string;
  invoice_month?: string;
  owner_name?: string;
  amount: number;
  invoice_value?: number;
  status: 'Paid' | 'Pending' | 'Failed' | 'Upcoming';
  invoice_submitted?: boolean;
  invoice_submitted_admin?: boolean;
  due_date: string;
  paid_date?: string;
  documents_accessed: number;
  storage_assigned: number;
  created_at?: string;
  document_uploaded?: number;
  document_shared?: number;
  document_downloaded?: number;
  upload_amount?: number;
  shared_amount?: number;
  download_amount?: number;
  monthly?: number;
  other_invoices?: CustomInvoiceItem[];
  total?: number; // Added missing total field
  type?: string;  // Added for custom invoice type
  date?: string;  // For custom invoices
}

export interface CustomInvoiceItem {
  type: string;
  ammount: number;
}

export interface Company {
  id: string;
  name: string;
  contact_email?: string;
  password_hash?: string;
  plan_id?: string;
  status?: string;
  documents_viewed?: number;
  documents_downloaded?: number;
  documents_scanned?: number;
  documents_indexed?: number;
  documents_qa_passed?: number;
  invoice_value_total?: number;
  created_at?: string;
  admin_name?: string;
  document_shared?: number;
  document_downloaded?: number;
  document_uploaded?: number;
  total_documents_uploaded?: number;
  total_documents_published?: number;
  storage_assigned?: number;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    documents_reviewed: number;
    status: string;
  }>;
  plan?: {
    id: string;
    name: string;
    price_description: string;
    can_share_document: boolean;
    can_view_activity_logs: boolean;
    can_add_client: boolean;
    number_of_clients: number;
    upload_price_per_ten: number;
    share_price_per_thousand: number;
    download_price_per_thousand: number;
  };
  invoices?: Array<{
    id: string;
    invoice_month: string;
    invoice_value: number;
    monthly: number;
    invoice_submitted: boolean;
    paid_date?: string;
    created_at: string;
  }>;
}

export interface DocumentProperty {
  name: string;
  type: string;
  value: string;
}

export interface Document {
  id?: string;
  url: string;
  tag_id: string;
  tag_name: string;
  file_id: string;
  properties: DocumentProperty[];
  progress?: string;
  progress_number?: number;
  is_published?: boolean;
  indexer_passed_id?: string | null;
  qa_passed_id?: string | null;
  passed_to?: string | null;
  // Additional fields for UI display
  role?: string;
  date?: string;
  title?: string;
  added_by_user?: string;
}

export interface ClientPlan {
  id: string;
  name: string;
  can_view: boolean;
  can_download: boolean;
  can_share: boolean;
  monthly_bill: number;
  
  // Document Management - added fields
  can_view_activity_logs?: boolean;
  can_view_reports?: boolean;
  allow_multiple_uploads?: boolean;
  document_search?: boolean;
  
  // Document Pricing - added fields
  download_price_per_thousand?: number;
  share_price_per_thousand?: number;
  upload_price_per_ten?: number;
  
  // Plan Limits
  docs_upload_limit?: number;
  
  // Removed fields that we don't need anymore
  discount_percent?: number;
  subscription_begin?: number;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  docs_viewed: number;
  docs_downloaded: number;
  subscription_date: string;
  status: 'active' | 'canceled' | 'pending';
  plan_name: string;
  plan_id: string;
  company_id: string;
  created_at: string;
}
