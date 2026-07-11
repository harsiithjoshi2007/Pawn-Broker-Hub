import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useGetCollectionReport, useComputeInterest } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CalculatorInput } from '@workspace/api-client-react';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

type Mode = 'reports' | 'calculator';

// ─── Reports sub-screen ──────────────────────────────────────────────────────

function ReportsView() {
  const colors = useColors();
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [loanType, setLoanType] = useState<'all' | 'gold' | 'silver'>('all');

  const { data, isLoading, isError, refetch } = useGetCollectionReport({
    from,
    to,
    loanType: loanType !== 'all' ? loanType : undefined,
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Filters */}
      <View style={[styles.filterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.filterTitle, { color: colors.foreground }]}>Collection Report</Text>

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>From</Text>
            <TextInput
              style={[styles.dateInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={from}
              onChangeText={setFrom}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>To</Text>
            <TextInput
              style={[styles.dateInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={to}
              onChangeText={setTo}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        </View>

        <View style={styles.typeRow}>
          {(['all', 'gold', 'silver'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.typeChip,
                loanType === t
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
              ]}
              onPress={() => setLoanType(t)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  { color: loanType === t ? '#FFFFFF' : colors.foreground },
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      {isLoading && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {isError && (
        <View style={styles.center}>
          <Feather name="alert-circle" size={28} color={colors.destructive} />
          <Text style={[styles.msgText, { color: colors.mutedForeground }]}>Failed to load report</Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { borderColor: colors.primary }]}>
            <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {data && (
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Collected</Text>
            <Text style={[styles.statVal, { color: colors.emerald }]}>{fmt(data.totalCollected)}</Text>
          </View>
          <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Interest Collected</Text>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{fmt(data.totalInterestCollected)}</Text>
          </View>
          <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Principal Collected</Text>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{fmt(data.totalPrincipalCollected)}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Transactions</Text>
            <Text style={[styles.statVal, { color: colors.foreground }]}>{data.transactionCount}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Calculator sub-screen ───────────────────────────────────────────────────

function CalculatorView() {
  const colors = useColors();
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [ratePeriod, setRatePeriod] = useState<'month' | 'day' | 'year'>('month');
  const [interestType, setInterestType] = useState<'simple' | 'compound'>('simple');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<'months' | 'days' | 'years'>('months');

  const calcMutation = useComputeInterest();

  const compute = async () => {
    if (!principal || !rate || !duration) {
      Alert.alert('Missing fields', 'Enter principal, rate, and duration.');
      return;
    }
    await calcMutation.mutateAsync({
      data: {
        principal: Number(principal),
        interestRate: Number(rate),
        ratePeriod,
        interestType,
        duration: Number(duration),
        durationUnit,
      } as CalculatorInput,
    });
  };

  const result = calcMutation.data;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.filterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.filterTitle, { color: colors.foreground }]}>Interest Calculator</Text>

          <View style={styles.calcField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Principal Amount (₹)</Text>
            <TextInput
              style={[styles.calcInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={principal}
              onChangeText={setPrincipal}
              keyboardType="numeric"
              placeholder="e.g. 50000"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>

          <View style={styles.calcField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Interest Rate (%)</Text>
            <View style={styles.rateRow}>
              <TextInput
                style={[styles.calcInput, { flex: 1, backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
                placeholder="e.g. 2"
                placeholderTextColor={colors.mutedForeground}
              />
              <View style={styles.segControl}>
                {(['day', 'month', 'year'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.seg,
                      ratePeriod === p
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.muted },
                    ]}
                    onPress={() => setRatePeriod(p)}
                  >
                    <Text style={{ color: ratePeriod === p ? '#FFFFFF' : colors.mutedForeground, fontSize: 12, fontFamily: 'Inter_500Medium' }}>
                      /{p[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.calcField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Duration</Text>
            <View style={styles.rateRow}>
              <TextInput
                style={[styles.calcInput, { flex: 1, backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={duration}
                onChangeText={setDuration}
                keyboardType="numeric"
                placeholder="e.g. 6"
                placeholderTextColor={colors.mutedForeground}
              />
              <View style={styles.segControl}>
                {(['days', 'months', 'years'] as const).map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.seg,
                      durationUnit === u
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.muted },
                    ]}
                    onPress={() => setDurationUnit(u)}
                  >
                    <Text style={{ color: durationUnit === u ? '#FFFFFF' : colors.mutedForeground, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
                      {u[0].toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Interest type */}
          <View style={styles.calcField}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Interest Type</Text>
            <View style={styles.typeRow}>
              {(['simple', 'compound'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeChip,
                    interestType === t
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
                  ]}
                  onPress={() => setInterestType(t)}
                >
                  <Text
                    style={{
                      color: interestType === t ? '#FFFFFF' : colors.foreground,
                      fontSize: 13,
                      fontFamily: 'Inter_500Medium',
                      textTransform: 'capitalize',
                    }}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.calcBtn, { backgroundColor: colors.gold }, calcMutation.isPending && { opacity: 0.7 }]}
            onPress={compute}
            disabled={calcMutation.isPending}
            activeOpacity={0.85}
          >
            {calcMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.calcBtnText}>Calculate</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Interest</Text>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{fmt(result.totalInterest)}</Text>
            </View>
            {result.penaltyInterest > 0 && (
              <View style={[styles.statRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Penalty Interest</Text>
                <Text style={[styles.statVal, { color: colors.destructive }]}>{fmt(result.penaltyInterest)}</Text>
              </View>
            )}
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Payable</Text>
              <Text style={[styles.statVal, { color: colors.emerald, fontSize: 18 }]}>{fmt(result.totalPayable)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Tab root ────────────────────────────────────────────────────────────────

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('reports');

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Toggle header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.navy, paddingTop: topPad + 12, paddingBottom: 14 },
        ]}
      >
        <View style={[styles.toggle, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'reports' && { backgroundColor: colors.gold }]}
            onPress={() => setMode('reports')}
          >
            <Feather name="bar-chart-2" size={14} color={mode === 'reports' ? '#FFF' : 'rgba(255,255,255,0.65)'} />
            <Text style={[styles.toggleText, { color: mode === 'reports' ? '#FFF' : 'rgba(255,255,255,0.65)' }]}>
              Reports
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'calculator' && { backgroundColor: colors.gold }]}
            onPress={() => setMode('calculator')}
          >
            <Feather name="percent" size={14} color={mode === 'calculator' ? '#FFF' : 'rgba(255,255,255,0.65)'} />
            <Text style={[styles.toggleText, { color: mode === 'calculator' ? '#FFF' : 'rgba(255,255,255,0.65)' }]}>
              Calculator
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, padding: 16, paddingBottom: isWeb ? 100 : insets.bottom + 80 }}>
        {mode === 'reports' ? <ReportsView /> : <CalculatorView />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, alignItems: 'center' },
  toggle: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  filterCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    gap: 14,
  },
  filterTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 6 },
  dateInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  typeChipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  statsCard: { borderRadius: 14, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  statLabel: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  statVal: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  center: { alignItems: 'center', gap: 12, padding: 40 },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  calcField: { gap: 6 },
  calcInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  rateRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  segControl: { flexDirection: 'row', gap: 4 },
  seg: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  calcBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calcBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
});
