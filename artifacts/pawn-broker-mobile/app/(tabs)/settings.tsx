import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/auth';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  staff: 'Staff',
};

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
      {title}
    </Text>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  destructive,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !rightElement}
    >
      <View style={[styles.rowIcon, { backgroundColor: destructive ? colors.destructive + '1A' : colors.primary + '1A' }]}>
        <Ionicons
          name={icon as any}
          size={18}
          color={destructive ? colors.destructive : colors.primary}
        />
      </View>
      <Text style={[styles.rowLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      {value && (
        <Text style={[styles.rowValue, { color: colors.mutedForeground }]} numberOfLines={1}>
          {value}
        </Text>
      )}
      {rightElement}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const {
    user,
    biometric,
    biometricEnabled,
    enableBiometrics,
    disableBiometrics,
    logout,
  } = useAuth();

  const [togglingBio, setTogglingBio] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleBiometricToggle = async (value: boolean) => {
    if (togglingBio) return;
    setTogglingBio(true);
    try {
      if (value) {
        // enableBiometrics challenges the sensor internally
        await enableBiometrics();
        if (!biometricEnabled) {
          // User cancelled or sensor failed — give feedback
          Alert.alert(
            `${biometric.label} not enabled`,
            `We couldn't verify your ${biometric.label}. Please try again.`
          );
        }
      } else {
        Alert.alert(
          `Disable ${biometric.label}?`,
          `You'll need to enter your password on the next sign-in.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Disable',
              style: 'destructive',
              onPress: async () => {
                await disableBiometrics();
              },
            },
          ]
        );
      }
    } finally {
      setTogglingBio(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
          },
        },
      ]
    );
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingBottom: isWeb ? 100 : insets.bottom + 100,
        paddingTop: 16,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <View style={[styles.profileCard, { backgroundColor: colors.navy }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name ?? '—'}</Text>
          <Text style={styles.profileEmail}>{user?.email ?? '—'}</Text>
          <View style={[styles.roleBadge, { backgroundColor: 'rgba(212,160,23,0.2)' }]}>
            <Text style={styles.roleText}>
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* Security section */}
      {biometric.available && !isWeb && (
        <>
          <SectionHeader title="SECURITY" />
          <View style={[styles.card, { borderColor: colors.border }]}>
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: colors.primary + '1A' }]}>
                <Ionicons name={biometric.icon} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>
                  {biometric.label} sign-in
                </Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                  {biometricEnabled
                    ? `Unlock with ${biometric.label} instead of your password`
                    : `Enable to skip the password on next launch`}
                </Text>
              </View>
              {togglingBio ? (
                <ActivityIndicator color={colors.primary} style={{ marginLeft: 8 }} />
              ) : (
                <Switch
                  value={biometricEnabled}
                  onValueChange={handleBiometricToggle}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#FFFFFF"
                  ios_backgroundColor={colors.muted}
                />
              )}
            </View>
          </View>
        </>
      )}

      {/* Account section */}
      <SectionHeader title="ACCOUNT" />
      <View style={[styles.card, { borderColor: colors.border }]}>
        <SettingsRow
          icon="mail-outline"
          label="Email"
          value={user?.email ?? '—'}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingsRow
          icon="shield-outline"
          label="Role"
          value={ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? '—'}
        />
      </View>

      {/* Sign out */}
      <SectionHeader title="" />
      <View style={[styles.card, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.7}
        >
          <View style={[styles.rowIcon, { backgroundColor: colors.destructive + '1A' }]}>
            {loggingOut ? (
              <ActivityIndicator color={colors.destructive} size="small" />
            ) : (
              <Feather name="log-out" size={18} color={colors.destructive} />
            )}
          </View>
          <Text style={[styles.rowLabel, { color: colors.destructive }]}>
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        GoldVault · Pawn Broker Management System v1.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(212,160,23,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(212,160,23,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#D4A017',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  profileInfo: { flex: 1 },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 2,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  roleText: {
    color: '#D4A017',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  rowSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  rowValue: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    maxWidth: 160,
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 60,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
    marginBottom: 16,
  },
});
