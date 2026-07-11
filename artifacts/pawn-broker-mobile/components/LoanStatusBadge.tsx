import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: '#D1FAE5', text: '#065F46' },
  overdue: { label: 'Overdue', bg: '#FEE2E2', text: '#991B1B' },
  closed: { label: 'Closed', bg: '#E5E7EB', text: '#374151' },
  auction: { label: 'Auction', bg: '#FEF3C7', text: '#92400E' },
  partially_paid: { label: 'Partial', bg: '#DBEAFE', text: '#1E40AF' },
};

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function LoanStatusBadge({ status, size = 'md' }: Props) {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: '#E5E7EB', text: '#374151' };
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
          size === 'sm' && styles.textSm,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'capitalize',
  },
  textSm: {
    fontSize: 11,
  },
});
