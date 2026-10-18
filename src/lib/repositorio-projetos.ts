import { getPrisma } from "@/lib/db";
import { calcularProgresso } from "@/lib/kanban";
import {
  gerarSlug,
  type DadosProjeto,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";

export type FiltroProjetos = {
  status?: StatusProjeto | StatusProjeto[];
  busca?: string;
};

const ordemPorStatus: Record<StatusProjeto, number> = {
  ativo: 0,
  iniciando: 1,
  finalizando: 2,
  concluido: 3,
  ideia: 4,
};

export async function listarProjetos(
  usuarioId: string,
  filtro: FiltroProjetos = {},
): Promise<Projeto[]> {
  const { status, busca } = filtro;

  const projetos = await getPrisma().projeto.findMany({
    where: {
      userId: usuarioId,
      status: Array.isArray(status) ? { in: status } : status,
      ...(busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" as const } },
              { descricao: { contains: busca, mode: "insensitive" as const } },
              { stack: { has: busca } },
            ],
          }
        : {}),
    },
  });

  return projetos.sort(
    (a, b) =>
      ordemPorStatus[a.status] - ordemPorStatus[b.status] ||
      a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

export async function buscarProjetoPorId(
  usuarioId: string,
  id: string,
): Promise<Projeto | null> {
  return getPrisma().projeto.findFirst({
    where: { id, userId: usuarioId },
  });
}

export async function contarProjetos(
  usuarioId: string,
): Promise<Record<StatusProjeto, number>> {
  const grupos = await getPrisma().projeto.groupBy({
    by: ["status"],
    where: { userId: usuarioId },
    _count: { _all: true },
  });

  const contagem: Record<StatusProjeto, number> = {
    ativo: 0,
    iniciando: 0,
    finalizando: 0,
    concluido: 0,
    ideia: 0,
  };

  for (const grupo of grupos) {
    contagem[grupo.status] = grupo._count._all;
  }

  return contagem;
}

function progressoPorStatus(
  status: StatusProjeto,
  tarefas: { coluna: "to" | "doing" | "done" }[],
): number {
  if (status === "concluido") {
    return 100;
  }

  if (status === "ideia") {
    return 0;
  }

  return calcularProgresso(tarefas);
}

export async function recalcularProgresso(projetoId: string): Promise<void> {
  const prisma = getPrisma();
  const projeto = await prisma.projeto.findUnique({
    where: { id: projetoId },
    select: { status: true, tarefas: { select: { coluna: true } } },
  });

  if (!projeto) {
    return;
  }

  await prisma.projeto.update({
    where: { id: projetoId },
    data: { progresso: progressoPorStatus(projeto.status, projeto.tarefas) },
  });
}

async function garantirSlugUnico(nome: string): Promise<string> {
  const raiz = gerarSlug(nome);
  let slug = raiz;
  let sufixo = 2;

  while (
    await getPrisma().projeto.findUnique({ where: { id: slug }, select: { id: true } })
  ) {
    slug = `${raiz}-${sufixo}`;
    sufixo += 1;
  }

  return slug;
}

export async function criarProjeto(
  usuarioId: string,
  dados: DadosProjeto,
): Promise<Projeto> {
  return getPrisma().projeto.create({
    data: {
      ...dados,
      userId: usuarioId,
      id: await garantirSlugUnico(dados.nome),
      progresso: dados.status === "concluido" ? 100 : 0,
    },
  });
}

export async function atualizarProjeto(
  usuarioId: string,
  id: string,
  dados: Partial<DadosProjeto>,
): Promise<Projeto | null> {
  const prisma = getPrisma();
  const existente = await prisma.projeto.findFirst({
    where: { id, userId: usuarioId },
    select: { id: true },
  });

  if (!existente) {
    return null;
  }

  const projeto = await prisma.projeto.update({ where: { id }, data: dados });

  if (dados.status !== undefined) {
    await recalcularProgresso(id);

    return prisma.projeto.findUnique({ where: { id } });
  }

  return projeto;
}

export async function removerProjeto(
  usuarioId: string,
  id: string,
): Promise<Projeto | null> {
  const prisma = getPrisma();
  const existente = await prisma.projeto.findFirst({
    where: { id, userId: usuarioId },
    select: { id: true },
  });

  if (!existente) {
    return null;
  }

  return prisma.projeto.delete({ where: { id } });
}
