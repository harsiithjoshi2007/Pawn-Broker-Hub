import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useGetCustomer, useListLoans } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoanCard } from '@/components/LoanCard';

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

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const customerId = Number(id);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const [refreshing, setRefreshing] = useState(false);

  const { data: customer, isLoading, isError, refetch } = useGetCustomer(customerId);
  const { data: loansData, refetch: refetchLoans } = useListLoans({
    customerId,
    limit: 50,
  });

  const loans = loansData?.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchLoans()]);
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (isError || !customer) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Feather name="alert-circle" size={32} color={colors.destructive} />
        <Text style={[styles.msgText, { color: colors.mutedForeground }]}>Customer not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = customer.name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: isWeb ? 100 : insets.bottom + 60,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.headerCard, { backgroundColor: colors.navy }]}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          {(customer.activeLoansCount ?? 0) > 0 && (
            <View style={[styles.loanBadge, { backgroundColor: colors.emerald }]}>
              <Text style={styles.loanBadgeText}>{customer.activeLoansCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.custId}>{customer.customerId}</Text>
        <View style={styles.contactRow}>
          <Feather name="phone" size={14} color="rgba(255,255,255,0.65)" />
          <Text style={styles.contactText}>{customer.phone}</Text>
        </View>
        <TouchableOpacity
          style={[styles.newLoanBtn, { backgroundColor: colors.gold }]}
          onPress={() => router.push('/loan/new')}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.newLoanBtnText}>New Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Details */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact Details</Text>
        {customer.phone && <InfoRow label="Phone" value={customer.phone} />}
        {customer.whatsapp && <InfoRow label="WhatsApp" value={customer.whatsapp} />}
        {customer.email && <InfoRow label="Email" value={customer.email} />}
        {customer.dateOfBirth && <InfoRow label="Date of Birth" value={fmtDate(customer.dateOfBirth)} />}
      </View>

      {/* ID Documents */}
      {(customer.aadhaarNumber || customer.panNumber) && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Identity Documents</Text>
          {customer.aadhaarNumber && <InfoRow label="Aadhaar" value={customer.aadhaarNumber} />}
          {customer.panNumber && <InfoRow label="PAN" value={customer.panNumber} />}
        </View>
      )}

      {/* Address */}
      {(customer.address || customer.city) && (
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Address</Text>
          {customer.address && <InfoRow label="Address" value={customer.address} />}
          {customer.city && <InfoRow label="City" value={customer.city} />}
          {customer.state && <InfoRow label="State" value={customer.state} />}
          {customer.pincode && <InfoRow label="Pincode" value={customer.pincode} />}
        </View>
      )}

      {/* Loans */}
      <View style={styles.loansSection}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, marginBottom: 12 }]}>
          Loans ({loans.length})
        </Text>
        {loans.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="file-text" size={28} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No loans yet</Text>
          </View>
        ) : (
          loans.map((loan) => (
            <LoanCard
              key={loan.id}
              loan={loan}
              onPress={() => router.push(`/loan/${loan.id}`)}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  headerCard: { borderRadius: 16, padding: 20, marginBottom: 14, alignItems: 'center', gap: 6 },
  avatarWrap: { position: 'relative', marginBottom: 4 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Inter_700Bold' },
  loanBadge: { position: 'absolute', top: -4, right: -4, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  loanBadgeText: { color: '#FFFFFF', fontSize: 11, fontFamily: 'Inter_700Bold' },
  name: { color: '#FFFFFF', fontSize: 20, fontFamily: 'Inter_700Bold' },
  custId: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: 'Inter_400Regular' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactText: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontFamily: 'Inter_400Regular' },
  newLoanBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 6 },
  newLoanBtnText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  section: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  infoLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 1, textAlign: 'right' },
  loansSection: { marginBottom: 14 },
  emptyBox: { borderRadius: 12, borderWidth: 1, padding: 24, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});
