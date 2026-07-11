import React, { useEffect, useRef } from 'react';
import { QueryClient } from '@tanstack/react-query';
import {
  PersistQueryClientProvider,
  removeOldestQuery,
} from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NetworkBanner } from '@/components/NetworkBanner';
import { PendingSyncBanner } from '@/components/PendingSyncBanner';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import {
  setBaseUrl,
  getCreateLoanMutationOptions,
  getCreateCustomerMutationOptions,
  getRecordPaymentMutationOptions,
  getCloseLoanMutationOptions,
  getRenewLoanMutationOptions,
} from '@workspace/api-client-react';
import { AuthProvider } from '@/context/auth';
import { Platform } from 'react-native';
import { configureOnlineManager } from '@/lib/onlineManager';

// Set the API base URL at module level — must be called outside any component
// so it runs exactly once before any queries fire.
if (process.env.EXPO_PUBLIC_DOMAIN) {
  setBaseUrl(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

// Wire React Query's online state to the device's real network connectivity.
// Must happen before any queries are created.
configureOnlineManager();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // gcTime must be >= the persister's maxAge so cached data survives
      // between app launches.
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 2,
      // Keep showing cached data while a refetch is in flight.
      placeholderData: (prev: unknown) => prev,
      // When offline, return cached data immediately and pause the network
      // request until connectivity returns.
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry failed mutations automatically when the device comes back online.
      networkMode: 'offlineFirst',
      retry: 3,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
    },
  },
});

// Register mutation defaults so that persisted (paused) mutations can be
// replayed after an app restart. TanStack Query serialises the mutation key
// and variables to AsyncStorage, but the mutationFn itself cannot be
// serialised — so it must be re-registered here at startup. Each call to
// setMutationDefaults matches by key and injects the correct function when
// the mutation is rehydrated.
queryClient.setMutationDefaults(
  ['createLoan'],
  getCreateLoanMutationOptions(),
);
queryClient.setMutationDefaults(
  ['createCustomer'],
  getCreateCustomerMutationOptions(),
);
queryClient.setMutationDefaults(
  ['recordPayment'],
  getRecordPaymentMutationOptions(),
);
queryClient.setMutationDefaults(
  ['closeLoan'],
  getCloseLoanMutationOptions(),
);
queryClient.setMutationDefaults(
  ['renewLoan'],
  getRenewLoanMutationOptions(),
);

// Persist the query cache to AsyncStorage so data survives app restarts.
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'PAWN_BROKER_QUERY_CACHE',
  // If the serialized cache is too large, drop the oldest queries.
  retry: removeOldestQuery,
});

function RootLayoutNav() {
  const notificationResponseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // Only set up notification listeners on native platforms
    if (Platform.OS === 'web') return;

    // Handle taps on notifications — navigate to the relevant loan detail screen
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          loanId?: number;
          screen?: string;
        } | undefined;

        if (data?.loanId && data.screen === 'loan-detail') {
          router.push(`/loan/${data.loanId}`);
        }
      });

    return () => {
      notificationResponseListener.current?.remove();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E3A5F' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontFamily: 'Inter_600SemiBold' },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="loan/[id]" options={{ title: 'Loan Details' }} />
      <Stack.Screen name="loan/new" options={{ title: 'New Loan' }} />
      <Stack.Screen name="customer/[id]" options={{ title: 'Customer' }} />
      <Stack.Screen name="customer/new" options={{ title: 'New Customer' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            // Cache survives for 24 hours between launches.
            maxAge: 1000 * 60 * 60 * 24,
            // Bust the persisted cache if queries change shape.
            buster: 'v1',
            // Also serialise any mutations that were paused mid-flight so they
            // survive an app restart. Only paused mutations are included —
            // idle/success/error ones have already resolved and don't need
            // to be replayed.
            dehydrateOptions: {
              shouldDehydrateMutation: (mutation) =>
                mutation.state.isPaused === true,
            },
          }}
          onSuccess={() => {
            // After the persisted cache is restored on launch, replay any
            // mutations that were paused (e.g. created while offline). If the
            // device is still offline they will stay paused; when connectivity
            // returns the onlineManager listener in onlineManager.ts
            // automatically triggers another resumePausedMutations call.
            queryClient.resumePausedMutations();
          }}
        >
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <RootLayoutNav />
                <NetworkBanner />
                <PendingSyncBanner />
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </PersistQueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
