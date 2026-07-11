import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { LoanStatusBadge } from './LoanStatusBadge';
import { Feather } from '@expo/vector-icons';
import type { Loan } from '@workspace/api-client-react';

interface Props {
  loan: Loan;
  onPress: () => void;
}

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export function LoanCard({ loan, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <Text style={[styles.loanNumber, { color: colors.foreground }]}>
            {loan.loanNumber}
          </Text>
          {loan.customerName && (
            <Text style={[styles.customer, { color: colors.mutedForeground }]}>
              {loan.customerName}
            </Text>
          )}
        </View>
        <LoanStatusBadge status={loan.status} size="sm" />
      </View>

      <View style={styles.divider} />

      <View style={styles.bottom}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Principal</Text>
          <Text style={[styles.statValue, { color: colors.foreground }]}>
            {fmt(loan.principalAmount)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Outstanding</Text>
          <Text style={[styles.statValue, { color: colors.destructive }]}>
            {fmt(loan.outstandingBalance ?? 0)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Type</Text>
          <View style={styles.typeRow}>
            <View
              style={[
                styles.typeDot,
                { backgroundColor: loan.loanType === 'gold' ? colors.gold : '#C0C0C0' },
              ]}
            />
            <Text style={[styles.statValue, { color: colors.foreground, textTransform: 'capitalize' }]}>
              {loan.loanType}
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topLeft: { flex: 1, marginRight: 12 },
  loanNumber: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  customer: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10 },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stat: { flex: 1 },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  statValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  typeDot: { width: 7, height: 7, borderRadius: 4 },
});
