"use client";

import { useState } from "react";
import ColunaKanban from "@/components/ColunaKanban";
import {
  COLUNAS_KANBAN,
  type ColunaKanban as Coluna,
  type Tarefa,
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

  const grupos: Record<Coluna, Tarefa[]> = { to: [], doing: [], done: [] };

  for (const tarefa of lista) {
    if (tarefa.id !== id) {
      grupos[tarefa.coluna].push(tarefa);
    }
  }

  for (const chave of COLUNAS_KANBAN) {
    grupos[chave].sort((a, b) => a.ordem - b.ordem);
  }

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

export default function QuadroKanban({
  projetoId,
  tarefasIniciais,
}: QuadroKanbanProps) {
  const [tarefas, setTarefas] = useState<Tarefa[]>(tarefasIniciais);
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);

  async function recarregar() {
    try {
      const resposta = await fetch(`/api/projetos/${projetoId}/tarefas`);

      if (resposta.ok) {
        setTarefas((await resposta.json()) as Tarefa[]);
      }
    } catch {
      // mantém o estado atual em caso de falha de conexão
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
    const alvo = indiceOriginal !== -1 && indiceOriginal < indice ? indice - 1 : indice;

    setTarefas(aplicarMovimento(tarefas, id, coluna, alvo));

    try {
      const resposta = await fetch(`/api/tarefas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coluna, ordem: alvo }),
      });

      if (!resposta.ok) {
        setTarefas(anterior);
        return;
      }

      recarregar();
    } catch {
      setTarefas(anterior);
    }
  }

  async function remover(id: string) {
    const anterior = tarefas;
    setTarefas((lista) => lista.filter((tarefa) => tarefa.id !== id));

    try {
      const resposta = await fetch(`/api/tarefas/${id}`, { method: "DELETE" });

      if (!resposta.ok) {
        setTarefas(anterior);
      }
    } catch {
      setTarefas(anterior);
    }
  }

  function atualizar(tarefa: Tarefa) {
    setTarefas((lista) =>
      lista.map((item) => (item.id === tarefa.id ? tarefa : item)),
    );
    recarregar();
  }

  function adicionar(tarefa: Tarefa) {
    setTarefas((lista) => [...lista, tarefa]);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3 items-start">
      {COLUNAS_KANBAN.map((coluna) => (
        <ColunaKanban
          key={coluna}
          coluna={coluna}
          projetoId={projetoId}
          tarefas={tarefas
            .filter((tarefa) => tarefa.coluna === coluna)
            .sort((a, b) => a.ordem - b.ordem)}
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
  );
}
