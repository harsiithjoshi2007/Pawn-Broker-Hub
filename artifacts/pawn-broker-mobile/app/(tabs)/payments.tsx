import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useListPayments } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaymentItem } from '@/components/PaymentItem';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function PaymentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 100 : insets.bottom + 80;

  const { data, isLoading, isError, refetch } = useListPayments({ limit: 100 });

  const payments = data?.data ?? [];
  const total = payments.reduce((s, p) => s + p.amount, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Summary banner */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: colors.navy,
            paddingTop: topPad + 14,
            paddingBottom: 16,
          },
        ]}
      >
        <Text style={styles.bannerLabel}>Total Collected</Text>
        <Text style={styles.bannerValue}>{fmt(total)}</Text>
        <Text style={styles.bannerSub}>{data?.total ?? 0} transactions</Text>
      </View>

      {/* Loading */}
      {isLoading && !data && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {/* Error */}
      {isError && (
        <View style={styles.center}>
          <Feather name="alert-circle" size={32} color={colors.destructive} />
          <Text style={[styles.msgText, { color: colors.mutedForeground }]}>
            Failed to load payments
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryBtn, { borderColor: colors.primary }]}
          >
            <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && (
        <FlatList
          data={payments}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <PaymentItem payment={item} showLoanId />}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: bottomPad,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.gold}
            />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="credit-card" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No payments yet
              </Text>
              <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
                Payments will appear here once recorded
              </Text>
            </View>
          }
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { paddingHorizontal: 20, alignItems: 'center' },
  bannerLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  bannerValue: { color: '#FFFFFF', fontSize: 28, fontFamily: 'Inter_700Bold' },
  bannerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  emptyMsg: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
