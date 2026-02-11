# Sistema de Tema - SISGES

Este documento descreve o sistema de tema implementado no SISGES, incluindo a paleta de cores e como utilizá-la.

## 🎨 Paleta de Cores

### Light Mode (Modo Claro)

- **Background**: `#FFFFFF` - Fundo principal da aplicação
- **Surface**: `#F1F5F9` - Superfícies de cards e componentes
- **Border**: `#E2E8F0` - Bordas e divisores
- **Text Primary**: `#0F172A` - Texto principal
- **Text Secondary**: `#475569` - Texto secundário
- **Text Muted**: `#94A3B8` - Texto desabilitado/muted
- **Primary**: `#2563EB` - Cor primária de ação
- **Primary Hover**: `#1D4ED8` - Estado hover do primary
- **Accent**: `#22C55E` - Cor de destaque
- **Error**: `#EF4444` - Mensagens de erro
- **Warning**: `#F59E0B` - Mensagens de aviso
- **Success**: `#16A34A` - Mensagens de sucesso

### Dark Mode (Modo Escuro)

- **Background**: `#020617` - Fundo principal da aplicação
- **Surface**: `#020617` - Superfícies de cards e componentes
- **Border**: `#1E293B` - Bordas e divisores
- **Text Primary**: `#E5E7EB` - Texto principal
- **Text Secondary**: `#CBD5F5` - Texto secundário
- **Text Muted**: `#64748B` - Texto desabilitado/muted
- **Primary**: `#3B82F6` - Cor primária de ação
- **Primary Hover**: `#2563EB` - Estado hover do primary
- **Accent**: `#22C55E` - Cor de destaque
- **Error**: `#F87171` - Mensagens de erro
- **Warning**: `#FBBF24` - Mensagens de aviso
- **Success**: `#4ADE80` - Mensagens de sucesso

## 📦 Estrutura de Arquivos

```
src/
├── themes/
│   ├── colors.ts          # Definições de cores (light/dark)
│   ├── theme.css          # Utilitários CSS do tema
│   └── README.md          # Esta documentação
├── contexts/
│   └── ThemeContext.tsx   # Context API para gerenciar tema
└── components/
    └── ThemeToggle/       # Componente para alternar tema
```

## 🚀 Como Usar

### 1. Usando Variáveis CSS

As cores estão disponíveis como variáveis CSS:

```css
.meu-componente {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

### 2. Usando Classes Utilitárias

Classes utilitárias estão disponíveis em `theme.css`:

```tsx
<div className="bg-surface text-primary border">
  Conteúdo aqui
</div>
```

### 3. Usando o Hook useTheme

Para acessar o tema programaticamente:

```tsx
import { useTheme } from '../contexts/ThemeContext'

function MeuComponente() {
  const { theme, mode, toggleTheme } = useTheme()
  
  return (
    <div style={{ backgroundColor: theme.background }}>
      <button onClick={toggleTheme}>
        Modo atual: {mode}
      </button>
    </div>
  )
}
```

### 4. Alternando o Tema

O componente `ThemeToggle` já está disponível e pode ser usado em qualquer lugar:

```tsx
import { ThemeToggle } from './components/ThemeToggle/ThemeToggle'

function App() {
  return (
    <div>
      <ThemeToggle />
      {/* resto do app */}
    </div>
  )
}
```

## 🎯 Classes Utilitárias Disponíveis

### Backgrounds
- `.bg-background` - Cor de fundo principal
- `.bg-surface` - Cor de superfície
- `.bg-primary` - Cor primária
- `.bg-accent` - Cor de destaque
- `.bg-error` - Cor de erro
- `.bg-warning` - Cor de aviso
- `.bg-success` - Cor de sucesso

### Textos
- `.text-primary` - Texto principal
- `.text-secondary` - Texto secundário
- `.text-muted` - Texto muted
- `.text-primary-action` - Cor primária aplicada ao texto
- `.text-accent` - Cor de destaque aplicada ao texto
- `.text-error` - Cor de erro aplicada ao texto
- `.text-warning` - Cor de aviso aplicada ao texto
- `.text-success` - Cor de sucesso aplicada ao texto

### Bordas
- `.border` - Borda padrão
- `.border-primary` - Borda primária
- `.border-error` - Borda de erro
- `.border-success` - Borda de sucesso

### Componentes
- `.btn-primary` - Botão primário
- `.btn-accent` - Botão accent
- `.card` - Card com estilo padrão
- `.alert-success` - Alerta de sucesso
- `.alert-warning` - Alerta de aviso
- `.alert-error` - Alerta de erro

## 🔄 Persistência

O tema escolhido pelo usuário é salvo automaticamente no `localStorage` e será restaurado na próxima visita. Se nenhuma preferência estiver salva, o sistema detecta a preferência do sistema operacional.

## ♿ Acessibilidade

- Todas as cores foram escolhidas para garantir contraste adequado (WCAG AA)
- O tema respeita a preferência do sistema (`prefers-color-scheme`)
- Transições suaves entre temas para melhor experiência do usuário

## 📝 Notas

- As variáveis CSS são aplicadas dinamicamente via JavaScript no `ThemeContext`
- O atributo `data-theme` no `<html>` controla qual conjunto de variáveis está ativo
- Transições de 0.3s garantem mudanças suaves entre temas
