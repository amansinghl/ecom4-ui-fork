"use client";

import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUser, getCredits } from "@/api/user";

export function useUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5, // 5 min
    retry: false,
  });

  const user = query.data?.user ?? null;

  const refreshCredits = useCallback(async () => {
    if (!user) return;

    try {
      const response = await getCredits();
      queryClient.setQueryData(["user"], (oldData: typeof query.data) => {
        if (!oldData?.data?.user) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            user: {
              ...oldData.data.user,
              entity: {
                ...oldData.data.user.entity,
                credit_balance:
                  response?.data?.creditDetails?.credit_balance ??
                  oldData.data.user.entity.credit_balance,
                credit_limit:
                  response?.data?.creditDetails?.credit_limit ??
                  oldData.data.user.entity.credit_limit,
              },
            },
          },
        };
      });
    } catch (error) {
      console.error("Failed to refresh credits", error);
    }
  }, [user, queryClient]);

  return {
    user,
    isLoading: query.isLoading,
    error: query.error,
    refreshCredits,
  };
}
