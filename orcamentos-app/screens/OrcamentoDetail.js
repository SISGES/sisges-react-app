import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  purpleBase,
  gray100,
  gray200,
  gray400,
  gray500,
  gray600,
  gray700,
  successLight,
  successDark,
  dangerBase,
} from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/safeSpacing';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { formatCurrency, calcularTotalOrcamento } from '../utils/orcamentoFormat';

export function OrcamentoDetail({
  orcamento,
  onBack,
  onEdit,
  onDuplicate,
  onDelete,
  onShare,
}) {
  const { subtotal, desconto, total } = calcularTotalOrcamento(orcamento);
  const pct = orcamento.percentualDesconto;

  const confirmDelete = () => {
    Alert.alert('Excluir', 'Deseja excluir este orçamento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={purpleBase} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.idText}>Orçamento #{orcamento.id.slice(-6).toUpperCase()}</Text>
          <StatusBadge status={orcamento.status} />
        </View>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.titulo}>{orcamento.titulo}</Text>
          <Text style={styles.cliente}>{orcamento.cliente}</Text>
          <Text style={styles.meta}>Criado em {orcamento.dataCriacao}</Text>
          <Text style={styles.meta}>Atualizado em {orcamento.dataAtualizacao}</Text>
        </View>
        <Text style={styles.section}>Serviços inclusos</Text>
        {orcamento.itens.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTit}>{item.titulo ?? item.descricao}</Text>
              <Text style={styles.itemDesc} numberOfLines={2}>
                {item.descricao}
              </Text>
            </View>
            <Text style={styles.itemPrice}>
              {formatCurrency(item.precoUnitario * item.quantidade)}
            </Text>
          </View>
        ))}
        <Text style={styles.section}>Investimento</Text>
        <View style={styles.invest}>
          <View style={styles.row}>
            <Text style={styles.rowLab}>Subtotal</Text>
            <Text style={styles.rowVal}>{formatCurrency(subtotal)}</Text>
          </View>
          {pct != null && pct > 0 ? (
            <View style={styles.row}>
              <View style={styles.offBadge}>
                <Text style={styles.offText}>{pct}% off</Text>
              </View>
              <Text style={styles.disc}>- {formatCurrency(desconto)}</Text>
            </View>
          ) : null}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLab}>Valor total</Text>
            <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolBtn} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={22} color={gray600} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={onDuplicate}>
          <Ionicons name="copy-outline" size={22} color={gray600} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={onEdit}>
          <Ionicons name="pencil" size={22} color={gray600} />
        </TouchableOpacity>
        <Button
          title="Compartilhar"
          onPress={onShare}
          icon={<Ionicons name="paper-plane" size={18} color="#FFF" />}
          style={{ flex: 1, marginLeft: spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: gray100 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: 52,
    paddingBottom: spacing.sm,
  },
  topCenter: { alignItems: 'center', flex: 1 },
  idText: { ...typography.titleSm, color: gray700, marginBottom: spacing.xs },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: gray200,
    marginBottom: spacing.lg,
  },
  titulo: { ...typography.titleLg, color: gray700 },
  cliente: { ...typography.textMd, color: gray500, marginTop: spacing.xs },
  meta: { ...typography.textSm, color: gray400, marginTop: spacing.sm },
  section: { ...typography.titleSm, color: gray700, marginBottom: spacing.sm },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: gray200,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  itemTit: { ...typography.titleSm, color: gray700 },
  itemDesc: { ...typography.textSm, color: gray500, marginTop: 2 },
  itemPrice: { ...typography.titleSm, color: gray700 },
  invest: {
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: gray200,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rowLab: { ...typography.textMd, color: gray600 },
  rowVal: { ...typography.titleSm, color: gray700 },
  offBadge: {
    backgroundColor: successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  offText: { ...typography.textXs, color: successDark, fontWeight: '700' },
  disc: { ...typography.textSm, color: dangerBase },
  totalRow: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: gray200,
  },
  totalLab: { ...typography.titleMd, color: gray700 },
  totalVal: { ...typography.titleLg, color: purpleBase },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: gray200,
    gap: spacing.sm,
  },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
