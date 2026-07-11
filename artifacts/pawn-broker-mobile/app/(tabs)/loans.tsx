import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useListLoans } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LoanCard } from '@/components/LoanCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'partially_paid', label: 'Partial' },
  { key: 'closed', label: 'Closed' },
  { key: 'auction', label: 'Auction' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default function LoansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 100 : insets.bottom + 80;

  const { data, isLoading, isError, refetch } = useListLoans({
    status: filter !== 'all' ? filter : undefined,
    search: search.trim() || undefined,
    limit: 100,
  });

  const loans = data?.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search + FAB */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.navy,
            paddingTop: topPad + 12,
            paddingBottom: 12,
          },
        ]}
      >
        <View style={[styles.searchRow]}>
          <View style={[styles.searchBox, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={[styles.searchInput, { color: '#FFFFFF' }]}
              placeholder="Search loans..."
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.gold }]}
            onPress={() => router.push('/loan/new')}
            activeOpacity={0.85}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <View style={styles.chips}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.chip,
                filter === f.key
                  ? { backgroundColor: colors.gold }
                  : { backgroundColor: 'rgba(255,255,255,0.12)' },
              ]}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: filter === f.key ? '#FFFFFF' : 'rgba(255,255,255,0.7)' },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Loan count */}
      {data && (
        <View style={styles.countRow}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {data.total} loan{data.total !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

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
            Failed to load loans
          </Text>
          <TouchableOpacity onPress={() => refetch()} style={[styles.retryBtn, { borderColor: colors.primary }]}>
            <Text style={[{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      {!isLoading && !isError && (
        <FlatList
          data={loans}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <LoanCard loan={item} onPress={() => router.push(`/loan/${item.id}`)} />
          )}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: bottomPad,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="file-text" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No loans found</Text>
              <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
                {search ? 'Try a different search term' : 'Tap + to create a new loan'}
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
  topBar: { paddingHorizontal: 16, gap: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'nowrap' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  countRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  countText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  emptyMsg: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
