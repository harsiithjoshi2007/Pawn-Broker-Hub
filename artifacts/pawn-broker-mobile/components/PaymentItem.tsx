import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import type { Payment } from '@workspace/api-client-react';

interface Props {
  payment: Payment;
  showLoanId?: boolean;
}

const MODES: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
};

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return s;
  }
};

export function PaymentItem({ payment, showLoanId = false }: Props) {
  const colors = useColors();

  return (
    <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.emerald + '15' }]}>
        <Feather name="arrow-down-left" size={16} color={colors.emerald} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.receipt, { color: colors.foreground }]}>
          {payment.receiptNumber}
        </Text>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {fmtDate(payment.paymentDate)} · {MODES[payment.paymentMode] ?? payment.paymentMode}
        </Text>
        {showLoanId && (
          <Text style={[styles.loan, { color: colors.mutedForeground }]}>
            Loan #{payment.loanId}
          </Text>
        )}
      </View>
      <Text style={[styles.amount, { color: colors.emerald }]}>{fmt(payment.amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  receipt: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  date: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  loan: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  amount: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});
