export const COLUNAS_KANBAN = ["to", "doing", "done"] as const;

export type ColunaKanban = (typeof COLUNAS_KANBAN)[number];

export const ROTULOS_COLUNA: Record<
  ColunaKanban,
  { titulo: string; descricao: string }
> = {
  to: { titulo: "To Do", descricao: "O que precisa ser desenvolvido" },
  doing: { titulo: "Doing", descricao: "O que está sendo desenvolvido" },
  done: { titulo: "Done", descricao: "O que já foi desenvolvido" },
};

export type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  coluna: ColunaKanban;
  ordem: number;
  projetoId: string;
  criadoEm: Date;
  atualizadoEm: Date;
};

export type DadosTarefa = {
  titulo: string;
  descricao: string | null;
  coluna: ColunaKanban;
};

export function ehColunaKanban(valor: unknown): valor is ColunaKanban {
  return (
    typeof valor === "string" &&
    COLUNAS_KANBAN.includes(valor as ColunaKanban)
  );
}

export function agruparPorColuna(tarefas: Tarefa[]): Record<ColunaKanban, Tarefa[]> {
  const grupos: Record<ColunaKanban, Tarefa[]> = { to: [], doing: [], done: [] };

  for (const coluna of COLUNAS_KANBAN) {
    grupos[coluna] = tarefas
      .filter((tarefa) => tarefa.coluna === coluna)
      .sort((a, b) => a.ordem - b.ordem || a.criadoEm.getTime() - b.criadoEm.getTime());
  }

  return grupos;
}
