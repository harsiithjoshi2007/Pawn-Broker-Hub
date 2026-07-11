import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useMutationState } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Displays a banner below the offline banner when there are writes queued for
 * sync (mutations that were created while offline and are waiting to be sent
 * to the server). The count survives app restarts because paused mutations are
 * persisted to AsyncStorage via PersistQueryClientProvider.
 */
export function PendingSyncBanner() {
  const { top } = useSafeAreaInsets();

  // Collect the isPaused flag for every active mutation. useMutationState
  // re-renders whenever any mutation changes state, so the count stays live.
  const pausedFlags = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.isPaused,
  });

  const pendingCount = pausedFlags.filter(Boolean).length;
  const isVisible = pendingCount > 0;

  // Slide the banner down from above (starts hidden just like NetworkBanner).
  // We sit 44 px below the top so the two banners don't overlap.
  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 44 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, translateY]);

  return (
    <Animated.View
      style={[
        styles.banner,
        { paddingTop: top + 6, transform: [{ translateY }] },
      ]}
      pointerEvents="none"
    >
      <View style={styles.inner}>
        <Text style={styles.dot}>⟳</Text>
        <Text style={styles.text}>
          {pendingCount === 1
            ? '1 change pending sync'
            : `${pendingCount} changes pending sync`}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9998, // just below the offline banner (9999)
    backgroundColor: '#1D4ED8', // blue-700
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    color: '#93C5FD',
    fontSize: 13,
  },
  text: {
    color: '#EFF6FF',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
});
