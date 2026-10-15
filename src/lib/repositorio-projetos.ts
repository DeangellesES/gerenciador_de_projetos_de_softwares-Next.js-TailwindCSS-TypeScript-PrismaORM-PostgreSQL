import { getPrisma } from "@/lib/db";
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
  filtro: FiltroProjetos = {},
): Promise<Projeto[]> {
  const { status, busca } = filtro;

  const projetos = await getPrisma().projeto.findMany({
    where: {
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

export async function buscarProjetoPorId(id: string): Promise<Projeto | null> {
  return getPrisma().projeto.findUnique({ where: { id } });
}

export async function contarProjetos(): Promise<Record<StatusProjeto, number>> {
  const grupos = await getPrisma().projeto.groupBy({
    by: ["status"],
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

export async function criarProjeto(dados: DadosProjeto): Promise<Projeto> {
  return getPrisma().projeto.create({
    data: { ...dados, id: await garantirSlugUnico(dados.nome) },
  });
}

export async function atualizarProjeto(
  id: string,
  dados: Partial<DadosProjeto>,
): Promise<Projeto | null> {
  return getPrisma().projeto.update({ where: { id }, data: dados });
}

export async function removerProjeto(id: string): Promise<Projeto | null> {
  return getPrisma().projeto.delete({ where: { id } });
}
