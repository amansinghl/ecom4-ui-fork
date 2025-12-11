import { apiClient } from "@/lib/api-client";
import { UserType } from "@/types/user";

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

export type BranchType = {
  id: number;
  entity_id: number;
  registered: number;
  phone_verified: number;
  gst_number: string;
  is_default: number;
  pincode: string;
  state_name: string;
  state_code: string;
  state_id: number | null;
  branch: string;
  unit_type: string;
  address1: string | null;
  address2: string | null;
  city: string;
  city_id: number | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  deactivated_at: string | null;
};

type BranchesApiResponse = {
  branches: BranchType[];
};

export const getBranches = () =>
  apiClient<BranchesApiResponse>("user/branches");
