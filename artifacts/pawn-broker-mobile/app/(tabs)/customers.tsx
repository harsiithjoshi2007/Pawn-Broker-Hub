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
import { useListCustomers } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CustomerCard } from '@/components/CustomerCard';

export default function CustomersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const bottomPad = isWeb ? 100 : insets.bottom + 80;

  const { data, isLoading, isError, refetch } = useListCustomers({
    search: search.trim() || undefined,
    limit: 100,
  });

  const customers = data?.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor: colors.navy,
            paddingTop: topPad + 12,
            paddingBottom: 14,
          },
        ]}
      >
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={[styles.searchInput, { color: '#FFFFFF' }]}
              placeholder="Search by name or phone..."
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
            onPress={() => router.push('/customer/new')}
            activeOpacity={0.85}
          >
            <Feather name="user-plus" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Count */}
      {data && (
        <View style={styles.countRow}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {data.total} customer{data.total !== 1 ? 's' : ''}
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
            Failed to load customers
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
          data={customers}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={() => router.push(`/customer/${item.id}`)}
            />
          )}
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
              <Feather name="users" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No customers found
              </Text>
              <Text style={[styles.emptyMsg, { color: colors.mutedForeground }]}>
                {search ? 'Try a different search term' : 'Tap + to add a customer'}
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
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  countText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  msgText: { fontFamily: 'Inter_400Regular', fontSize: 14, textAlign: 'center' },
  retryBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  emptyTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', marginTop: 4 },
  emptyMsg: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});
