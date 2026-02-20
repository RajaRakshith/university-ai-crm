import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "student" | "organizer";
}

export interface AuthProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface AuthData {
  user: AuthUser;
  profile: AuthProfile | null;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<AuthData | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (res.status === 401) {
        return null;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch auth data");
      }

      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      queryClient.setQueryData(["/api/auth/me"], null);
      setLocation("/splash");
    }
  };

  return {
    user: data?.user || null,
    profile: data?.profile || null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
    logout,
  };
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/splash");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function RoleRoute({
  role,
  children,
}: {
  role: "student" | "organizer";
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== role)) {
      setLocation("/splash");
    }
  }, [isAuthenticated, isLoading, user, role, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== role) {
    return null;
  }

  return <>{children}</>;
}

export function redirectIfAuthenticated() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "student") {
        setLocation("/student");
      } else {
        setLocation("/");
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation]);
}
