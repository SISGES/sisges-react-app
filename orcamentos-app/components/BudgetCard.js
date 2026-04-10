import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { gray200, gray400, gray700 } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, calcularTotalOrcamento } from '../utils/format';

export function BudgetCard({ orcamento, onPress }) {
  const { total } = calcularTotalOrcamento(orcamento);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.header}>
        <Text style={styles.titulo} numberOfLines={2}>
          {orcamento.titulo}
        </Text>
        <StatusBadge status={orcamento.status} />
      </View>
      <Text style={styles.cliente} numberOfLines={1}>
        {orcamento.cliente}
      </Text>
      <Text style={styles.valor}>{formatCurrency(total)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: gray200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titulo: { ...typography.titleMd, color: gray700, flex: 1 },
  cliente: { ...typography.textSm, color: gray400, marginTop: spacing.xs },
  valor: { ...typography.titleMd, color: gray700, marginTop: spacing.md, alignSelf: 'flex-end' },
});
