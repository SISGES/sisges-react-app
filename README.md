# SISGES - Sistema de Gestão Escolar

Aplicação React moderna para gestão escolar.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **React Router** - Roteamento para aplicações React

## 📦 Instalação

```bash
npm install
```

## 🛠️ Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 🏃 Executando o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
sisges-react-app/
├── src/
│   ├── main.tsx          # Ponto de entrada da aplicação
│   ├── App.tsx           # Componente principal
│   └── index.css         # Estilos globais
├── index.html            # HTML principal
├── package.json          # Dependências do projeto
├── tsconfig.json         # Configuração TypeScript
└── vite.config.ts        # Configuração Vite
```

## 📝 Licença

Este projeto é privado.

## Testes automatizados

Com os repositórios `frontend` e `backend` lado a lado, execute na pasta do frontend:

```bash
npm ci
npm run test:all
```

A suíte usa Node.js 22, Go 1.24 ou superior com compilador C para o detector de corridas, PostgreSQL 16 com ferramentas de servidor e cliente, Bash, curl e as dependências de sistema do Cypress. Use uma conta de sistema comum para executar o `initdb`. Defina `PG_BINDIR` se os binários do servidor estiverem fora do PATH e o `pg_config` não apontar para eles. Use `SISGES_BACKEND_DIR` para indicar outro checkout do backend.

O comando cria um cluster temporário com bancos separados para a API, o encerramento do ano letivo e o navegador, aplica as migrações, inicia a API com dados de demonstração e serve o build do frontend. As portas HTTP são escolhidas na execução. O cluster e os serviços são encerrados ao final.

| Comando | Cobertura |
| --- | --- |
| `npm test` | Datas de formulários e eventos, autenticação e restauração da sessão |
| `npm run cypress:run:mock` | Interface com respostas HTTP simuladas, incluindo erros, teclado, navegação móvel e recuperação |
| `npm run cypress:run:integration` | Jornadas reais de administrador, professor e aluno no navegador, com a API Go e o PostgreSQL |
| `npm run test:all` | Testes Go com PostgreSQL e detector de corridas, lint, testes unitários do frontend, TypeScript, build e as duas suítes de navegador |

Os comandos Cypress individuais esperam o frontend ativo em `http://localhost:3000`, configurável por `CYPRESS_BASE_URL`. Para a suíte de integração individual, use uma instância descartável com a carga de demonstração original. Ela altera cadastros, horários, notas e frequência. Copie `cypress/cypress.env.example.json` para `cypress/cypress.env.json` e configure a mesma URL da API no frontend e no Cypress. O comando completo configura as credenciais de teste automaticamente.

Pull requests do frontend executam os testes unitários e de interface simulada. Para executar a suíte completa no GitHub Actions, use **Run workflow** em **Frontend tests** e indique a revisão do backend desejada. Se o repositório do backend for privado, configure o segredo `SISGES_BACKEND_READ_TOKEN` com acesso de leitura a esse repositório.
