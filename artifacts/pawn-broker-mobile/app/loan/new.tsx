import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useCreateLoan, useListCustomers } from '@workspace/api-client-react';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { LoanInput, JewelleryItemInput } from '@workspace/api-client-react';

type LoanType = 'gold' | 'silver';
type RatePeriod = 'day' | 'month' | 'year';
type InterestType = 'simple' | 'compound';
type DurationUnit = 'days' | 'months' | 'years';

interface JewItem {
  jewelleryType: string;
  purity: string;
  grossWeight: string;
  estimatedValue: string;
}

const JEWELLERY_TYPES = ['Ring', 'Necklace', 'Earring', 'Bracelet', 'Bangle', 'Chain', 'Pendant', 'Other'];
const PURITY_OPTIONS = ['24K', '22K', '18K', '916', '750', '999 Fine Silver', '925 Sterling', 'Other'];

export default function NewLoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  // Customer selection
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [customerModal, setCustomerModal] = useState(false);

  // Loan params
  const [loanType, setLoanType] = useState<LoanType>('gold');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [ratePeriod, setRatePeriod] = useState<RatePeriod>('month');
  const [interestType, setInterestType] = useState<InterestType>('simple');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('months');
  const [penaltyRate, setPenaltyRate] = useState('');
  const [notes, setNotes] = useState('');

  // Jewellery items
  const [jewItems, setJewItems] = useState<JewItem[]>([
    { jewelleryType: 'Ring', purity: '22K', grossWeight: '', estimatedValue: '' },
  ]);

  const createLoan = useCreateLoan();
  const { data: customers } = useListCustomers({
    search: customerSearch || undefined,
    limit: 30,
  });

  const addJewItem = () => {
    setJewItems((prev) => [
      ...prev,
      { jewelleryType: 'Ring', purity: '22K', grossWeight: '', estimatedValue: '' },
    ]);
  };

  const removeJewItem = (idx: number) => {
    if (jewItems.length <= 1) return;
    setJewItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateJewItem = (idx: number, field: keyof JewItem, value: string) => {
    setJewItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert('Missing customer', 'Please select a customer.');
      return;
    }
    if (!principal || !interestRate || !duration) {
      Alert.alert('Missing fields', 'Please fill in principal, interest rate, and duration.');
      return;
    }
    const invalidJew = jewItems.some(
      (j) => !j.grossWeight || !j.estimatedValue,
    );
    if (invalidJew) {
      Alert.alert('Missing jewellery details', 'Please fill in weight and value for all jewellery items.');
      return;
    }

    try {
      const payload: LoanInput = {
        customerId: selectedCustomerId,
        loanType,
        principalAmount: Number(principal),
        interestRate: Number(interestRate),
        ratePeriod,
        interestType,
        duration: Number(duration),
        durationUnit,
        penaltyRate: penaltyRate ? Number(penaltyRate) : undefined,
        notes: notes || undefined,
        jewelleryItems: jewItems.map(
          (j): JewelleryItemInput => ({
            jewelleryType: j.jewelleryType,
            grossWeight: Number(j.grossWeight),
            netWeight: Number(j.grossWeight),
            purity: j.purity,
            estimatedValue: Number(j.estimatedValue),
          }),
        ),
      };
      await createLoan.mutateAsync({ data: payload });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Loan created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create loan. Please try again.');
    }
  };

  const selectCustomer = (id: number, name: string) => {
    setSelectedCustomerId(id);
    setSelectedCustomerName(name);
    setCustomerModal(false);
  };

  const filteredCustomers = customers?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isWeb ? 100 : insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Customer selection */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Customer</Text>
          <TouchableOpacity
            style={[styles.selectBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}
            onPress={() => setCustomerModal(true)}
          >
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <Text
              style={[
                styles.selectBtnText,
                { color: selectedCustomerId ? colors.foreground : colors.mutedForeground },
              ]}
            >
              {selectedCustomerName || 'Select a customer...'}
            </Text>
            <Feather name="chevron-down" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Loan Type */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Loan Type</Text>
          <View style={styles.toggleRow}>
            {(['gold', 'silver'] as LoanType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.toggleChip,
                  loanType === t
                    ? { backgroundColor: t === 'gold' ? colors.gold : '#6B7A8D' }
                    : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setLoanType(t)}
              >
                <Text
                  style={{
                    color: loanType === t ? '#FFFFFF' : colors.foreground,
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    textTransform: 'capitalize',
                  }}
                >
                  {t} Loan
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Financial Details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Financial Details</Text>

          <FieldLabel label="Principal Amount (₹)" colors={colors} />
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={principal}
            onChangeText={setPrincipal}
            keyboardType="numeric"
            placeholder="e.g. 50000"
            placeholderTextColor={colors.mutedForeground}
          />

          <FieldLabel label="Interest Rate (%)" colors={colors} />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={interestRate}
              onChangeText={setInterestRate}
              keyboardType="numeric"
              placeholder="e.g. 2"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.seg3}>
              {(['day', 'month', 'year'] as RatePeriod[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.segBtn, ratePeriod === p && { backgroundColor: colors.primary }]}
                  onPress={() => setRatePeriod(p)}
                >
                  <Text style={{ color: ratePeriod === p ? '#FFF' : colors.mutedForeground, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
                    /{p[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <FieldLabel label="Interest Type" colors={colors} />
          <View style={styles.toggleRow}>
            {(['simple', 'compound'] as InterestType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.toggleChip,
                  interestType === t
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.muted, borderColor: colors.border, borderWidth: 1 },
                ]}
                onPress={() => setInterestType(t)}
              >
                <Text style={{ color: interestType === t ? '#FFFFFF' : colors.foreground, fontFamily: 'Inter_500Medium', fontSize: 13, textTransform: 'capitalize' }}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FieldLabel label="Duration" colors={colors} />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1, backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="e.g. 6"
              placeholderTextColor={colors.mutedForeground}
            />
            <View style={styles.seg3}>
              {(['days', 'months', 'years'] as DurationUnit[]).map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.segBtn, durationUnit === u && { backgroundColor: colors.primary }]}
                  onPress={() => setDurationUnit(u)}
                >
                  <Text style={{ color: durationUnit === u ? '#FFF' : colors.mutedForeground, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
                    {u[0].toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <FieldLabel label="Penalty Rate (% optional)" colors={colors} />
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={penaltyRate}
            onChangeText={setPenaltyRate}
            keyboardType="numeric"
            placeholder="e.g. 3"
            placeholderTextColor={colors.mutedForeground}
          />

          <FieldLabel label="Notes (optional)" colors={colors} />
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, height: 60, textAlignVertical: 'top', paddingTop: 10 }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any remarks..."
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        </View>

        {/* Jewellery Items */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHdr}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Jewellery Items
            </Text>
            <TouchableOpacity
              style={[styles.addJewBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}
              onPress={addJewItem}
            >
              <Feather name="plus" size={14} color={colors.primary} />
              <Text style={{ color: colors.primary, fontSize: 12, fontFamily: 'Inter_600SemiBold' }}>Add</Text>
            </TouchableOpacity>
          </View>

          {jewItems.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.jewCard,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <View style={styles.jewCardHdr}>
                <Text style={[styles.jewCardTitle, { color: colors.foreground }]}>
                  Item {idx + 1}
                </Text>
                {jewItems.length > 1 && (
                  <TouchableOpacity onPress={() => removeJewItem(idx)}>
                    <Feather name="trash-2" size={16} color={colors.destructive} />
                  </TouchableOpacity>
                )}
              </View>

              <FieldLabel label="Type" colors={colors} />
              <View style={styles.jewTypeRow}>
                {JEWELLERY_TYPES.slice(0, 4).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.jewTypeChip,
                      item.jewelleryType === t
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                    ]}
                    onPress={() => updateJewItem(idx, 'jewelleryType', t)}
                  >
                    <Text style={{ color: item.jewelleryType === t ? '#FFF' : colors.foreground, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.jewTypeRow, { marginTop: 4 }]}>
                {JEWELLERY_TYPES.slice(4).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.jewTypeChip,
                      item.jewelleryType === t
                        ? { backgroundColor: colors.primary }
                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                    ]}
                    onPress={() => updateJewItem(idx, 'jewelleryType', t)}
                  >
                    <Text style={{ color: item.jewelleryType === t ? '#FFF' : colors.foreground, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FieldLabel label="Purity" colors={colors} />
              <View style={styles.jewTypeRow}>
                {PURITY_OPTIONS.slice(0, 4).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.jewTypeChip,
                      item.purity === p
                        ? { backgroundColor: colors.gold }
                        : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
                    ]}
                    onPress={() => updateJewItem(idx, 'purity', p)}
                  >
                    <Text style={{ color: item.purity === p ? '#FFF' : colors.foreground, fontSize: 11, fontFamily: 'Inter_500Medium' }}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Gross Weight (g)" colors={colors} />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                    value={item.grossWeight}
                    onChangeText={(v) => updateJewItem(idx, 'grossWeight', v)}
                    keyboardType="numeric"
                    placeholder="e.g. 10.5"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Est. Value (₹)" colors={colors} />
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
                    value={item.estimatedValue}
                    onChangeText={(v) => updateJewItem(idx, 'estimatedValue', v)}
                    keyboardType="numeric"
                    placeholder="e.g. 45000"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.navy }, createLoan.isPending && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={createLoan.isPending}
          activeOpacity={0.85}
        >
          {createLoan.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Feather name="check" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Create Loan</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Customer Selection Modal */}
      <Modal visible={customerModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          <View style={[styles.modalTopBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Select Customer</Text>
            <TouchableOpacity onPress={() => setCustomerModal(false)}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <View style={[styles.modalSearch, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.modalSearchInput, { color: colors.foreground }]}
              placeholder="Search customers..."
              placeholderTextColor={colors.mutedForeground}
              value={customerSearch}
              onChangeText={setCustomerSearch}
            />
          </View>
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.customerRow, { borderBottomColor: colors.border }]}
                onPress={() => selectCustomer(item.id, item.name)}
              >
                <View style={[styles.customerAvatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {item.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.customerRowName, { color: colors.foreground }]}>{item.name}</Text>
                  <Text style={[styles.customerRowPhone, { color: colors.mutedForeground }]}>{item.phone}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }}>No customers found</Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

function FieldLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14, gap: 10 },
  sectionHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter_400Regular' },
  row: { flexDirection: 'row', gap: 10 },
  toggleRow: { flexDirection: 'row', gap: 8 },
  toggleChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  seg3: { flexDirection: 'row', gap: 4, alignSelf: 'center' },
  segBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E5E7EB' },
  selectBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  selectBtnText: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  addJewBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  jewCard: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 8 },
  jewCardHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jewCardTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  jewTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  jewTypeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, paddingVertical: 16, marginTop: 4 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  modalRoot: { flex: 1 },
  modalTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  modalSearch: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, margin: 16, paddingHorizontal: 12, height: 42 },
  modalSearchInput: { flex: 1, fontSize: 14, fontFamily: 'Inter_400Regular' },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  customerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  customerRowName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  customerRowPhone: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  center: { padding: 40, alignItems: 'center' },
});
