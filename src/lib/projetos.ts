export type StatusProjeto = "ativo" | "concluido" | "ideia";

export type Projeto = {
  id: string;
  nome: string;
  descricao: string;
  status: StatusProjeto;
  stack: string[];
  progresso?: number;
  prazo?: string;
};

export const projetos: Projeto[] = [
  {
    id: "gerenciador",
    nome: "Gerenciador de Projetos",
    descricao:
      "Painel web para organizar projetos de desenvolvimento, com acompanhamento de status e prazo.",
    status: "ativo",
    stack: ["Next.js", "TypeScript", "Tailwind CSS"],
    progresso: 65,
    prazo: "2026-10-15",
  },
  {
    id: "api-tarefas",
    nome: "API de Tarefas",
    descricao:
      "Serviço REST para CRUD de tarefas com autenticação por token e paginação.",
    status: "ativo",
    stack: ["Node.js", "PostgreSQL", "Docker"],
    progresso: 30,
    prazo: "2026-12-01",
  },
  {
    id: "dashboard-metricas",
    nome: "Dashboard de Métricas",
    descricao:
      "Visualização de indicadores de produtividade com gráficos e filtros por período.",
    status: "ativo",
    stack: ["React", "Chart.js"],
    progresso: 12,
  },
  {
    id: "portfolio",
    nome: "Portfólio Pessoal",
    descricao:
      "Site estático de apresentação com estudos de caso dos projetos concluídos.",
    status: "concluido",
    stack: ["Next.js", "Tailwind CSS"],
    progresso: 100,
    prazo: "2026-03-20",
  },
  {
    id: "landing-page",
    nome: "Landing Page de Produto",
    descricao:
      "Página de conversão com formulário de contato e teste A/B do CTA principal.",
    status: "concluido",
    stack: ["Astro", "Vite"],
    progresso: 100,
    prazo: "2026-01-08",
  },
  {
    id: "bot-telegram",
    nome: "Bot de Telegram",
    descricao:
      "Bot para avisos automáticos de deploy e resumo diário de commits.",
    status: "concluido",
    stack: ["Python", "Telegram API"],
    progresso: 100,
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

export function porStatus(status: StatusProjeto): Projeto[] {
  return projetos.filter((projeto) => projeto.status === status);
}

export function formatarData(data: string): string {
  return new Date(`${data}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
