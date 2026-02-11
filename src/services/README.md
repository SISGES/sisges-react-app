# Serviços de API e Autenticação

Este documento descreve os serviços de API e autenticação implementados no SISGES.

## 🔐 Autenticação JWT

O sistema utiliza autenticação baseada em JWT (JSON Web Tokens) para gerenciar sessões de usuário.

### Fluxo de Autenticação

1. **Login**: O usuário faz login com email e senha
2. **Token**: O backend retorna um JWT token
3. **Armazenamento**: O token é salvo no `localStorage`
4. **Requisições**: Todas as requisições autenticadas incluem o token no header `Authorization: Bearer <token>`
5. **Validação**: O token é validado a cada requisição e ao carregar a aplicação
6. **Expiração**: Tokens expirados são detectados e o usuário é deslogado automaticamente

### Estrutura de Arquivos

```
src/services/
├── api.ts              # Cliente HTTP com interceptors para JWT
└── authService.ts      # Funções de autenticação (login, logout, validação)
```

## 📡 API Service (`api.ts`)

Cliente HTTP centralizado que:
- Adiciona automaticamente o token JWT em todas as requisições
- Trata erros 401 (não autorizado) automaticamente
- Redireciona para login quando o token é inválido

### Uso

```typescript
import api from './services/api'

// GET request
const data = await api.get<User[]>('/users')

// POST request
const newUser = await api.post<User>('/users', { name: 'João', email: 'joao@email.com' })

// PUT request
const updated = await api.put<User>('/users/1', { name: 'João Silva' })

// DELETE request
await api.delete('/users/1')
```

## 🔑 Auth Service (`authService.ts`)

Funções para gerenciar autenticação:

### `login(credentials: LoginCredentials): Promise<LoginResponse>`
Faz login e salva token no localStorage.

```typescript
import { login } from './services/authService'

try {
  const response = await login({ email: 'user@email.com', password: 'senha123' })
  console.log('Usuário logado:', response.user)
} catch (error) {
  console.error('Erro no login:', error)
}
```

### `logout(): void`
Remove token e dados do usuário do localStorage.

```typescript
import { logout } from './services/authService'
logout()
```

### `isAuthenticated(): boolean`
Verifica se há um token válido (não expirado).

```typescript
import { isAuthenticated } from './services/authService'
if (isAuthenticated()) {
  // Usuário está autenticado
}
```

### `getCurrentUser(): User | null`
Retorna os dados do usuário atual do localStorage.

```typescript
import { getCurrentUser } from './services/authService'
const user = getCurrentUser()
if (user) {
  console.log('Usuário atual:', user.name)
}
```

### `validateToken(): Promise<boolean>`
Valida o token com o backend.

```typescript
import { validateToken } from './services/authService'
const isValid = await validateToken()
```

## 🌐 Configuração da API

A URL base da API é configurada via variável de ambiente:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Por padrão, se não configurada, usa `http://localhost:8080/api`.

## 📋 Endpoints Esperados do Backend

### POST `/api/auth/login`
Faz login do usuário.

**Request:**
```json
{
  "email": "user@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@email.com",
    "name": "Nome do Usuário",
    "role": "admin"
  }
}
```

### GET `/api/auth/validate`
Valida o token JWT atual.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": "123",
    "email": "user@email.com",
    "name": "Nome do Usuário"
  }
}
```

## 🔒 Segurança

- Tokens são armazenados no `localStorage` (considerar `httpOnly` cookies em produção)
- Tokens expirados são detectados e removidos automaticamente
- Requisições com token inválido (401) redirecionam para login
- Validação de token ao carregar a aplicação

## ⚠️ Tratamento de Erros

- Erros de autenticação são capturados e exibidos ao usuário
- Tokens inválidos ou expirados são removidos automaticamente
- Usuário é redirecionado para login em caso de erro 401

## 📝 Notas

- O token JWT é decodificado no frontend apenas para verificar expiração (não valida assinatura)
- A validação real da assinatura é feita pelo backend
- Em produção, considere usar refresh tokens para melhor segurança
