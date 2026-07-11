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
} from 'react-native';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useCreateCustomer } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function NewCustomerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const createCustomer = useCreateCustomer();

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing fields', 'Name and phone number are required.');
      return;
    }
    try {
      await createCustomer.mutateAsync({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          whatsapp: whatsapp.trim() || undefined,
          email: email.trim() || undefined,
          aadhaarNumber: aadhaar.trim() || undefined,
          panNumber: pan.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          pincode: pincode.trim() || undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Customer created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to create customer. Please try again.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: isWeb ? 100 : insets.bottom + 80,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Basic Info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Basic Information</Text>

        <Field label="Full Name *" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rajesh Kumar"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="words"
          />
        </Field>

        <Field label="Phone Number *" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 9876543210"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />
        </Field>

        <Field label="WhatsApp Number" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={whatsapp}
            onChangeText={setWhatsapp}
            placeholder="Same as phone if same"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
          />
        </Field>

        <Field label="Email Address" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>
      </View>

      {/* Identity */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Identity Documents</Text>

        <Field label="Aadhaar Number" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={aadhaar}
            onChangeText={setAadhaar}
            placeholder="12-digit Aadhaar"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            maxLength={12}
          />
        </Field>

        <Field label="PAN Number" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={pan}
            onChangeText={(v) => setPan(v.toUpperCase())}
            placeholder="ABCDE1234F"
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
            maxLength={10}
          />
        </Field>
      </View>

      {/* Address */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Address</Text>

        <Field label="Street Address" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border, height: 60, textAlignVertical: 'top', paddingTop: 10 }]}
            value={address}
            onChangeText={setAddress}
            placeholder="House no, street, area"
            placeholderTextColor={colors.mutedForeground}
            multiline
          />
        </Field>

        <View style={styles.twoCol}>
          <View style={{ flex: 1 }}>
            <Field label="City" colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={city}
                onChangeText={setCity}
                placeholder="City"
                placeholderTextColor={colors.mutedForeground}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="State" colors={colors}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={state}
                onChangeText={setState}
                placeholder="State"
                placeholderTextColor={colors.mutedForeground}
              />
            </Field>
          </View>
        </View>

        <Field label="Pincode" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            value={pincode}
            onChangeText={setPincode}
            placeholder="6-digit pincode"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            maxLength={6}
          />
        </Field>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.navy }, createCustomer.isPending && { opacity: 0.7 }]}
        onPress={handleSubmit}
        disabled={createCustomer.isPending}
        activeOpacity={0.85}
      >
        {createCustomer.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Feather name="user-plus" size={18} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Create Customer</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14, gap: 4 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 8 },
  field: { marginBottom: 10 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: 'Inter_400Regular' },
  twoCol: { flexDirection: 'row', gap: 10 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
