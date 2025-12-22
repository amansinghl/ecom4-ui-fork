import { apiClient, getAuthToken } from "@/lib/api-client";
import { UserType, BranchType } from "@/types/user";

type UserResponse = {
  user: UserType;
};

type CreditsResponse = {
  data: {
    creditDetails: {
      credit_balance: string;
      credit_limit: string;
    };
  };
};

export const getUser = () => apiClient<UserResponse>("user");

export const getCredits = () =>
  apiClient<CreditsResponse>("transactions/credit");

type BranchesApiResponse = {
  branches: BranchType[];
};

export const getBranches = () =>
  apiClient<BranchesApiResponse>("user/branches");

type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

type UpdatePasswordResponse = {
  message?: string;
  data?: {
    message?: string;
  };
};

export const updatePassword = async (data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
  // Use full URL since this endpoint is on accounts.vamaship.com
  // Default to localhost:8001 for development, or use environment variable
  let accountsBaseUrl = process.env.NEXT_PUBLIC_ACCOUNTS_API_BASE_URL || "http://localhost:8001";
  
  // Fix malformed URLs like "https://localhost://8001" -> "http://localhost:8001"
  if (accountsBaseUrl.includes("localhost")) {
    // Extract port if present (e.g., :8001)
    const portMatch = accountsBaseUrl.match(/:(\d+)/);
    const port = portMatch ? portMatch[1] : "8001";
    accountsBaseUrl = `http://localhost:${port}`;
  } else {
    // For non-localhost URLs, just clean up slashes
    accountsBaseUrl = accountsBaseUrl.replace(/\/\/+/g, "/").replace(/\/$/, "");
    // Ensure proper protocol format
    if (!accountsBaseUrl.match(/^https?:\/\//)) {
      accountsBaseUrl = `https://${accountsBaseUrl.replace(/^\/+/, "")}`;
    }
  }
  
  // Ensure base URL doesn't end with slash
  const baseUrl = accountsBaseUrl.replace(/\/$/, "");
  const endpoint = `${baseUrl}/api/v1/user/update-password`;
  
  const token = getAuthToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  
  // Ensure payload is correctly formatted - exactly as API expects
  const payload = {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  };
  
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    // Don't use credentials: "include" when server uses Access-Control-Allow-Origin: *
    // The Authorization header is sufficient for authentication
  });
  
  if (!res.ok) {
    // Parse error response
    const errorData = await res.json().catch(() => ({}));
    
    // For password update, don't redirect on 401 - it might just be wrong current password
    // Only show the error message from the API
    const errorMessage = 
      errorData.message || 
      errorData.error || 
      errorData.data?.message ||
      (res.status === 401 ? "Current password is incorrect" : `Failed to update password`);
    
    throw new Error(errorMessage);
  }
  
  return res.json();
};

type ChangeDefaultBranchRequest = {
  id: number;
};

type ChangeDefaultBranchResponse = {
  data: {
    status_code?: number;
    response?: boolean;
    message?: string;
    error?: string;
  };
  meta: {
    status_code: number;
    status: string;
    message: string;
  };
};

export const changeDefaultBranch = (branchId: number) =>
  apiClient<ChangeDefaultBranchResponse>("entity/change-default-branch", {
    method: "POST",
    body: { id: branchId },
  });

type AddBranchRequest = {
  branch_name: string;
  gst_number: string;
  is_default: boolean;
  from_client: boolean;
};

type AddBranchResponse = {
  data: {
    status_code?: number;
    response?: boolean;
    message?: string;
    error?: string;
  };
  meta: {
    status_code: number;
    status: string;
    message: string;
  };
};

export const addBranch = (data: AddBranchRequest) =>
  apiClient<AddBranchResponse>("entity/add-branch", {
    method: "POST",
    body: data,
  });

type AddBankRequest = {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  beneficiary_name: string;
};

type AddBankResponse = {
  data: {
    status_code?: number;
    response?: boolean;
    message?: string;
    error?: string;
    errors?: string;
  };
  meta: {
    status_code: number;
    status: string;
    message: string;
  };
};

export const addBank = (data: AddBankRequest) =>
  apiClient<AddBankResponse>("entity/add-bank", {
    method: "POST",
    body: data,
  });
