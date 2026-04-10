import { View, Text, TextInput, StyleSheet } from 'react-native';
import { gray100, gray200, gray400, gray600, gray700, dangerBase } from '../theme/colors';
import { typography } from '../theme/typography';
import { fonts } from '../theme/fonts';
import { radius, spacing } from '../theme/spacing';

export function FieldInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  multiline,
  keyboardType,
  prefix,
  right,
}) {
  const borderColor = error ? dangerBase : gray200;
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.row, { borderColor }]}>
        {prefix ? (
          <Text style={[styles.prefix, error && { color: dangerBase }]}>{prefix}</Text>
        ) : null}
        <TextInput
          style={[styles.input, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={gray400}
          multiline={multiline}
          keyboardType={keyboardType}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  label: { ...typography.textSm, color: gray600, marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    backgroundColor: gray100,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  prefix: { ...typography.textMd, color: gray600, marginRight: spacing.xs },
  input: {
    flex: 1,
    ...typography.textMd,
    fontFamily: fonts.regular,
    color: gray700,
    paddingVertical: spacing.sm,
  },
  multiline: { minHeight: 88, textAlignVertical: 'top', paddingTop: spacing.md },
});
