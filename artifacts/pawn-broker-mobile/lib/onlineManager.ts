import { onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

/**
 * Wire React Query's onlineManager to the device's real network state so that:
 * - Queries pause automatically when the device goes offline
 * - Paused mutations resume automatically when connectivity returns
 *
 * Call this once at app startup (before any queries fire).
 */
export function configureOnlineManager() {
  onlineManager.setEventListener((setOnline) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // isConnected can be null while the initial check is in flight.
      // Treat null as online so we don't block the first load unnecessarily.
      setOnline(state.isConnected !== false);
    });
    return unsubscribe;
  });
}
