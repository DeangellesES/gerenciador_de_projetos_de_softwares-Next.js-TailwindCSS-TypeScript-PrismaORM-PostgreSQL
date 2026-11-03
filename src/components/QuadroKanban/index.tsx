"use client";

import { useMemo, useState } from "react";
import ColunaKanban from "@/components/ColunaKanban";
import { enviarJson, requisitarApi } from "@/lib/cliente-api";
import {
  COLUNAS_KANBAN,
  agruparPorColuna,
  calcularProgresso,
  normalizarTarefa,
  type ColunaKanban as Coluna,
  type Tarefa,
  type TarefaSerializada,
} from "@/lib/kanban";

type QuadroKanbanProps = {
  projetoId: string;
  tarefasIniciais: Tarefa[];
};

function aplicarMovimento(
  lista: Tarefa[],
  id: string,
  coluna: Coluna,
  indice: number,
): Tarefa[] {
  const movida = lista.find((tarefa) => tarefa.id === id);

  if (!movida) {
    return lista;
  }

  const grupos = agruparPorColuna(lista.filter((tarefa) => tarefa.id !== id));
  const destino = grupos[coluna];
  const posicao = Math.max(0, Math.min(indice, destino.length));
  destino.splice(posicao, 0, { ...movida, coluna });

  const resultado: Tarefa[] = [];

  for (const chave of COLUNAS_KANBAN) {
    grupos[chave].forEach((tarefa, ordem) => {
      resultado.push({ ...tarefa, coluna: chave, ordem });
    });
  }

  return resultado;
}

function ProgressoKanban({ tarefas }: { tarefas: Tarefa[] }) {
  const progresso = calcularProgresso(tarefas);
  const concluidas = tarefas.filter((tarefa) => tarefa.coluna === "done").length;

  return (
    <div className="bg-[#131B2E] border border-white/10 rounded-xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-white font-medium">Progresso do projeto</span>
        <span className="text-[#94A3B8]">
          {concluidas}/{tarefas.length} tarefas concluídas · {progresso}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all"
          style={{ width: `${progresso}%` }}
        />
      </div>
      <p className="text-xs text-[#64748B]">
        Cada tarefa em To Do vale 0%, em Doing 50% e em Done 100%.
      </p>
    </div>
  );
}

export default function QuadroKanban({
  projetoId,
  tarefasIniciais,
}: QuadroKanbanProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>(() =>
    tarefasIniciais.map(normalizarTarefa),
  );
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);

  const grupos = useMemo(() => agruparPorColuna(tarefas), [tarefas]);

  async function recarregar() {
    const resultado = await requisitarApi<TarefaSerializada[]>(
      `/api/projetos/${projetoId}/tarefas`,
    );

    if (resultado.ok) {
      setTarefas(resultado.dados.map(normalizarTarefa));
    }
  }

  async function soltar(coluna: Coluna, indice: number) {
    const id = arrastandoId;
    setArrastandoId(null);

    if (!id) {
      return;
    }

    const anterior = tarefas;
    const naColuna = tarefas
      .filter((tarefa) => tarefa.coluna === coluna)
      .sort((a, b) => a.ordem - b.ordem);
    const indiceOriginal = naColuna.findIndex((tarefa) => tarefa.id === id);
    const alvo =
      indiceOriginal !== -1 && indiceOriginal < indice ? indice - 1 : indice;

    setTarefas(aplicarMovimento(tarefas, id, coluna, alvo));

    const resultado = await enviarJson<TarefaSerializada>(
      `/api/tarefas/${id}`,
      "PATCH",
      { coluna, ordem: alvo },
    );

    if (!resultado.ok) {
      setTarefas(anterior);
      return;
    }

    await recarregar();
  }

  async function remover(id: string) {
    const anterior = tarefas;
    setTarefas((lista) => lista.filter((tarefa) => tarefa.id !== id));

    const resultado = await requisitarApi<unknown>(`/api/tarefas/${id}`, {
      method: "DELETE",
    });

    if (!resultado.ok) {
      setTarefas(anterior);
    }
  }

  function atualizar(tarefa: Tarefa) {
    setTarefas((lista) =>
      lista.map((item) => (item.id === tarefa.id ? tarefa : item)),
    );
    void recarregar();
  }

  function adicionar(tarefa: Tarefa) {
    setTarefas((lista) => [...lista, tarefa]);
  }

  return (
    <div className="flex flex-col gap-5">
      <ProgressoKanban tarefas={tarefas} />

      <div className="grid gap-4 lg:grid-cols-3 items-start">
        {COLUNAS_KANBAN.map((coluna) => (
          <ColunaKanban
            key={coluna}
            coluna={coluna}
            projetoId={projetoId}
            tarefas={grupos[coluna]}
            arrastandoId={arrastandoId}
            onIniciarArrasto={setArrastandoId}
            onFinalizarArrasto={() => setArrastandoId(null)}
            onSoltar={soltar}
            onAdicionar={adicionar}
            onAtualizar={atualizar}
            onRemover={remover}
          />
        ))}
      </div>
    </div>
  );
}
