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
