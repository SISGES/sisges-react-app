import { View, Text, StyleSheet } from 'react-native';
import { statusColors } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/safeSpacing';

export function StatusBadge({ status }) {
  const c = statusColors[status];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { ...typography.textXs, fontWeight: '600' },
});
