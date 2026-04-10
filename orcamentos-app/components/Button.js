import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { purpleBase, dangerBase } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/safeSpacing';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled,
  loading,
}) {
  const v = {
    primary: { bg: purpleBase, border: purpleBase, color: '#FFF', borderW: 0 },
    secondary: { bg: 'transparent', border: purpleBase, color: purpleBase, borderW: 1.5 },
    danger: { bg: 'transparent', border: dangerBase, color: dangerBase, borderW: 1.5 },
  }[variant];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderColor: v.border, borderWidth: v.borderW },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={v.color} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: v.color }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    gap: spacing.sm,
    minHeight: 48,
  },
  label: { ...typography.textMd, fontWeight: '600' },
  disabled: { opacity: 0.45 },
});
