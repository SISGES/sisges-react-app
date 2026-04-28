import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { purpleBase, gray200, gray500, gray600, gray700 } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/safeSpacing';
import { Button } from './Button';

const STATUS_LIST = ['Rascunho', 'Enviado', 'Aprovado', 'Recusado'];

const SORT_LABELS = {
  recent: 'Mais recente',
  oldest: 'Mais antigo',
  high: 'Maior valor',
  low: 'Menor valor',
};

const SORT_KEYS = Object.keys(SORT_LABELS);

export function FilterSortModal({
  visible,
  onClose,
  selectedStatuses,
  onToggleStatus,
  sort,
  onSortChange,
  onReset,
  onApply,
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtrar e ordenar</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={gray700} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body}>
            <Text style={styles.section}>Status</Text>
            {STATUS_LIST.map((s) => {
              const on = selectedStatuses.has(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={styles.row}
                  onPress={() => onToggleStatus(s)}
                >
                  <View style={[styles.checkbox, on && styles.checkboxOn]}>
                    {on ? <Ionicons name="checkmark" size={14} color="#FFF" /> : null}
                  </View>
                  <Text style={styles.rowLabel}>{s}</Text>
                </TouchableOpacity>
              );
            })}
            <Text style={[styles.section, { marginTop: spacing.xl }]}>Ordenação</Text>
            {SORT_KEYS.map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.row}
                onPress={() => onSortChange(key)}
              >
                <View style={[styles.radio, sort === key && styles.radioOn]}>
                  {sort === key ? <View style={styles.radioDot} /> : null}
                </View>
                <Text style={styles.rowLabel}>{SORT_LABELS[key]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={onReset}>
              <Text style={styles.reset}>Resetar filtros</Text>
            </TouchableOpacity>
            <Button
              title="Aplicar"
              onPress={() => {
                onApply();
                onClose();
              }}
              style={styles.applyBtn}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '88%',
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: gray200,
  },
  title: { ...typography.titleLg, color: purpleBase },
  body: { padding: spacing.lg },
  section: { ...typography.titleSm, color: gray700, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: gray500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: purpleBase, borderColor: purpleBase },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: gray500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: purpleBase },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: purpleBase },
  rowLabel: { ...typography.textMd, color: gray700 },
  footer: { paddingHorizontal: spacing.lg, gap: spacing.md },
  reset: { ...typography.textMd, color: gray600, textAlign: 'center', paddingVertical: spacing.sm },
  applyBtn: { width: '100%' },
});
