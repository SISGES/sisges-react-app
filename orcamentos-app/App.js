import { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { useFonts, Lato_400Regular, Lato_700Bold } from '@expo-google-fonts/lato';
import * as SplashScreen from 'expo-splash-screen';
import { OrcamentosList } from './screens/OrcamentosList';
import { OrcamentoForm } from './screens/OrcamentoForm';
import { OrcamentoDetail } from './screens/OrcamentoDetail';
import { gerarId } from './utils/orcamentoFormat';

SplashScreen.preventAutoHideAsync().catch(() => {});

const SEED = [
  {
    id: 'seed-1',
    titulo: 'Desenvolvimento de aplicativo de loja online',
    cliente: 'Soluções Tecnológicas Beta',
    itens: [
      {
        id: 'si1',
        titulo: 'Desenvolvimento',
        descricao: 'App completo',
        quantidade: 1,
        precoUnitario: 22300,
      },
    ],
    status: 'Aprovado',
    dataCriacao: '2025-01-15',
    dataAtualizacao: '2025-02-01',
  },
  {
    id: 'seed-2',
    titulo: 'Consultoria em marketing digital',
    cliente: 'Marketing Wizards',
    itens: [
      {
        id: 'si2',
        titulo: 'Consultoria',
        descricao: 'Estratégia digital',
        quantidade: 1,
        precoUnitario: 4000,
      },
    ],
    status: 'Rascunho',
    dataCriacao: '2025-02-10',
    dataAtualizacao: '2025-02-10',
  },
];

export default function App() {
  const [fontsLoaded] = useFonts({ Lato_400Regular, Lato_700Bold });
  const [nav, setNav] = useState({ screen: 'list' });
  const [orcamentos, setOrcamentos] = useState(SEED);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const navigate = useCallback((n) => setNav(n), []);

  const salvarOrcamento = (o) => {
    setOrcamentos((prev) => {
      const idx = prev.findIndex((x) => x.id === o.id);
      if (idx >= 0) {
        const n = [...prev];
        n[idx] = o;
        return n;
      }
      return [o, ...prev];
    });
    setNav({ screen: 'detail', id: o.id });
  };

  const duplicar = (o) => {
    const agora = new Date().toISOString().split('T')[0];
    const novo = {
      ...o,
      id: gerarId(),
      titulo: `${o.titulo} (cópia)`,
      status: 'Rascunho',
      dataCriacao: agora,
      dataAtualizacao: agora,
      itens: o.itens.map((i) => ({ ...i, id: gerarId() })),
    };
    setOrcamentos((prev) => [novo, ...prev]);
    setNav({ screen: 'detail', id: novo.id });
    Alert.alert('Duplicado', 'Uma cópia em rascunho foi criada.');
  };

  const excluir = (id) => {
    setOrcamentos((prev) => prev.filter((o) => o.id !== id));
    setNav({ screen: 'list' });
  };

  const compartilhar = (o) => {
    const texto = `${o.titulo}\nCliente: ${o.cliente}\nStatus: ${o.status}`;
    Alert.alert('Compartilhar', texto);
  };

  if (!fontsLoaded) return null;

  if (nav.screen === 'form') {
    return (
      <>
        <StatusBar style="dark" />
        <OrcamentoForm
          orcamentoId={nav.id}
          orcamentos={orcamentos}
          onSave={salvarOrcamento}
          onCancel={() =>
            nav.id
              ? setNav({ screen: 'detail', id: nav.id })
              : setNav({ screen: 'list' })
          }
        />
      </>
    );
  }

  if (nav.screen === 'detail') {
    const o = orcamentos.find((x) => x.id === nav.id);
    if (!o) {
      return (
        <>
          <StatusBar style="dark" />
          <OrcamentosList orcamentos={orcamentos} setOrcamentos={setOrcamentos} navigate={navigate} />
        </>
      );
    }
    return (
      <>
        <StatusBar style="dark" />
        <OrcamentoDetail
          orcamento={o}
          onBack={() => setNav({ screen: 'list' })}
          onEdit={() => setNav({ screen: 'form', id: o.id })}
          onDuplicate={() => duplicar(o)}
          onDelete={() => excluir(o.id)}
          onShare={() => compartilhar(o)}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <OrcamentosList
        orcamentos={orcamentos}
        setOrcamentos={setOrcamentos}
        navigate={navigate}
      />
    </>
  );
}
