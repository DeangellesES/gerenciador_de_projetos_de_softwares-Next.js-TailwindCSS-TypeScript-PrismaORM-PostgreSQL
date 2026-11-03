import { getPrisma } from "@/lib/db";
import { recalcularProgresso } from "@/lib/repositorio-projetos";
import type { ColunaKanban, DadosTarefa, Tarefa } from "@/lib/kanban";

export type DadosAtualizacaoTarefa = {
  titulo?: string;
  descricao?: string | null;
  coluna?: ColunaKanban;
  ordem?: number;
};

export async function listarTarefas(projetoId: string): Promise<Tarefa[]> {
  return getPrisma().tarefa.findMany({
    where: { projetoId },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  });
}

export async function criarTarefa(
  projetoId: string,
  dados: DadosTarefa,
): Promise<Tarefa> {
  const prisma = getPrisma();
  const agregado = await prisma.tarefa.aggregate({
    where: { projetoId, coluna: dados.coluna },
    _max: { ordem: true },
  });

  const tarefa = await prisma.tarefa.create({
    data: { ...dados, projetoId, ordem: (agregado._max.ordem ?? -1) + 1 },
  });

  await recalcularProgresso(projetoId);

  return tarefa;
}

export async function atualizarTarefa(
  usuarioId: string,
  id: string,
  dados: DadosAtualizacaoTarefa,
): Promise<Tarefa | null> {
  const prisma = getPrisma();
  const atual = await prisma.tarefa.findFirst({
    where: { id, projeto: { userId: usuarioId } },
  });

  if (!atual) {
    return null;
  }

  const { coluna, ordem, ...texto } = dados;
  const destino = coluna ?? atual.coluna;
  const reposicionar = coluna !== undefined || ordem !== undefined;

  if (!reposicionar) {
    return prisma.tarefa.update({ where: { id }, data: texto });
  }

  const outras = await prisma.tarefa.findMany({
    where: { projetoId: atual.projetoId, coluna: destino, id: { not: id } },
    orderBy: [{ ordem: "asc" }, { criadoEm: "asc" }],
  });

  const posicao = Math.max(0, Math.min(ordem ?? outras.length, outras.length));
  const lista = [...outras];
  lista.splice(posicao, 0, atual);

  return prisma.$transaction(async (transacao) => {
    for (const [indice, tarefa] of lista.entries()) {
      await transacao.tarefa.update({
        where: { id: tarefa.id },
        data: {
          ordem: indice,
          coluna: destino,
          ...(tarefa.id === id ? texto : {}),
        },
      });
    }

    if (coluna !== undefined) {
      await recalcularProgresso(atual.projetoId, transacao);
    }

    return transacao.tarefa.findUnique({ where: { id } });
  });
}

export async function removerTarefa(
  usuarioId: string,
  id: string,
): Promise<Tarefa | null> {
  const prisma = getPrisma();
  const existente = await prisma.tarefa.findFirst({
    where: { id, projeto: { userId: usuarioId } },
  });

  if (!existente) {
    return null;
  }

  const tarefa = await prisma.tarefa.delete({ where: { id } });

  await recalcularProgresso(tarefa.projetoId);

  return tarefa;
}
