import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGetDashboardStats } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth';
import { LoanStatusBadge } from '@/components/LoanStatusBadge';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const fmtDate = (s: string) => {
  try {
    return new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return s;
  }
};

function MetricCard({
  label,
  value,
  icon,
  tint,
}: {
  label: string;
  value: string;
  icon: string;
  tint: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.metricIcon, { backgroundColor: tint + '1A' }]}>
        <Feather name={icon as any} size={18} color={tint} />
      </View>
      <Text style={[styles.metricValue, { color: colors.foreground }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useGetDashboardStats();
  const [refreshing, setRefreshing] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 100 : insets.bottom + 80;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingBottom: bottomPad,
        paddingHorizontal: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.gold}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: colors.foreground }]}>
            {user?.name ?? 'User'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.gold }]}
          onPress={() => router.push('/loan/new')}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Loading skeleton */}
      {isLoading && !data && (
        <View style={styles.skeletonGrid}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[styles.skeleton, { backgroundColor: colors.muted }]}
            />
          ))}
        </View>
      )}

      {/* Error state */}
      {isError && !data && (
        <View style={[styles.errorBox, { backgroundColor: colors.card, borderColor: colors.destructive + '40' }]}>
          <Feather name="alert-circle" size={20} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            Failed to load dashboard
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {data && (
        <>
          {/* Metric grid */}
          <View style={styles.metricsGrid}>
            <MetricCard
              label="Active Loans"
              value={String(data.totalActiveLoans)}
              icon="activity"
              tint={colors.primary}
            />
            <MetricCard
              label="Overdue"
              value={String(data.totalOverdueLoans)}
              icon="alert-triangle"
              tint={colors.destructive}
            />
            <MetricCard
              label="Today's Collection"
              value={fmt(data.todayCollection)}
              icon="trending-up"
              tint={colors.emerald}
            />
            <MetricCard
              label="Monthly Income"
              value={fmt(data.monthlyIncome)}
              icon="dollar-sign"
              tint={colors.gold}
            />
          </View>

          {/* Portfolio Banner */}
          <View style={[styles.portfolioCard, { backgroundColor: colors.navy }]}>
            <View>
              <Text style={styles.portfolioLabel}>Loan Portfolio Value</Text>
              <Text style={styles.portfolioValue}>{fmt(data.loanPortfolioValue)}</Text>
            </View>
            <View style={styles.typeCol}>
              <View style={styles.typeRow}>
                <View style={[styles.typeDot, { backgroundColor: colors.gold }]} />
                <Text style={styles.typeText}>Gold · {data.goldLoansCount}</Text>
              </View>
              <View style={styles.typeRow}>
                <View style={[styles.typeDot, { backgroundColor: '#C0C0C0' }]} />
                <Text style={styles.typeText}>Silver · {data.silverLoansCount}</Text>
              </View>
            </View>
          </View>

          {/* Recent Loans */}
          {data.recentLoans.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHdr}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                  Recent Loans
                </Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/loans')}>
                  <Text style={[styles.sectionLink, { color: colors.gold }]}>View all</Text>
                </TouchableOpacity>
              </View>

              {data.recentLoans.slice(0, 6).map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  style={[styles.recentRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => router.push(`/loan/${loan.id}`)}
                  activeOpacity={0.82}
                >
                  <View style={styles.recentLeft}>
                    <Text style={[styles.recentLoanNum, { color: colors.foreground }]}>
                      {loan.loanNumber}
                    </Text>
                    <Text style={[styles.recentCustomer, { color: colors.mutedForeground }]}>
                      {loan.customerName}
                    </Text>
                  </View>
                  <View style={styles.recentRight}>
                    <Text style={[styles.recentAmt, { color: colors.foreground }]}>
                      {fmt(loan.principalAmount)}
                    </Text>
                    <LoanStatusBadge status={loan.status} size="sm" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  userName: { fontSize: 22, fontFamily: 'Inter_700Bold', marginTop: 2 },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  skeleton: { width: '47%', height: 104, borderRadius: 12 },
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  errorText: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  retryText: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  metricCard: { width: '47%', borderRadius: 12, borderWidth: 1, padding: 14 },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricValue: { fontSize: 18, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  metricLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  portfolioCard: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  portfolioLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  portfolioValue: { color: '#FFFFFF', fontSize: 24, fontFamily: 'Inter_700Bold' },
  typeCol: { gap: 8 },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  section: { marginBottom: 16 },
  sectionHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  sectionLink: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  recentLeft: { flex: 1, marginRight: 12 },
  recentLoanNum: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  recentCustomer: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  recentRight: { alignItems: 'flex-end', gap: 4 },
  recentAmt: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
