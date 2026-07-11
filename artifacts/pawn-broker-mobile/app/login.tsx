import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput as RNTextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const passwordRef = useRef<RNTextInput>(null);

  const isWeb = Platform.OS === 'web';

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: isWeb ? 80 : insets.top + 60,
              paddingBottom: isWeb ? 40 : insets.bottom + 40,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brand}>
            <View style={styles.iconBadge}>
              <Ionicons name="diamond" size={34} color="#D4A017" />
            </View>
            <Text style={styles.brandTitle}>GoldVault</Text>
            <Text style={styles.brandSub}>Pawn Broker Management</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSub}>Access your management dashboard</Text>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#6B7A8D" />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="admin@pawnbroker.in"
                  placeholderTextColor="#9BAAB7"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color="#6B7A8D" />
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9BAAB7"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#6B7A8D"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btn, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Pawn Broker Management System v1.0</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A5F' },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  brand: { alignItems: 'center', marginBottom: 36 },
  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: 'rgba(212,160,23,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(212,160,23,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#1E2B3C',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#6B7A8D',
    marginBottom: 24,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E2B3C',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4DCE9',
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: '#1E2B3C',
  },
  btn: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.65 },
  btnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  footer: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 32,
  },
});
