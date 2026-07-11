import { createContext, useContext, ReactNode } from "react";
import { useGetMe, useLogin, useLogout, getGetMeQueryKey, AuthUser, LoginCredentials } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: ReturnType<typeof useLogin>["mutateAsync"];
  logout: ReturnType<typeof useLogout>["mutateAsync"];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetMe({
    query: {
      retry: false,
    }
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (credentials: LoginCredentials) => {
    const res = await loginMutation.mutateAsync({ data: credentials });
    queryClient.setQueryData(getGetMeQueryKey(), res);
    return res;
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(getGetMeQueryKey(), null);
    setLocation("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
