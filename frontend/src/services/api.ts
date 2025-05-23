import { toast } from 'sonner';
import axios from 'axios';
import { Invoice, ClientOverviewMetrics, CustomInvoiceItem, Plan, Company } from '@/types';

const API_BASE_URL = 'https://digital-archive-beta.vercel.app';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Helper function to get a cookie by name
const getCookie = (name: string) => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
};

// Helper function to handle API requests with better error handling
async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    console.log(`Fetching from ${url}...`);
    
    // Get JWT token from cookie
    const token = getCookie('jwt_token');
    
    // Add authorization header if token exists
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options?.headers,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // If unauthorized, redirect to login page
    if (response.status === 401) {
      toast.error('Session expired. Please login again.');
      window.location.href = '/login'; // Hard redirect to login
      return { error: 'Unauthorized' };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Try to parse error response as JSON first
      try {
        const errorJson = JSON.parse(errorText);
        // For delete operations that return structured error data, throw the parsed object
        if ((response.status === 400 || response.status === 409) && (errorJson.companies || errorJson.clients)) {
          throw errorJson;
        }
      } catch (parseError) {
        // If not JSON or no structured data, fall back to original error handling
      }
      
      throw new Error(`Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    }
    
    // Handle 204 No Content responses (specifically for DELETE operations)
    if (response.status === 204) {
      return { data: {} as T }; // Return empty object for 204 responses
    }
    
    const data = await response.json();
    console.log("API Response data:", data);
    return { data };
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    
    // If it's a structured error object (companies/clients), re-throw it
    if (typeof error === 'object' && error !== null && (error.companies || error.clients)) {
      throw error;
    }
    
    // For other API errors, don't show a toast here - let the caller handle it
    // We'll log but not toast, so the toast only happens once in the mutation error handler
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Plans Management
export async function fetchPlans(): Promise<ApiResponse<Plan[]>> {
  return apiRequest<Plan[]>(`${API_BASE_URL}/plans`);
}

export async function fetchPlan(id: string): Promise<ApiResponse<Plan>> {
  return apiRequest<Plan>(`${API_BASE_URL}/plans/${id}`);
}

export async function createPlan(planData: Partial<Plan>): Promise<ApiResponse<Plan>> {
  return apiRequest<Plan>(`${API_BASE_URL}/plans`, {
    method: 'POST',
    body: JSON.stringify(planData),
  });
}

export async function updatePlan(id: string, planData: Partial<Plan>): Promise<ApiResponse<Plan>> {
  return apiRequest<Plan>(`${API_BASE_URL}/plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(planData),
  });
}

export async function deletePlan(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await apiRequest<any>(`${API_BASE_URL}/plans/${id}`, {
      method: 'DELETE',
    });
    
    // If there's an error, make sure to throw it so onError catches it
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response;
  } catch (error) {
    // Re-throw to be caught by useMutation's onError
    throw error;
  }
}

// Companies Management
export async function fetchCompanies(): Promise<ApiResponse<Company[]>> {
  return apiRequest<Company[]>(`${API_BASE_URL}/companies`);
}

export async function fetchCompany(id: string): Promise<ApiResponse<Company>> {
  return apiRequest<Company>(`${API_BASE_URL}/companies/${id}`);
}

export async function createCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
  return apiRequest<Company>(`${API_BASE_URL}/companies`, {
    method: 'POST',
    body: JSON.stringify(companyData),
  });
}

export async function updateCompany(id: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
  return apiRequest<Company>(`${API_BASE_URL}/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(companyData),
  });
}

export async function updateCompanyStatus(id: string, status: string): Promise<ApiResponse<Company>> {
  return updateCompany(id, { status });
}

// New function to fetch plan information
export const fetchPlanInformation = async () => {
  try {
    const token = document.cookie?.split('jwt_token=')[1]?.split(';')[0] || '';
    const response = await fetch(`${API_BASE_URL}/get-plan-information`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan information');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching plan information:', error);
    throw error;
  }
};

// New function to verify shared document password
export async function verifySharedDocument(id: string, password: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/get-shared-document`, {
    method: 'POST',
    body: JSON.stringify({
      document_id: id,
      document_password: password
    }),
  });
}

// New function to fetch document tags
export async function fetchDocumentTags(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/document-tags`);
}

// Invoice Management API functions
export async function generateInvoices(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/generate-invoices`, {
    method: 'POST',
  });
}

export async function fetchInvoices(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/invoices`);
}

export async function submitInvoice(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/invoices/${id}/submit`, {
    method: 'PUT',
  });
}

export async function updateInvoiceCustomItems(id: string, customItems: CustomInvoiceItem[]): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/invoices/${id}/other-invoices`, {
    method: 'PUT',
    body: JSON.stringify({
      other_invoices: customItems
    }),
  });
}

export async function updateClientInvoiceCustomItems(id: string, customItems: CustomInvoiceItem[]): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/client-invoices/${id}/other-invoices`, {
    method: 'PUT',
    body: JSON.stringify({
      other_invoices: customItems
    }),
  });
}

export async function generateInvoice(invoiceData: any): Promise<ApiResponse<any>> {
  try {
    // This would be a real endpoint in a production environment
    return apiRequest<any>(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    toast.error('Failed to generate invoice');
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendInvoice(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/send-invoice/${id}`, {
    method: 'POST',
  });
}

// Check if send invoice button should be shown
export async function checkInvoiceSubmission(): Promise<ApiResponse<{ showSendInvoice: boolean }>> {
  return apiRequest<{ showSendInvoice: boolean }>(`${API_BASE_URL}/check-invoice-submission`);
}

// Submit all companies invoices
export async function submitAllCompaniesInvoices(): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/submit-all-companies`, {
    method: 'POST',
  });
}

// User Management API Functions
export async function fetchUsers(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/users`);
}

export async function fetchCurrentUsers(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/current-users`);
}

export async function createUser(userData: {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  allow_to_publish?: boolean;
  create_dispute?: boolean;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function updateUser(id: string, userData: {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

export async function updateUserStatus(id: string, status: string): Promise<ApiResponse<any>> {
  return updateUser(id, { status });
}

export async function deleteUser(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });
}

// Document API Functions
export async function createDocument(documentData: {
  url: string;
  tag_id: string;
  tag_name: string;
  file_id: string;
  title?: string;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/documents`, {
    method: 'POST',
    body: JSON.stringify(documentData),
  });
}

export async function fetchDocuments(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/documents`);
}

export async function fetchDocument(id: string): Promise<ApiResponse<any>> {
  console.log(`Fetching document with ID: ${id}`);
  return apiRequest<any>(`${API_BASE_URL}/documents/${id}`);
}

export async function updateDocumentProperties(id: string, properties: any[]): Promise<ApiResponse<any>> {
  console.log(`Updating document properties for ID: ${id}`, properties);
  return apiRequest<any>(`${API_BASE_URL}/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ properties }),
  });
}

// This function is no longer used as we're making direct OpenAI requests
export async function extractDocumentData(fileId: string, propertyNames: string[]): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/documents/extract`, {
    method: 'POST',
    body: JSON.stringify({ file_id: fileId, properties: propertyNames }),
  });
}

// New functions for document assignment
export async function fetchAssignees(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/get-assignee`);
}

export async function assignDocument(documentId: string, assigneeId: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/post-assignee`, {
    method: 'POST',
    body: JSON.stringify({
      document_id: documentId,
      assignee_id: assigneeId
    }),
  });
}

// Client Management API Functions
export async function fetchClientPlans(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/client-plans`);
}

export async function fetchClientPlan(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/client-plans/${id}`);
}

export async function fetchClientData(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/client/${id}`);
}

export async function createClientPlan(planData: {
  name: string;
  can_view: boolean;
  can_download: boolean;
  can_share: boolean;
  monthly_bill: number;
  discount_percent: number;
  subscription_begin: number;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/client-plans`, {
    method: 'POST',
    body: JSON.stringify(planData),
  });
}

export async function updateClientPlan(id: string, planData: {
  name?: string;
  can_view?: boolean;
  can_download?: boolean;
  can_share?: boolean;
  monthly_bill?: number;
  discount_percent?: number;
  subscription_begin?: number;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/client-plans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(planData),
  });
}

export async function deleteClientPlan(id: string): Promise<ApiResponse<any>> {
  try {
    const response = await apiRequest<any>(`${API_BASE_URL}/client-plans/${id}`, {
      method: 'DELETE',
    });
    
    // If there's an error, make sure to throw it so onError catches it
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response;
  } catch (error) {
    // Re-throw to be caught by useMutation's onError
    throw error;
  }
}

export async function fetchClients(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/clients`);
}

export async function fetchClient(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/clients/${id}`);
}

export async function createClient(clientData: {
  name: string;
  email: string;
  password: string;
  status: string;
  plan_id: string;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/clients`, {
    method: 'POST',
    body: JSON.stringify(clientData),
  });
}

export async function updateClient(id: string, clientData: {
  name?: string;
  status?: string;
  plan_id?: string;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(clientData),
  });
}

export async function deleteClient(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/clients/${id}`, {
    method: 'DELETE',
  });
}

// Profile Management API Functions
export async function fetchUserProfile(): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/get-profile`);
}

export async function updateUserProfile(profileData: {
  name?: string;
  password?: string;
  phone?: string;
  profile_picture?: string;
}): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/get-profile`, {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// New function to fetch document progress data with time range option
export async function fetchDocumentProgress(timeRangeType?: 'week' | '15days' | 'month'): Promise<ApiResponse<any>> {
  const queryParams = timeRangeType ? `?type=${timeRangeType}` : '';
  return apiRequest<any>(`${API_BASE_URL}/document-progress${queryParams}`);
}

export async function addDocumentComment(id: string, comment: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/documents/${id}/add-comment`, {
    method: 'PUT',
    body: JSON.stringify({ comment }),
  });
}

export async function fetchClientOverviewMetrics(): Promise<ApiResponse<ClientOverviewMetrics>> {
  return apiRequest<ClientOverviewMetrics>(`${API_BASE_URL}/client-overview-metrics`);
}

export const fetchStats = async () => {
  try {
    console.log(`Fetching stats from ${API_BASE_URL}/stats...`);
    const { data, error } = await apiRequest<any>(`${API_BASE_URL}/stats`);
    
    if (error) {
      console.error('Error fetching stats:', error);
      return {
        totalInvoiceAmount: 0,
        totalDocumentsUploaded: 0,
        totalDocumentsPublished: 0
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalInvoiceAmount: 0,
      totalDocumentsUploaded: 0,
      totalDocumentsPublished: 0
    };
  }
};

export async function fetchClientInvoices(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/client-invoices`);
}

export async function generateClientInvoices(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/generate-client-invoices`, {
    method: 'POST',
  });
}

export async function sendUnpaidInvoiceReminders(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/remind-unpaid-client-invoices`, {
    method: 'POST',
  });
}

export async function sendInvoiceReminders(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/remind-invoices`, {
    method: 'POST',
  });
}

// New function to fetch company report with time range parameter
export async function fetchCompanyReport(timeRangeType?: 'week' | '15days' | 'month'): Promise<ApiResponse<any>> {
  const queryParams = timeRangeType ? `?type=${timeRangeType}` : '';
  return apiRequest<any>(`${API_BASE_URL}/invoice-preview${queryParams}`);
}

// New functions for custom invoices
export async function fetchCustomInvoices(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>(`${API_BASE_URL}/custom-invoices`);
}

export async function fetchCustomInvoice(id: string): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/custom-invoice/${id}`);
}

export async function createCustomInvoice(invoiceData: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/custom-invoice`, {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
}

export async function updateCustomInvoice(id: string, invoiceData: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/custom-invoice/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoiceData),
  });
}

// Client custom invoices API functions
export async function createClientCustomInvoice(invoiceData: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/client-custom-invoice`, {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  });
}

export async function updateClientCustomInvoice(id: string, invoiceData: any): Promise<ApiResponse<any>> {
  return apiRequest<any>(`${API_BASE_URL}/client-custom-invoice/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoiceData),
  });
}
