import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetMe,
  useLogin,
  setAuthTokenGetter,
} from '@workspace/api-client-react';
import type { AuthUser } from '@workspace/api-client-react';
import { router } from 'expo-router';
import { registerForPushNotificationsAsync } from '@/hooks/usePushNotifications';

const TOKEN_KEY = 'pawn_auth_token';
const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : '';

interface AuthContextType {
  user: AuthUser | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/** Fire-and-forget: register an Expo push token with the API. */
async function sendPushTokenToServer(token: string, authToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/notifications/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ pushToken: token }),
    });
  } catch {
    // Best-effort — don't block login if this fails
  }
}

/** Fire-and-forget: clear push token from the API on logout. */
async function clearPushTokenFromServer(authToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/notifications/push-token`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch {
    // Best-effort
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  // ref always holds the latest token — used by the bearer getter
  const tokenRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  // Register the token getter once. It reads from the ref so it always
  // returns the latest value without needing to re-register.
  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Load persisted token from secure storage on startup
  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY)
      .then((stored) => {
        if (stored) {
          tokenRef.current = stored;
          setToken(stored);
        }
      })
      .catch(() => {})
      .finally(() => setIsStorageLoaded(true));
  }, []);

  // Verify the token with the server and hydrate the user
  const {
    data: user,
    isLoading: isMeLoading,
    isError: isMeError,
  } = useGetMe({
    query: {
      queryKey: ['getMe'],
      enabled: isStorageLoaded && !!token,
      retry: false,
    },
  });

  // If the stored token is invalid (401), clear it
  useEffect(() => {
    if (isStorageLoaded && token && isMeError) {
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      tokenRef.current = null;
      setToken(null);
    }
  }, [isMeError, isStorageLoaded, token]);

  const loginMutation = useLogin();

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await loginMutation.mutateAsync({
        data: { email, password },
      });
      if (result.token) {
        await SecureStore.setItemAsync(TOKEN_KEY, result.token);
        tokenRef.current = result.token;
        setToken(result.token);
        // Invalidate so useGetMe refetches with the new token
        await queryClient.invalidateQueries();

        // Register push token in the background (native only)
        registerForPushNotificationsAsync().then((pushToken) => {
          if (pushToken) {
            sendPushTokenToServer(pushToken, result.token!);
          }
        });
      }
    },
    [loginMutation, queryClient],
  );

  const logout = useCallback(async () => {
    // Clear push token from the server before wiping the local token
    if (tokenRef.current) {
      await clearPushTokenFromServer(tokenRef.current);
    }
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    tokenRef.current = null;
    setToken(null);
    queryClient.clear();
    router.replace('/login');
  }, [queryClient]);

  // initializing = storage not loaded yet, or token exists but getMe still loading
  const isInitializing =
    !isStorageLoaded || (isStorageLoaded && !!token && isMeLoading);

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, isInitializing, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
