import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { purpleBase, gray100, gray200, gray400, gray600, gray700, dangerBase } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/spacing';
import { Button } from './Button';
import { FieldInput } from './FieldInput';

export function ServiceModal({
  visible,
  onClose,
  initial,
  onSave,
  onDelete,
}) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [qtd, setQtd] = useState('1');

  useEffect(() => {
    if (!visible) return;
    if (initial) {
      setTitulo(initial.titulo ?? '');
      setDescricao(initial.descricao ?? '');
      setPreco(String(initial.precoUnitario));
      setQtd(String(initial.quantidade));
    } else {
      setTitulo('');
      setDescricao('');
      setPreco('');
      setQtd('1');
    }
  }, [visible, initial?.id]);

  const handleSave = () => {
    const p = parseFloat(preco.replace(',', '.')) || 0;
    const q = parseInt(qtd, 10) || 1;
    const nome = titulo.trim() || descricao.trim();
    if (!nome) return;
    onSave({
      id: initial?.id ?? `i_${Date.now()}`,
      titulo: titulo.trim() || descricao.trim(),
      descricao: descricao.trim() || titulo.trim(),
      quantidade: q,
      precoUnitario: p,
    });
    onClose();
  };

  const inc = (d) => {
    const n = Math.max(1, (parseInt(qtd, 10) || 1) + d);
    setQtd(String(n));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>Serviço</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={gray700} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <FieldInput
              label="Nome do serviço"
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex: Design de interfaces"
            />
            <FieldInput
              label="Descrição"
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Detalhes do serviço"
              multiline
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Preço unitário</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.rs}>R$</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={preco}
                    onChangeText={setPreco}
                    placeholder="0,00"
                    placeholderTextColor={gray400}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Quantidade</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => inc(-1)}>
                    <Ionicons name="remove" size={20} color={purpleBase} />
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{qtd}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => inc(1)}>
                    <Ionicons name="add" size={20} color={purpleBase} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            {initial && onDelete ? (
              <TouchableOpacity style={styles.trash} onPress={onDelete}>
                <Ionicons name="trash-outline" size={24} color={dangerBase} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
            <Button title="Salvar" onPress={handleSave} style={{ flex: 1 }} />
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
    maxHeight: '92%',
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
  body: { padding: spacing.lg, maxHeight: 420 },
  row: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  half: { flex: 1 },
  label: { ...typography.textSm, color: gray600, marginBottom: spacing.xs },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: gray200,
    borderRadius: radius.md,
    backgroundColor: gray100,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  rs: { ...typography.textMd, color: gray600, marginRight: spacing.xs },
  priceInput: { flex: 1, ...typography.textMd, color: gray700, paddingVertical: spacing.sm },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: gray200,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  qtyBtn: { padding: spacing.sm },
  qtyVal: { ...typography.titleMd, color: gray700, minWidth: 28, textAlign: 'center' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: gray200,
  },
  trash: { padding: spacing.sm },
});
