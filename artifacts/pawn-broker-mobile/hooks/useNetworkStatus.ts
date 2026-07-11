import { useNetInfo } from '@react-native-community/netinfo';

/**
 * Returns the device's current network status.
 *
 * `isOffline` is false while the initial check is in progress (null)
 * so we don't flash offline UI on cold launch.
 */
export function useNetworkStatus() {
  const { isConnected } = useNetInfo();
  return { isOffline: isConnected === false };
}
