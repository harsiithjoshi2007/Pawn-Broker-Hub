import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Displays a banner at the top of the screen when the device has no internet
 * connection. Animates in/out smoothly so it doesn't feel jarring.
 */
export function NetworkBanner() {
  const netInfo = useNetInfo();
  const { top } = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-60)).current;

  // isConnected is null while the initial check is in progress — treat null as
  // connected so we don't flash the banner on cold launch.
  const isOffline = netInfo.isConnected === false;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOffline ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, translateY]);

  return (
    <Animated.View
      style={[styles.banner, { paddingTop: top + 6, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <View style={styles.inner}>
        <Text style={styles.dot}>●</Text>
        <Text style={styles.text}>No connection — showing saved data</Text>
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
    zIndex: 9999,
    backgroundColor: '#B45309', // amber-700
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    color: '#FCD34D',
    fontSize: 10,
  },
  text: {
    color: '#FFFBEB',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
});
