import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

export interface User {
  id: number;
  username: string;
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch when component mounts
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

  // Save authentication state to localStorage when user data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("eunoia-auth-state", JSON.stringify({
        isLoggedIn: true,
        userId: user.id,
        username: user.username,
        timestamp: Date.now()
      }));
    } else if (!isLoading) {
      // Only clear if we're not loading (to avoid clearing during initial load)
      localStorage.removeItem("eunoia-auth-state");
    }
  }, [user, isLoading]);

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