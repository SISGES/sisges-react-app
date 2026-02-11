# Tipos TypeScript - SISGES

Este diretório contém todas as definições de tipos TypeScript usadas no projeto.

## 📁 Estrutura

```
src/types/
├── auth.ts          # Tipos de autenticação (login, registro, erros)
└── index.ts         # Barrel file para exportações
```

## 🔐 Tipos de Autenticação (`auth.ts`)

### Roles de Usuário

```typescript
type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT'
```

### Login

- **`LoginRequest`**: Dados para fazer login (email, password)
- **`LoginResponse`**: Resposta do backend após login (accessToken, tokenType, user)
- **`LoginResponseUserInfo`**: Informações do usuário na resposta de login

### Cadastro/Registro

- **`RegisterUserRequest`**: Dados para cadastrar novo usuário
- **`ResponsibleData`**: Dados do responsável legal (para estudantes)
- **`UserResponse`**: Resposta do backend após cadastro

### Erros da API

- **`ApiErrorMessage`**: Erro simples com mensagem única
- **`ApiValidationError`**: Erro de validação com lista de campos
- **`ApiError`**: Union type dos tipos de erro

### Tipos Auxiliares

- **`User`**: Tipo simplificado de usuário usado internamente no frontend
- **`LoginCredentials`**: Alias para `LoginRequest`

## 📝 Exemplos de Uso

### Login

```typescript
import { login } from '../services/authService'
import type { LoginRequest } from '../types/auth'

const credentials: LoginRequest = {
  email: 'usuario@exemplo.com',
  password: 'senha123'
}

try {
  const response = await login(credentials)
  console.log('Token:', response.accessToken)
  console.log('Usuário:', response.user)
} catch (error) {
  // Tratar erro
}
```

### Registro

```typescript
import { register } from '../services/authService'
import type { RegisterUserRequest } from '../types/auth'

const userData: RegisterUserRequest = {
  name: 'Maria Santos',
  email: 'maria@exemplo.com',
  register: '2024002',
  password: 'senha123',
  birthDate: '2010-05-15',
  gender: 'Feminino',
  role: 'STUDENT',
  classId: 1,
  responsibleData: {
    name: 'José Santos',
    phone: '71999999999',
    email: 'jose@exemplo.com'
  }
}

try {
  const newUser = await register(userData)
  console.log('Usuário criado:', newUser)
} catch (error) {
  // Tratar erro
}
```

### Tratamento de Erros

```typescript
import { isValidationError, getErrorMessage } from '../services/authService'
import type { ApiValidationError } from '../types/auth'

try {
  await login(credentials)
} catch (error) {
  if (isValidationError(error)) {
    // Erro de validação - mostrar erros por campo
    error.errors.forEach(({ field, message }) => {
      console.log(`${field}: ${message}`)
    })
  } else {
    // Erro simples - mostrar mensagem única
    console.error(getErrorMessage(error))
  }
}
```

## 🔗 Referências

- Documentação completa: `c:\projects\sisges-sboot-app\docs\FRONTEND_AUTH_TYPES.md`
- Serviços relacionados: `src/services/authService.ts`
- Contexto de autenticação: `src/contexts/AuthContext.tsx`
