/**
 * BiometricLockScreen
 *
 * Shown by the tabs layout when canUseBiometricUnlock is true but
 * biometricUnlocked is false (i.e. a stored token exists but the user
 * hasn't verified their identity this session yet).
 *
 * Automatically triggers the biometric prompt on mount. Falls back to
 * a "Use password" option that forces a full logout → login screen.
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/auth';

export function BiometricLockScreen() {
  const { biometric, loginWithBiometrics, logout } = useAuth();
  const [isPrompting, setIsPrompting] = useState(true);
  const [failed, setFailed] = useState(false);

  const prompt = useCallback(async () => {
    setIsPrompting(true);
    setFailed(false);
    const success = await loginWithBiometrics();
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // biometricUnlocked is now true in context; tabs layout re-renders automatically
    } else {
      setFailed(true);
      setIsPrompting(false);
    }
  }, [loginWithBiometrics]);

  // Auto-trigger on mount
  useEffect(() => {
    prompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUsePassword = () => {
    Alert.alert(
      'Sign in with password',
      'This will sign you out and take you to the login screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconRing}>
        <Ionicons name={biometric.icon} size={44} color="#D4A017" />
      </View>

      <Text style={styles.title}>GoldVault is locked</Text>
      <Text style={styles.sub}>
        {isPrompting && !failed
          ? `Waiting for ${biometric.label}…`
          : `Verify with ${biometric.label} to continue`}
      </Text>

      {isPrompting && !failed ? (
        <ActivityIndicator color="#D4A017" style={{ marginTop: 28 }} />
      ) : (
        <TouchableOpacity style={styles.btn} onPress={prompt} activeOpacity={0.8}>
          <Ionicons name={biometric.icon} size={18} color="#FFFFFF" />
          <Text style={styles.btnText}>Try again</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.fallback} onPress={handleUsePassword}>
        <Text style={styles.fallbackText}>Use password instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: 'rgba(212,160,23,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(212,160,23,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  btn: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D4A017',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  fallback: { marginTop: 20 },
  fallbackText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
});
