"use client";

import { useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, getCredits } from "@/api/user";
import { getAuthToken } from "@/lib/auth";
import useUserStore from "@/store/user";

export function useUser() {
  const queryClient = useQueryClient();
  const { user, token, login, logout } = useUserStore();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5, // 5 min
    retry: false,
  });

  // Sync to Zustand store
  useEffect(() => {
    if (query.data?.data?.user) {
      const authToken = getAuthToken();
      if (authToken) {
        login(query.data.data.user, authToken);
      }
    }
    if (query.error) {
      logout();
    }
  }, [query.data, query.error, login, logout]);

  const refreshCredits = useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await getCredits();
      const updatedUser = {
        ...user,
        entity: {
          ...user.entity,
          credit_balance:
            response?.data?.creditDetails?.credit_balance ??
            user.entity.credit_balance,
          credit_limit:
            response?.data?.creditDetails?.credit_limit ??
            user.entity.credit_limit,
        },
      };
      login(updatedUser, token);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (error) {
      console.error("Failed to refresh credits", error);
    }
  }, [user, token, login, queryClient]);

  return { ...query, refreshCredits };
}
