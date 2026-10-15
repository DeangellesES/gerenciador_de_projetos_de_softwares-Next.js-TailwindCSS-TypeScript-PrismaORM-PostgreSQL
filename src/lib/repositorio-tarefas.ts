import { getPrisma } from "@/lib/db";
import type {
  ColunaKanban,
  DadosTarefa,
  Tarefa,
} from "@/lib/kanban";

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
  const ordem = await prisma.tarefa.count({
    where: { projetoId, coluna: dados.coluna },
  });

  return prisma.tarefa.create({
    data: { ...dados, projetoId, ordem },
  });
}

export async function atualizarTarefa(
  id: string,
  dados: {
    titulo?: string;
    descricao?: string | null;
    coluna?: ColunaKanban;
    ordem?: number;
  },
): Promise<Tarefa | null> {
  const prisma = getPrisma();
  const atual = await prisma.tarefa.findUnique({ where: { id } });

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

  await prisma.$transaction(
    lista.map((tarefa, indice) =>
      prisma.tarefa.update({
        where: { id: tarefa.id },
        data: {
          ordem: indice,
          coluna: destino,
          ...(tarefa.id === id ? texto : {}),
        },
      }),
    ),
  );

  return prisma.tarefa.findUnique({ where: { id } });
}

export async function removerTarefa(id: string): Promise<Tarefa | null> {
  return getPrisma().tarefa.delete({ where: { id } });
}
