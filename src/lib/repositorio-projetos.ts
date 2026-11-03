import { cache } from "react";
import { getPrisma } from "@/lib/db";
import { calcularProgresso, type ColunaKanban } from "@/lib/kanban";
import {
  buscarProjetos,
  gerarSlug,
  type DadosProjeto,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

type ClienteBanco = PrismaClient | Prisma.TransactionClient;

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

const LIMITE_TENTATIVAS_ID = 20;

export async function listarProjetos(
  usuarioId: string,
  filtro: FiltroProjetos = {},
): Promise<Projeto[]> {
  const { status, busca } = filtro;

  const projetos = await getPrisma().projeto.findMany({
    where: {
      userId: usuarioId,
      status: Array.isArray(status) ? { in: status } : status,
    },
  });

  const filtrados = busca ? buscarProjetos(projetos, busca) : projetos;

  return filtrados.sort(
    (a, b) =>
      ordemPorStatus[a.status] - ordemPorStatus[b.status] ||
      a.nome.localeCompare(b.nome, "pt-BR"),
  );
}

export const buscarProjetoPorId = cache(
  async (usuarioId: string, id: string): Promise<Projeto | null> => {
    return getPrisma().projeto.findFirst({
      where: { id, userId: usuarioId },
    });
  },
);

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
  tarefas: { coluna: ColunaKanban }[],
): number {
  if (status === "concluido") {
    return 100;
  }

  if (status === "ideia") {
    return 0;
  }

  return calcularProgresso(tarefas);
}

export async function recalcularProgresso(
  projetoId: string,
  cliente: ClienteBanco = getPrisma(),
): Promise<Projeto | null> {
  const projeto = await cliente.projeto.findUnique({
    where: { id: projetoId },
    select: { status: true, tarefas: { select: { coluna: true } } },
  });

  if (!projeto) {
    return null;
  }

  return cliente.projeto.update({
    where: { id: projetoId },
    data: { progresso: progressoPorStatus(projeto.status, projeto.tarefas) },
  });
}

function ehConflitoDeId(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "code" in erro &&
    (erro as { code?: unknown }).code === "P2002"
  );
}

function progressoInicial(status: StatusProjeto): number {
  return status === "concluido" ? 100 : 0;
}

export async function criarProjeto(
  usuarioId: string,
  dados: DadosProjeto,
): Promise<Projeto> {
  const raiz = gerarSlug(dados.nome);
  const prisma = getPrisma();

  for (let tentativa = 0; tentativa < LIMITE_TENTATIVAS_ID; tentativa += 1) {
    const id = tentativa === 0 ? raiz : `${raiz}-${tentativa + 1}`;

    try {
      return await prisma.projeto.create({
        data: {
          ...dados,
          id,
          userId: usuarioId,
          progresso: progressoInicial(dados.status),
        },
      });
    } catch (erro) {
      if (!ehConflitoDeId(erro)) {
        throw erro;
      }
    }
  }

  throw new Error("Não foi possível gerar um identificador único para o projeto.");
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

  if (dados.status === undefined) {
    return prisma.projeto.update({ where: { id }, data: dados });
  }

  return prisma.$transaction(async (transacao) => {
    await transacao.projeto.update({ where: { id }, data: dados });

    return recalcularProgresso(id, transacao);
  });
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
