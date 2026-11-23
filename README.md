# Portal escolar do SISGES

O cliente em React e TypeScript atende administradores, professores e alunos. Ele se conecta à API Go do SISGES para matrícula, grade horária, registro de aulas, avaliação, frequência e comunicação escolar.

Consulte o [manual técnico](docs/README.md) para preparar o ambiente local, conferir requisitos e contratos da API, executar os testes e entender as limitações conhecidas da integração. As orientações de uso da identidade visual acompanham o [kit de marca](brand/open-book/README.md).

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

As propostas de alteração para a branch `main` executam os testes unitários e de navegador com respostas simuladas. A publicação na `main` passa pela suíte integrada, que também pode ser executada manualmente na esteira **Testes do frontend**.
