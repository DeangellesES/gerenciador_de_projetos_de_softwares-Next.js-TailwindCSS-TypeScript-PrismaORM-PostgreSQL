# Gerenciador de Projetos

Aplicação web para organizar projetos de desenvolvimento, acompanhar progresso e
gerenciar tarefas em um quadro Kanban.

<h3>💻<a href="https://gerenciador-de-projetos-de-software.vercel.app/"> Acessar Site do Projeto Aqui</a></h3>

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19
- TypeScript
- Tailwind CSS
- Prisma 7 + PostgreSQL
- Better Auth (e-mail/senha e login com Google)

## Como rodar

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o `.env` a partir do exemplo e preencha a conexão e o segredo:

   ```bash
   cp .env.example .env
   ```

3. Aplique as migrações e (opcionalmente) os dados de demonstração:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

Acesse <http://localhost:3000>.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `DATABASE_URL` | String de conexão do PostgreSQL (aceita também `POSTGRES_PRISMA_URL`, `POSTGRES_URL`, `DATABASE_URL_POOLED`). |
| `BETTER_AUTH_SECRET` | Segredo do Better Auth (`openssl rand -base64 32`). |
| `BETTER_AUTH_URL` | URL base da aplicação. |
| `GOOGLE_CLIENT_ID` | Client ID do OAuth do Google (opcional; habilita o login com Google). |
| `GOOGLE_CLIENT_SECRET` | Client Secret do OAuth do Google (opcional; habilita o login com Google). |
| `SEED_USER_EMAIL` | E-mail do usuário que receberá os projetos de exemplo no seed. |

### Login com Google

1. Crie um projeto e credenciais OAuth em
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Em **URIs de redirecionamento autorizados**, cadastre:
   - Desenvolvimento: `http://localhost:3000/api/auth/callback/google`
   - Produção: `https://SEU_DOMINIO/api/auth/callback/google`
3. Preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env`.
4. Reinicie o servidor. O botão **Continuar com o Google** aparecerá no login e
   no cadastro.

Se as variáveis não forem preenchidas, o botão do Google fica oculto e o login
por e-mail/senha continua funcionando normalmente.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento. |
| `npm run build` / `npm start` | Build e execução em produção. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | Verificação de tipos com TypeScript. |
| `npm test` | Testes das regras de domínio. |
| `npm run db:migrate` | Cria/aplica migrações em desenvolvimento. |
| `npm run db:deploy` | Aplica migrações em produção. |
| `npm run db:seed` | Popula dados de demonstração. |
| `npm run db:studio` | Abre o Prisma Studio. |

## Arquitetura

```
src/
├─ app/
│  ├─ (auth)/            # Login e cadastro
│  ├─ (painel)/          # Áreas autenticadas
│  └─ api/               # Rotas REST
├─ components/           # Componentes de UI
├─ lib/
│  ├─ auth.ts            # Configuração do Better Auth
│  ├─ sessao.ts          # Sessão do usuário (páginas e API)
│  ├─ api.ts             # Wrapper de rotas autenticadas
│  ├─ repositorio-*.ts   # Acesso a dados
│  ├─ validacao*.ts      # Validação de entrada
│  ├─ projetos.ts        # Domínio de projetos
│  └─ kanban.ts          # Domínio do Kanban
└─ generated/prisma/     # Client do Prisma (gerado)
```

## Regras de negócio

- Cada projeto pertence a um usuário; todas as consultas são filtradas por dono.
- O progresso é calculado pelas tarefas: To Do = 0%, Doing = 50%, Done = 100%.
- Projetos `concluido` ficam em 100% e projetos `ideia` em 0%.
- O identificador do projeto é um slug único gerado a partir do nome.
