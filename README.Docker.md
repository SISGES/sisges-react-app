# Docker Setup - SISGES React App

Este projeto inclui configuração Docker para desenvolvimento e produção.

## Arquivos Docker

- `Dockerfile` - Build de produção com Nginx (apenas frontend)
- `Dockerfile.dev` - Ambiente de desenvolvimento com hot-reload (apenas frontend)
- `docker-compose.yml` - Compose para produção (apenas frontend)
- `docker-compose.dev.yml` - Compose para desenvolvimento (apenas frontend)
- `docker-compose.full.yml` - Compose completo (frontend + backend + banco)
- `docker-compose.dev.full.yml` - Compose completo para desenvolvimento
- `Dockerfile.backend.example` - Exemplo de Dockerfile para o backend
- `nginx.conf` - Configuração do Nginx para produção
- `.dockerignore` - Arquivos ignorados no build

## Pré-requisitos

- Docker instalado
- Docker Compose instalado

## Setup Completo (Frontend + Backend + Banco)

### Desenvolvimento
```bash
docker-compose -f docker-compose.dev.full.yml up --build
```

### Produção
```bash
docker-compose -f docker-compose.full.yml up --build
```

Serviços disponíveis:
- Frontend: `http://localhost:5173` (dev) ou `http://localhost:3000` (prod)
- Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432`

## Setup Apenas Frontend

### Desenvolvimento

Para rodar em modo desenvolvimento com hot-reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

A aplicação estará disponível em `http://localhost:5173`

### Produção

Para buildar e rodar em produção:

```bash
docker-compose up --build
```

A aplicação estará disponível em `http://localhost:3000`

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```
VITE_API_BASE_URL=http://localhost:8080
```

Ou ajuste no `docker-compose.yml`:

```yaml
environment:
  - VITE_API_BASE_URL=http://seu-backend:8080
```

## Configuração do Backend

1. Copie o arquivo `Dockerfile.backend.example` para o projeto backend
2. Ajuste conforme necessário (versão Java, comandos de build, etc.)
3. Ajuste os paths no `docker-compose.dev.full.yml` se necessário

Exemplo para Spring Boot com Maven:
```yaml
backend:
  build:
    context: ../sisges-backend  # Path para o projeto backend
    dockerfile: Dockerfile
```

## Variáveis de Ambiente Backend

Ajuste no `docker-compose.full.yml`:

```yaml
backend:
  environment:
    - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/sisges
    - SPRING_DATASOURCE_USERNAME=sisges
    - SPRING_DATASOURCE_PASSWORD=sisges123
    - JWT_SECRET=seu-secret-aqui
```

## Comandos Úteis

### Parar todos os containers
```bash
docker-compose -f docker-compose.full.yml down
```

### Ver logs de todos os serviços
```bash
docker-compose -f docker-compose.full.yml logs -f
```

### Ver logs de um serviço específico
```bash
docker-compose -f docker-compose.full.yml logs -f backend
docker-compose -f docker-compose.full.yml logs -f frontend
```

### Rebuild sem cache
```bash
docker-compose -f docker-compose.full.yml build --no-cache
```

### Executar comandos dentro do container
```bash
docker-compose -f docker-compose.full.yml exec frontend sh
docker-compose -f docker-compose.full.yml exec backend sh
docker-compose -f docker-compose.full.yml exec db psql -U sisges -d sisges
```

### Limpar volumes (apaga dados do banco)
```bash
docker-compose -f docker-compose.full.yml down -v
```

