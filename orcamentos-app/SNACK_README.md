# Importar no Expo Snack

O Snack **não abre um ZIP** direto. Você pode:

1. **GitHub:** suba esta pasta `orcamentos-app` em um repositório e no Snack use **Import from GitHub** com a URL do repo (e caminho da pasta, se necessário).
2. **Manual:** crie um Snack novo (template **Blank (TypeScript)**), cole o `package.json` de dependências abaixo e recrie a árvore de arquivos (copie o conteúdo de cada arquivo do repositório).

## Dependências (cole em `package.json` no Snack)

Ajuste as versões se o Snack sugerir outras compatíveis com o SDK do projeto (ex.: SDK 54).

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "expo-status-bar": "~3.0.0",
    "expo-font": "~13.0.0",
    "expo-splash-screen": "~0.29.0",
    "@expo-google-fonts/lato": "^0.2.3",
    "@expo/vector-icons": "^14.0.0",
    "react": "18.3.1",
    "react-native": "0.76.3"
  }
}
```

Se o Snack reclamar de versão, use o botão **“Add dependency”** e deixe o Snack resolver versões para o SDK escolhido. Pacotes obrigatórios:

- `@expo-google-fonts/lato`
- `expo-font`
- `expo-splash-screen`
- `@expo/vector-icons` (geralmente já vem com Expo)

## Árvore de arquivos

```
App.tsx
types/index.ts
theme/colors.ts
theme/spacing.ts
theme/fonts.ts
theme/typography.ts
utils/format.ts
components/Button.tsx
components/FieldInput.tsx
components/StatusBadge.tsx
components/BudgetCard.tsx
components/FilterSortModal.tsx
components/ServiceModal.tsx
screens/OrcamentosList.tsx
screens/OrcamentoForm.tsx
screens/OrcamentoDetail.tsx
```

No Snack: **Create file** / pastas com o mesmo caminho (`theme/colors.ts`, etc.). O entry point deve ser `App.tsx` (em Project settings, confira se **Entry** é `App`).

## Observação

O arquivo `index.ts` do template local (`registerRootComponent`) no Snack costuma ser substituído pelo próprio Snack — em geral basta manter só `App.tsx` como raiz visível.
