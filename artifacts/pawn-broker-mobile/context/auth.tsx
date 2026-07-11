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
import {
  authenticateWithBiometrics,
  getBiometricCapability,
  type BiometricCapability,
} from '@/hooks/useBiometrics';

const TOKEN_KEY = 'pawn_auth_token';
const BIOMETRIC_KEY = 'pawn_biometric_enabled';

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : '';

interface AuthContextType {
  user: AuthUser | null;
  isInitializing: boolean;
  /** Whether the device supports biometrics and the user has opted in */
  biometricEnabled: boolean;
  /** Capability info (type, label, icon) for the current device */
  biometric: BiometricCapability;
  /**
   * True when a stored token exists AND biometrics are enabled.
   * When true, the tabs layout shows a biometric lock screen.
   */
  canUseBiometricUnlock: boolean;
  /**
   * Whether biometrics have been successfully verified this session.
   * False on cold launch when canUseBiometricUnlock is true — the tabs
   * layout renders a lock screen until this becomes true.
   */
  biometricUnlocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Challenge biometrics; sets biometricUnlocked=true on success */
  loginWithBiometrics: () => Promise<boolean>;
  enableBiometrics: () => Promise<void>;
  disableBiometrics: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
  } catch { /* best-effort */ }
}

async function clearPushTokenFromServer(authToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/notifications/push-token`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` },
    });
  } catch { /* best-effort */ }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricUnlocked, setBiometricUnlocked] = useState(false);
  const [biometric, setBiometric] = useState<BiometricCapability>({
    available: false,
    type: null,
    label: 'Biometrics',
    icon: 'finger-print-outline',
  });

  const tokenRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
  }, []);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Load token + biometric prefs + device capability in one shot
  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(BIOMETRIC_KEY),
      getBiometricCapability(),
    ])
      .then(([storedToken, storedBioFlag, capability]) => {
        if (storedToken) {
          tokenRef.current = storedToken;
          setToken(storedToken);
        }
        setBiometric(capability);
        const bioOn = capability.available && storedBioFlag === 'true';
        setBiometricEnabled(bioOn);
        // No stored token → nothing to gate, consider already "unlocked"
        if (!storedToken || !bioOn) {
          setBiometricUnlocked(true);
        }
        // storedToken + bioOn → biometricUnlocked stays false; gate is active
      })
      .catch(() => {
        setBiometricUnlocked(true); // safe fallback
      })
      .finally(() => setIsStorageLoaded(true));
  }, []);

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

  // Invalid token → clear everything including biometric gate
  useEffect(() => {
    if (isStorageLoaded && token && isMeError) {
      SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
      SecureStore.deleteItemAsync(BIOMETRIC_KEY).catch(() => {});
      tokenRef.current = null;
      setToken(null);
      setBiometricEnabled(false);
      setBiometricUnlocked(true); // no gate without a token
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
        setBiometricUnlocked(true); // password login counts as unlocked
        await queryClient.invalidateQueries();

        registerForPushNotificationsAsync().then((pushToken) => {
          if (pushToken) sendPushTokenToServer(pushToken, result.token!);
        });
      }
    },
    [loginMutation, queryClient],
  );

  const loginWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (!biometricEnabled || !tokenRef.current) return false;
    const success = await authenticateWithBiometrics(
      `Sign in with ${biometric.label}`
    );
    if (success) {
      setBiometricUnlocked(true);
    }
    return success;
  }, [biometricEnabled, biometric.label]);

  const enableBiometrics = useCallback(async () => {
    if (!biometric.available) return;
    const confirmed = await authenticateWithBiometrics(
      `Confirm with ${biometric.label} to enable quick sign-in`
    );
    if (confirmed) {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, 'true');
      setBiometricEnabled(true);
      // Already in an authenticated session — stays unlocked
    }
  }, [biometric]);

  const disableBiometrics = useCallback(async () => {
    await SecureStore.deleteItemAsync(BIOMETRIC_KEY);
    setBiometricEnabled(false);
  }, []);

  const logout = useCallback(async () => {
    if (tokenRef.current) await clearPushTokenFromServer(tokenRef.current);
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    tokenRef.current = null;
    setToken(null);
    setBiometricUnlocked(false); // reset gate for next session
    queryClient.clear();
    router.replace('/login');
  }, [queryClient]);

  const isInitializing =
    !isStorageLoaded || (isStorageLoaded && !!token && isMeLoading);

  const canUseBiometricUnlock = biometricEnabled && !!token;

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isInitializing,
        biometricEnabled,
        biometric,
        canUseBiometricUnlock,
        biometricUnlocked,
        login,
        loginWithBiometrics,
        enableBiometrics,
        disableBiometrics,
        logout,
      }}
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
