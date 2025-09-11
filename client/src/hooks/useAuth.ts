import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

export interface User {
  id: number;
  username: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Check for stored auth state first
  const getStoredAuth = () => {
    const authState = localStorage.getItem("eunoia-auth-state");
    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        // Check if token is not expired (24 hours)
        if (parsed.token && parsed.timestamp && (Date.now() - parsed.timestamp) < 24 * 60 * 60 * 1000) {
          return {
            id: parsed.userId,
            username: parsed.username,
            email: parsed.email
          };
        }
      } catch {
        // Invalid stored data
      }
    }
    return null;
  };

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/user/profile"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts
    initialData: getStoredAuth, // Use stored auth as initial data
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout");
      return response.json();
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      // Clear login state from localStorage
      localStorage.removeItem("eunoia-auth-state");
      // Immediately redirect to sign-in without reload
      window.location.href = "/";
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user: user as User | undefined,
    isLoading,
    isAuthenticated: !!user && !error,
    logout,
    isLoggingOut: logoutMutation.isPending,
    refetchUser: refetch,
  };
}