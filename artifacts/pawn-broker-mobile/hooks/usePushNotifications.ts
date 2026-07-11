/**
 * usePushNotifications
 *
 * Requests notification permissions and returns the Expo push token.
 * Returns null on web or when permissions are denied.
 * Safe to call unconditionally — platform-guards are internal.
 */

import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  // Push tokens are only available on physical devices via Expo Go / builds
  if (Platform.OS === "web") return null;

  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    // Silently fail — push notifications are best-effort
    return null;
  }
}

/**
 * Hook: resolves the push token once and returns it.
 */
export function usePushToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotificationsAsync().then(setToken);
  }, []);

  return token;
}
