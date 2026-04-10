import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { purpleBase, gray100, gray200, gray400, gray500, gray700 } from '../theme/colors';
import { typography } from '../theme/typography';
import { radius, spacing } from '../theme/safeSpacing';
import { Button } from '../components/Button';
import { BudgetCard } from '../components/BudgetCard';
import { FilterSortModal } from '../components/FilterSortModal';
import { calcularTotalOrcamento } from '../utils/orcamentoFormat';

export function OrcamentosList({ orcamentos, setOrcamentos, navigate }) {
  const [busca, setBusca] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(
    () => new Set(['Rascunho', 'Enviado', 'Aprovado', 'Recusado'])
  );
  const [sort, setSort] = useState('recent');
  const [draftStatuses, setDraftStatuses] = useState(
    () => new Set(['Rascunho', 'Enviado', 'Aprovado', 'Recusado'])
  );
  const [draftSort, setDraftSort] = useState('recent');

  const rascunhos = orcamentos.filter((o) => o.status === 'Rascunho').length;

  const lista = useMemo(() => {
    let rows = [...orcamentos];
    const statusFilter =
      selectedStatuses.size === 0
        ? null
        : selectedStatuses.size === 4
          ? null
          : selectedStatuses;
    if (statusFilter) {
      rows = rows.filter((o) => statusFilter.has(o.status));
    }
    if (busca.trim()) {
      const q = busca.toLowerCase();
      rows = rows.filter(
        (o) =>
          o.titulo.toLowerCase().includes(q) || o.cliente.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      const ta = calcularTotalOrcamento(a).total;
      const tb = calcularTotalOrcamento(b).total;
      const da = new Date(a.dataAtualizacao).getTime();
      const db = new Date(b.dataAtualizacao).getTime();
      switch (sort) {
        case 'recent':
          return db - da;
        case 'oldest':
          return da - db;
        case 'high':
          return tb - ta;
        case 'low':
          return ta - tb;
        default:
          return 0;
      }
    });
    return rows;
  }, [orcamentos, busca, selectedStatuses, sort]);

  const openFilter = () => {
    setDraftStatuses(new Set(selectedStatuses));
    setDraftSort(sort);
    setFilterOpen(true);
  };

  const toggleDraftStatus = (s) => {
    setDraftStatuses((prev) => {
      const n = new Set(prev);
      if (n.has(s)) n.delete(s);
      else n.add(s);
      return n;
    });
  };

  const resetFilters = () => {
    setDraftStatuses(new Set(['Rascunho', 'Enviado', 'Aprovado', 'Recusado']));
    setDraftSort('recent');
  };

  const applyFilters = () => {
    setSelectedStatuses(new Set(draftStatuses));
    setSort(draftSort);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Orçamentos</Text>
          <Text style={styles.subtitle}>
            Você tem {rascunhos} {rascunhos === 1 ? 'item' : 'itens'} em rascunho
          </Text>
        </View>
        <Button
          title="Novo"
          onPress={() => navigate({ screen: 'form', id: null })}
          icon={<Ionicons name="add" size={20} color="#FFF" />}
        />
      </View>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color={gray400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Título ou cliente"
            placeholderTextColor={gray400}
            value={busca}
            onChangeText={setBusca}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={openFilter}>
          <Ionicons name="options-outline" size={22} color={purpleBase} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {lista.length === 0 ? (
          <Text style={styles.empty}>Nenhum orçamento encontrado</Text>
        ) : (
          lista.map((o) => (
            <BudgetCard
              key={o.id}
              orcamento={o}
              onPress={() => navigate({ screen: 'detail', id: o.id })}
            />
          ))
        )}
      </ScrollView>
      <FilterSortModal
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedStatuses={draftStatuses}
        onToggleStatus={toggleDraftStatus}
        sort={draftSort}
        onSortChange={setDraftSort}
        onReset={resetFilters}
        onApply={applyFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: gray100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  title: { ...typography.titleLg, color: purpleBase },
  subtitle: { ...typography.textSm, color: gray500, marginTop: spacing.xs },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: gray200,
    paddingHorizontal: spacing.md,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, ...typography.textMd, color: gray700, paddingVertical: spacing.md },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  empty: { ...typography.textMd, color: gray500, textAlign: 'center', marginTop: spacing.xxl },
});
