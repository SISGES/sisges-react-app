import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  purpleBase,
  purpleLight,
  gray100,
  gray200,
  gray400,
  gray500,
  gray600,
  gray700,
  dangerBase,
} from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/safeSpacing';
import { Button } from '../components/Button';
import { FieldInput } from '../components/FieldInput';
import { ServiceModal } from '../components/ServiceModal';
import { formatCurrency, gerarId, calcularTotalOrcamento } from '../utils/orcamentoFormat';

const STATUS_ORDER = ['Rascunho', 'Enviado', 'Aprovado', 'Recusado'];

export function OrcamentoForm({ orcamentoId, orcamentos, onSave, onCancel }) {
  const existente = orcamentoId
    ? orcamentos.find((o) => o.id === orcamentoId)
    : undefined;

  const [titulo, setTitulo] = useState('');
  const [cliente, setCliente] = useState('');
  const [status, setStatus] = useState('Rascunho');
  const [itens, setItens] = useState([]);
  const [descontoPct, setDescontoPct] = useState('');
  const [modalItem, setModalItem] = useState(null);

  useEffect(() => {
    if (existente) {
      setTitulo(existente.titulo);
      setCliente(existente.cliente);
      setStatus(existente.status);
      setItens(existente.itens.map((i) => ({ ...i })));
      setDescontoPct(
        existente.percentualDesconto != null ? String(existente.percentualDesconto) : ''
      );
    } else {
      setTitulo('');
      setCliente('');
      setStatus('Rascunho');
      setItens([]);
      setDescontoPct('');
    }
  }, [orcamentoId, existente?.id]);

  const pct = parseFloat(descontoPct.replace(',', '.')) || 0;
  const draft = {
    id: existente?.id ?? 'temp',
    titulo,
    cliente,
    itens,
    percentualDesconto: pct > 0 ? pct : undefined,
    status,
    dataCriacao: existente?.dataCriacao ?? '',
    dataAtualizacao: existente?.dataAtualizacao ?? '',
  };
  const { subtotal, desconto, total } = calcularTotalOrcamento(draft);

  const abrirNovoServico = () => setModalItem('new');

  const salvarItem = (item) => {
    setItens((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) {
        const n = [...prev];
        n[idx] = item;
        return n;
      }
      return [...prev, item];
    });
  };

  const removerItem = (id) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSalvar = () => {
    if (!titulo.trim()) {
      Alert.alert('Atenção', 'Informe o título.');
      return;
    }
    if (!cliente.trim()) {
      Alert.alert('Atenção', 'Informe o cliente.');
      return;
    }
    if (itens.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um serviço.');
      return;
    }
    const agora = new Date().toISOString().split('T')[0];
    const o = {
      id: existente?.id ?? gerarId(),
      titulo: titulo.trim(),
      cliente: cliente.trim(),
      itens: itens.map((i) => ({ ...i })),
      percentualDesconto: pct > 0 ? pct : undefined,
      status,
      dataCriacao: existente?.dataCriacao ?? agora,
      dataAtualizacao: agora,
    };
    onSave(o);
    Alert.alert('Salvo', `Orçamento "${o.titulo}" salvo com sucesso.`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <TouchableOpacity onPress={onCancel} style={styles.back} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={purpleBase} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Orçamento</Text>
        <View style={{ width: 26 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.section}>Informações gerais</Text>
        <FieldInput label="Título" value={titulo} onChangeText={setTitulo} placeholder="Título" />
        <FieldInput
          label="Cliente"
          value={cliente}
          onChangeText={setCliente}
          placeholder="Nome do cliente"
        />
        <Text style={styles.section}>Status</Text>
        <View style={styles.statusRow}>
          {STATUS_ORDER.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.statusChip, status === s && styles.statusChipOn]}
              onPress={() => setStatus(s)}
            >
              <View style={[styles.radio, status === s && styles.radioOn]}>
                {status === s ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={[styles.statusLabel, status === s && styles.statusLabelOn]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.section}>Serviços inclusos</Text>
        {itens.map((serv) => (
          <TouchableOpacity
            key={serv.id}
            style={styles.servicoCard}
            onPress={() => setModalItem(serv)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.servTitulo} numberOfLines={1}>
                {serv.titulo ?? serv.descricao}
              </Text>
              <Text style={styles.servDesc} numberOfLines={1}>
                {serv.descricao}
              </Text>
              <Text style={styles.servMeta}>
                {formatCurrency(serv.precoUnitario)} · Qt: {serv.quantidade}
              </Text>
            </View>
            <Ionicons name="pencil" size={20} color={purpleBase} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addServ} onPress={abrirNovoServico}>
          <Ionicons name="add-circle-outline" size={22} color={purpleBase} />
          <Text style={styles.addServText}>Adicionar serviço</Text>
        </TouchableOpacity>
        <Text style={styles.section}>Investimento</Text>
        <View style={styles.investCard}>
          <View style={styles.investRow}>
            <Text style={styles.investLabel}>
              Subtotal ({itens.length} {itens.length === 1 ? 'item' : 'itens'})
            </Text>
            <Text style={styles.investVal}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.discRow}>
            <FieldInput
              label="Desconto (%)"
              value={descontoPct}
              onChangeText={setDescontoPct}
              placeholder="0"
              keyboardType="decimal-pad"
            />
            {desconto > 0 ? (
              <Text style={styles.discVal}>- {formatCurrency(desconto)}</Text>
            ) : null}
          </View>
          <View style={[styles.investRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Valor total</Text>
            <Text style={styles.totalVal}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Cancelar" variant="secondary" onPress={onCancel} style={{ flex: 1 }} />
        <Button title="Salvar" onPress={handleSalvar} style={{ flex: 1 }} />
      </View>
      <ServiceModal
        visible={modalItem !== null}
        onClose={() => setModalItem(null)}
        initial={modalItem === 'new' ? null : modalItem}
        onSave={salvarItem}
        onDelete={
          modalItem && modalItem !== 'new'
            ? () => {
                removerItem(modalItem.id);
                setModalItem(null);
              }
            : undefined
        }
      />
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
  back: { padding: spacing.xs },
  screenTitle: { ...typography.titleLg, color: purpleBase },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: { ...typography.titleSm, color: gray700, marginTop: spacing.md, marginBottom: spacing.sm },
  statusRow: { gap: spacing.sm },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#FFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: gray200,
    gap: spacing.md,
  },
  statusChipOn: { borderColor: purpleBase, backgroundColor: purpleLight },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: gray500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: purpleBase },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: purpleBase },
  statusLabel: { ...typography.textMd, color: gray600 },
  statusLabelOn: { color: gray700, fontWeight: '600' },
  servicoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: gray200,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  servTitulo: { ...typography.titleSm, color: gray700 },
  servDesc: { ...typography.textSm, color: gray500, marginTop: 2 },
  servMeta: { ...typography.textSm, color: gray600, marginTop: 4 },
  addServ: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderWidth: 1.5,
    borderColor: purpleBase,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  addServText: { ...typography.textMd, color: purpleBase, fontWeight: '600' },
  investCard: {
    backgroundColor: '#FFF',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: gray200,
  },
  investRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  investLabel: { ...typography.textMd, color: gray600 },
  investVal: { ...typography.titleSm, color: gray700 },
  discRow: { marginBottom: spacing.sm },
  discVal: { ...typography.textSm, color: dangerBase, textAlign: 'right', marginTop: -spacing.sm },
  totalRow: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: gray200 },
  totalLabel: { ...typography.titleMd, color: gray700 },
  totalVal: { ...typography.titleLg, color: purpleBase },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: gray200,
  },
});
