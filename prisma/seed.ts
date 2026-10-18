import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type {
  ColunaKanban,
  StatusProjeto,
} from "../src/generated/prisma/enums";

const PESO_COLUNA: Record<ColunaKanban, number> = {
  to: 0,
  doing: 50,
  done: 100,
};

const projetos: {
  id: string;
  nome: string;
  descricao: string;
  status: StatusProjeto;
  stack: string[];
  prazo?: string;
}[] = [
  {
    id: "gerenciador",
    nome: "Gerenciador de Projetos",
    descricao:
      "Painel web para organizar projetos de desenvolvimento, com acompanhamento de status e prazo.",
    status: "ativo",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    prazo: "2026-10-15",
  },
  {
    id: "api-tarefas",
    nome: "API de Tarefas",
    descricao:
      "Serviço REST para CRUD de tarefas com autenticação por token e paginação.",
    status: "ativo",
    stack: ["Node.js", "PostgreSQL", "Docker"],
    prazo: "2026-12-01",
  },
  {
    id: "dashboard-metricas",
    nome: "Dashboard de Métricas",
    descricao:
      "Visualização de indicadores de produtividade com gráficos e filtros por período.",
    status: "ativo",
    stack: ["React", "Chart.js"],
  },
  {
    id: "portfolio",
    nome: "Portfólio Pessoal",
    descricao:
      "Site estático de apresentação com estudos de caso dos projetos concluídos.",
    status: "concluido",
    stack: ["Next.js", "Tailwind CSS"],
    prazo: "2026-03-20",
  },
  {
    id: "landing-page",
    nome: "Landing Page de Produto",
    descricao:
      "Página de conversão com formulário de contato e teste A/B do CTA principal.",
    status: "concluido",
    stack: ["Astro", "Vite"],
    prazo: "2026-01-08",
  },
  {
    id: "bot-telegram",
    nome: "Bot de Telegram",
    descricao:
      "Bot para avisos automáticos de deploy e resumo diário de commits.",
    status: "concluido",
    stack: ["Python", "Telegram API"],
    prazo: "2025-11-30",
  },
  {
    id: "editor-markdown",
    nome: "Editor de Markdown com Preview",
    descricao:
      "Editor com divisão de tela, auto-save em localStorage e exportação para PDF.",
    status: "ideia",
    stack: ["React", "MDX"],
  },
  {
    id: "clone-spotify",
    nome: "Clone de Streaming de Música",
    descricao:
      "Reprodução de faixas, playlists e modo offline usando a Web Audio API.",
    status: "ideia",
    stack: ["TypeScript", "Web Audio API"],
  },
  {
    id: "extension-bloco",
    nome: "Extensão de Bloqueio de Distração",
    descricao:
      "Extensão de navegador que bloqueia sites por horário e registra o tempo de foco.",
    status: "ideia",
    stack: ["Chrome Extensions", "Vite"],
  },
];

const tarefas: {
  id: string;
  projetoId: string;
  titulo: string;
  descricao?: string;
  coluna: ColunaKanban;
  ordem: number;
}[] = [
  {
    id: "gerenciador-tarefa-1",
    projetoId: "gerenciador",
    titulo: "Modelar banco de dados",
    descricao: "Definir entidades de projetos e tarefas no Prisma.",
    coluna: "done",
    ordem: 0,
  },
  {
    id: "gerenciador-tarefa-2",
    projetoId: "gerenciador",
    titulo: "Listagem e filtros de projetos",
    descricao: "Cards com busca por nome, stack e status.",
    coluna: "done",
    ordem: 1,
  },
  {
    id: "gerenciador-tarefa-3",
    projetoId: "gerenciador",
    titulo: "Quadro Kanban por projeto",
    descricao: "Colunas To, Doing e Done com arrastar e soltar.",
    coluna: "doing",
    ordem: 0,
  },
  {
    id: "gerenciador-tarefa-4",
    projetoId: "gerenciador",
    titulo: "Edição de tarefas",
    descricao: "Permitir editar título, descrição e coluna de cada tarefa.",
    coluna: "doing",
    ordem: 1,
  },
  {
    id: "gerenciador-tarefa-5",
    projetoId: "gerenciador",
    titulo: "Autenticação de usuários",
    descricao: "Login e permissões por usuário.",
    coluna: "to",
    ordem: 0,
  },
  {
    id: "gerenciador-tarefa-6",
    projetoId: "gerenciador",
    titulo: "Notificações de prazo",
    descricao: "Alertar quando o prazo de um projeto estiver próximo.",
    coluna: "to",
    ordem: 1,
  },
];

function calcularProgresso(
  status: StatusProjeto,
  colunas: ColunaKanban[],
): number {
  if (status === "concluido") {
    return 100;
  }

  if (status === "ideia" || colunas.length === 0) {
    return 0;
  }

  const soma = colunas.reduce((total, coluna) => total + PESO_COLUNA[coluna], 0);

  return Math.round(soma / colunas.length);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não está definida. Configure o arquivo .env.");
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  for (const projeto of projetos) {
    const { prazo, ...dados } = projeto;
    const colunas = tarefas
      .filter((tarefa) => tarefa.projetoId === projeto.id)
      .map((tarefa) => tarefa.coluna);
    const progresso = calcularProgresso(projeto.status, colunas);
    const prazoEmData = prazo ? new Date(`${prazo}T00:00:00.000Z`) : null;

    await prisma.projeto.upsert({
      where: { id: projeto.id },
      update: { ...dados, progresso, prazo: prazoEmData },
      create: { ...dados, progresso, prazo: prazoEmData },
    });
  }

  for (const tarefa of tarefas) {
    await prisma.tarefa.upsert({
      where: { id: tarefa.id },
      update: tarefa,
      create: tarefa,
    });
  }

  const total = await prisma.projeto.count();
  console.log(`Seed concluído: ${total} projetos no banco.`);

  await prisma.$disconnect();
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
