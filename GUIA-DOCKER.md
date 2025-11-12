# 🐳 Guia Rápido - Como Subir o Docker

## 📋 Pré-requisitos

1. Docker instalado e rodando
2. Docker Compose instalado
3. Projeto backend na pasta `../sisges-backend` (ou ajuste o path)

## 🚀 Passo a Passo

### 1. Verificar se Docker está rodando

```bash
docker --version
docker-compose --version
```

### 2. Preparar o Backend

O Dockerfile já foi criado em `C:\projects\sisges-sboot-app\Dockerfile` com as configurações corretas:
- Java 21
- Spring Boot 3.5.4
- Maven 3.9

### 3. Paths Configurados

Os paths já estão configurados:
- Frontend: `C:\projects\sisges-react-app` (context: `.`)
- Backend: `C:\projects\sisges-sboot-app` (context: `../sisges-sboot-app`)

### 4. Subir os Containers

#### Para Desenvolvimento (com hot-reload):
```bash
docker-compose -f docker-compose.dev.full.yml up --build
```

#### Para Produção:
```bash
docker-compose -f docker-compose.full.yml up --build
```

### 5. Aguardar os Serviços Iniciarem

Você verá logs de:
- ✅ PostgreSQL iniciando
- ✅ Backend compilando e iniciando
- ✅ Frontend buildando e iniciando

### 6. Acessar a Aplicação

- **Frontend (dev)**: http://localhost:5173
- **Frontend (prod)**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **PostgreSQL**: localhost:5432

## 🛠️ Comandos Úteis

### Ver logs em tempo real
```bash
docker-compose -f docker-compose.dev.full.yml logs -f
```

### Ver logs de um serviço específico
```bash
docker-compose -f docker-compose.dev.full.yml logs -f backend
docker-compose -f docker-compose.dev.full.yml logs -f frontend
docker-compose -f docker-compose.dev.full.yml logs -f db
```

### Parar os containers
```bash
docker-compose -f docker-compose.dev.full.yml down
```

### Parar e remover volumes (apaga dados do banco)
```bash
docker-compose -f docker-compose.dev.full.yml down -v
```

### Rebuildar sem cache
```bash
docker-compose -f docker-compose.dev.full.yml build --no-cache
docker-compose -f docker-compose.dev.full.yml up
```

### Ver containers rodando
```bash
docker ps
```

### Entrar no container do backend
```bash
docker-compose -f docker-compose.dev.full.yml exec backend sh
```

### Entrar no banco de dados
```bash
docker-compose -f docker-compose.dev.full.yml exec db psql -U sisges -d sisges
```

## ⚠️ Troubleshooting

### Erro: "Cannot connect to Docker daemon"
- Verifique se o Docker Desktop está rodando

### Erro: "context not found" no backend
- Verifique se o path `../sisges-backend` está correto
- Ou ajuste no docker-compose

### Erro: "port already in use"
- Pare outros serviços usando as portas 8080, 5173, 3000 ou 5432
- Ou altere as portas no docker-compose

### Backend não conecta ao banco
- Aguarde alguns segundos para o PostgreSQL inicializar
- Verifique os logs: `docker-compose logs db`

### Frontend não conecta ao backend
- Verifique se o backend está rodando: `docker ps`
- Verifique os logs do backend: `docker-compose logs backend`

## 📝 Notas

- Na primeira vez, o build pode demorar alguns minutos
- O banco de dados persiste os dados mesmo após parar os containers
- Use `down -v` apenas se quiser apagar os dados do banco

