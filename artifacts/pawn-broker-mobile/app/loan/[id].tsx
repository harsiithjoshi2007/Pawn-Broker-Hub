import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import {
  useGetLoan,
  useRecordPayment,
  useCloseLoan,
} from '@workspace/api-client-react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoanStatusBadge } from '@/components/LoanStatusBadge';
import { PaymentItem } from '@/components/PaymentItem';
import * as Haptics from 'expo-haptics';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import type { PaymentInput, LoanCloseInput } from '@workspace/api-client-react';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const fmtDate = (s?: string | null) => {
  if (!s) return '—';
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

type PayMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque';
const PAY_MODES: PayMode[] = ['cash', 'upi', 'bank_transfer', 'cheque'];
const MODE_LABELS: Record<PayMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
};

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: valueColor ?? colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loanId = Number(id);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const [payModal, setPayModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState<PayMode>('cash');
  const [payNotes, setPayNotes] = useState('');
  const [closeDiscount, setCloseDiscount] = useState('');
  const [closeMode, setCloseMode] = useState<PayMode>('cash');
  const [refreshing, setRefreshing] = useState(false);

  const { data: loan, isLoading, isError, refetch } = useGetLoan(loanId);
  const recordPayment = useRecordPayment();
  const closeLoan = useCloseLoan();
  const { isOffline } = useNetworkStatus();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePayment = async () => {
    if (!payAmount || Number(payAmount) <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid payment amount.');
      return;
    }
    try {
      await recordPayment.mutateAsync({
        id: loanId,
        data: {
          amount: Number(payAmount),
          paymentMode: payMode,
          paymentDate: new Date().toISOString().slice(0, 10),
          notes: payNotes || undefined,
        } as PaymentInput,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPayModal(false);
      setPayAmount('');
      setPayNotes('');
      refetch();
    } catch {
      Alert.alert('Error', 'Failed to record payment. Please try again.');
    }
  };

  const handleClose = async () => {
    Alert.alert(
      'Close Loan',
      'Are you sure you want to close this loan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Loan',
          style: 'destructive',
          onPress: async () => {
            try {
              await closeLoan.mutateAsync({
                id: loanId,
                data: {
                  paymentMode: closeMode,
                  discount: closeDiscount ? Number(closeDiscount) : undefined,
                } as LoanCloseInput,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setCloseModal(false);
              refetch();
            } catch {
              Alert.alert('Error', 'Failed to close loan. Please try again.');
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !loan) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.destructive} />
        <Text style={[styles.msgText, { color: colors.mutedForeground }]}>Loan not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = ['active', 'partially_paid', 'overdue'].includes(loan.status);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isWeb ? 100 : insets.bottom + 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <View style={[styles.headerCard, { backgroundColor: colors.navy }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.loanNum}>{loan.loanNumber}</Text>
              <Text style={styles.customerName}>{loan.customerName}</Text>
            </View>
            <LoanStatusBadge status={loan.status} />
          </View>
          <View style={styles.headerStats}>
            <View style={styles.hStat}>
              <Text style={styles.hStatLabel}>Principal</Text>
              <Text style={styles.hStatValue}>{fmt(loan.principalAmount)}</Text>
            </View>
            <View style={styles.hStat}>
              <Text style={styles.hStatLabel}>Outstanding</Text>
              <Text style={[styles.hStatValue, { color: '#FCA5A5' }]}>
                {fmt(loan.outstandingBalance ?? 0)}
              </Text>
            </View>
            <View style={styles.hStat}>
              <Text style={styles.hStatLabel}>Paid</Text>
              <Text style={[styles.hStatValue, { color: '#6EE7B7' }]}>{fmt(loan.amountPaid ?? 0)}</Text>
            </View>
          </View>
        </View>

        {/* Loan Details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loan Details</Text>
          <InfoRow label="Loan Type" value={loan.loanType.toUpperCase()} />
          <InfoRow label="Interest Rate" value={`${loan.interestRate}% per ${loan.ratePeriod}`} />
          <InfoRow label="Interest Type" value={loan.interestType === 'simple' ? 'Simple' : 'Compound'} />
          <InfoRow label="Duration" value={`${loan.duration} ${loan.durationUnit}`} />
          <InfoRow label="Total Interest" value={fmt(loan.totalInterest ?? 0)} />
          <InfoRow label="Total Payable" value={fmt(loan.totalPayable ?? 0)} valueColor={colors.primary} />
          <InfoRow label="Start Date" value={fmtDate(loan.startDate)} />
          <InfoRow label="Due Date" value={fmtDate(loan.dueDate)} />
          {loan.penaltyRate && (
            <InfoRow label="Penalty Rate" value={`${loan.penaltyRate}%`} />
          )}
          {loan.notes && (
            <InfoRow label="Notes" value={loan.notes} />
          )}
        </View>

        {/* Jewellery Items */}
        {loan.jewelleryItems?.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Jewellery Items ({loan.jewelleryItems.length})
            </Text>
            {loan.jewelleryItems.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.jewItem,
                  idx < loan.jewelleryItems.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.jewRow}>
                  <Text style={[styles.jewType, { color: colors.foreground }]}>
                    {item.jewelleryType}
                    {item.category ? ` · ${item.category}` : ''}
                  </Text>
                  <Text style={[styles.jewValue, { color: colors.gold }]}>
                    {fmt(item.estimatedValue)}
                  </Text>
                </View>
                <Text style={[styles.jewMeta, { color: colors.mutedForeground }]}>
                  Gross: {item.grossWeight}g · Net: {item.netWeight}g · Purity: {item.purity}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        {isActive && (
          <View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.emerald }, isOffline && styles.actionBtnDisabled]}
                onPress={() => setPayModal(true)}
                activeOpacity={0.85}
                disabled={isOffline}
              >
                <Feather name="arrow-down-left" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Record Payment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.destructive }, isOffline && styles.actionBtnDisabled]}
                onPress={() => setCloseModal(true)}
                activeOpacity={0.85}
                disabled={isOffline}
              >
                <Feather name="lock" size={18} color="#FFF" />
                <Text style={styles.actionBtnText}>Close Loan</Text>
              </TouchableOpacity>
            </View>
            {isOffline && (
              <View style={styles.offlineNote}>
                <Feather name="wifi-off" size={12} color="#B45309" />
                <Text style={styles.offlineNoteText}>Not available offline</Text>
              </View>
            )}
          </View>
        )}

        {/* Payment history */}
        {loan.payments?.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 10 }]}>
              Payment History
            </Text>
            {loan.payments.map((p) => (
              <PaymentItem key={p.id} payment={p} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Record Payment Modal */}
      <Modal visible={payModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Record Payment</Text>
              <TouchableOpacity onPress={() => setPayModal(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Amount (₹)</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={payAmount}
              onChangeText={setPayAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>
              Payment Mode
            </Text>
            <View style={styles.modeRow}>
              {PAY_MODES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.modeChip,
                    payMode === m
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setPayMode(m)}
                >
                  <Text
                    style={{
                      color: payMode === m ? '#FFFFFF' : colors.foreground,
                      fontSize: 12,
                      fontFamily: 'Inter_500Medium',
                    }}
                  >
                    {MODE_LABELS[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>
              Notes (optional)
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={payNotes}
              onChangeText={setPayNotes}
              placeholder="Optional notes"
              placeholderTextColor={colors.mutedForeground}
            />

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.emerald }, recordPayment.isPending && { opacity: 0.7 }]}
              onPress={handlePayment}
              disabled={recordPayment.isPending}
            >
              {recordPayment.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalBtnText}>Record Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Close Loan Modal */}
      <Modal visible={closeModal} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Close Loan</Text>
              <TouchableOpacity onPress={() => setCloseModal(false)}>
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.outstanding, { color: colors.foreground }]}>
              Outstanding: {fmt(loan.outstandingBalance ?? 0)}
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>
              Discount (₹, optional)
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={closeDiscount}
              onChangeText={setCloseDiscount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 12 }]}>
              Payment Mode
            </Text>
            <View style={styles.modeRow}>
              {PAY_MODES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.modeChip,
                    closeMode === m
                      ? { backgroundColor: colors.destructive }
                      : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setCloseMode(m)}
                >
                  <Text
                    style={{
                      color: closeMode === m ? '#FFFFFF' : colors.foreground,
                      fontSize: 12,
                      fontFamily: 'Inter_500Medium',
                    }}
                  >
                    {MODE_LABELS[m]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.destructive }, closeLoan.isPending && { opacity: 0.7 }]}
              onPress={handleClose}
              disabled={closeLoan.isPending}
            >
              {closeLoan.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.modalBtnText}>Close Loan</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  headerCard: { borderRadius: 14, padding: 18, marginBottom: 14 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  loanNum: { color: '#FFFFFF', fontSize: 18, fontFamily: 'Inter_700Bold' },
  customerName: { color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  headerStats: { flexDirection: 'row', justifyContent: 'space-between' },
  hStat: {},
  hStatLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 3 },
  hStatValue: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_700Bold' },
  section: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E7EB' },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  infoValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'right' },
  jewItem: { paddingVertical: 10 },
  jewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  jewType: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  jewValue: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  jewMeta: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 13 },
  actionBtnDisabled: { opacity: 0.45 },
  offlineNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 6, marginBottom: 2 },
  offlineNoteText: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#B45309' },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  historySection: { marginBottom: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  fieldLabel: { fontSize: 13, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  modalInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, fontFamily: 'Inter_400Regular' },
  modeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  modalBtn: { marginTop: 20, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  outstanding: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
