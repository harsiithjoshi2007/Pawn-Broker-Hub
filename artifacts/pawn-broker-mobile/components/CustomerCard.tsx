import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import type { Customer } from '@workspace/api-client-react';

interface Props {
  customer: Customer;
  onPress: () => void;
}

export function CustomerCard({ customer, onPress }: Props) {
  const colors = useColors();
  const initials = customer.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.initials}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{customer.name}</Text>
        <Text style={[styles.phone, { color: colors.mutedForeground }]}>{customer.phone}</Text>
        {customer.city && (
          <Text style={[styles.city, { color: colors.mutedForeground }]}>{customer.city}</Text>
        )}
      </View>
      <View style={styles.right}>
        {(customer.activeLoansCount ?? 0) > 0 && (
          <View style={[styles.loanBadge, { backgroundColor: colors.emerald + '20' }]}>
            <Text style={[styles.loanCount, { color: colors.emerald }]}>
              {customer.activeLoansCount} active
            </Text>
          </View>
        )}
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginTop: 4 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  phone: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  city: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  right: { alignItems: 'flex-end', gap: 4 },
  loanBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  loanCount: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
});
