/**
 * useBiometrics
 *
 * Thin wrapper around expo-local-authentication.
 * Safe to call on all platforms — returns { available: false } on web
 * or when no hardware / enrolment is present.
 */

import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricCapability {
  available: boolean;
  /** 'faceid' | 'fingerprint' | 'iris' | null */
  type: 'faceid' | 'fingerprint' | 'iris' | null;
  /** Human-readable label, e.g. "Face ID" or "Fingerprint" */
  label: string;
  /** SF Symbol / Ionicon name for a matching icon */
  icon: 'scan-outline' | 'finger-print-outline';
}

/**
 * Resolves the biometric capability of the current device.
 * Resolves instantly (async but not blocking).
 */
export async function getBiometricCapability(): Promise<BiometricCapability> {
  if (Platform.OS === 'web') {
    return { available: false, type: null, label: 'Biometrics', icon: 'finger-print-outline' };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      return { available: false, type: null, label: 'Biometrics', icon: 'finger-print-outline' };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    const hasFace = types.includes(
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
    );
    const hasIris = types.includes(
      LocalAuthentication.AuthenticationType.IRIS
    );

    if (hasFace) {
      return { available: true, type: 'faceid', label: 'Face ID', icon: 'scan-outline' };
    }
    if (hasIris) {
      return { available: true, type: 'iris', label: 'Iris', icon: 'scan-outline' };
    }
    return { available: true, type: 'fingerprint', label: 'Fingerprint', icon: 'finger-print-outline' };
  } catch {
    return { available: false, type: null, label: 'Biometrics', icon: 'finger-print-outline' };
  }
}

/**
 * Prompts the user with a biometric challenge.
 * Returns true on success, false on failure / cancellation.
 */
export async function authenticateWithBiometrics(prompt: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      fallbackLabel: 'Use password',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
