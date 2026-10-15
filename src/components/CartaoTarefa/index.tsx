"use client";

import { Pencil, Trash2 } from "lucide-react";
import FormularioTarefa from "@/components/FormularioTarefa";
import type { Tarefa } from "@/lib/kanban";

type CartaoTarefaProps = {
  tarefa: Tarefa;
  arrastando: boolean;
  onIniciarArrasto: (id: string) => void;
  onFinalizarArrasto: () => void;
  aoConcluirEdicao: (tarefa: Tarefa) => void;
  onRemover: (id: string) => void;
};

export default function CartaoTarefa({
  tarefa,
  arrastando,
  onIniciarArrasto,
  onFinalizarArrasto,
  aoConcluirEdicao,
  onRemover,
}: CartaoTarefaProps) {
  function remover() {
    const confirmado = window.confirm(
      `Excluir a tarefa "${tarefa.titulo}"? Essa ação não pode ser desfeita.`,
    );

    if (confirmado) {
      onRemover(tarefa.id);
    }
  }

  return (
    <article
      data-tarefa-id={tarefa.id}
      draggable
      onDragStart={() => onIniciarArrasto(tarefa.id)}
      onDragEnd={onFinalizarArrasto}
      className={`group bg-[#0B1326] border border-white/10 rounded-lg p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing transition-colors hover:border-white/25 ${
        arrastando ? "opacity-40" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white text-sm font-medium break-words">{tarefa.titulo}</h3>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <FormularioTarefa tarefa={tarefa} aoConcluir={aoConcluirEdicao}>
            <button
              type="button"
              aria-label={`Editar ${tarefa.titulo}`}
              className="text-[#94A3B8] hover:text-white p-1 transition-colors cursor-pointer"
            >
              <Pencil size={14} />
            </button>
          </FormularioTarefa>
          <button
            type="button"
            onClick={remover}
            aria-label={`Excluir ${tarefa.titulo}`}
            className="text-red-300 hover:text-red-200 p-1 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {tarefa.descricao ? (
        <p className="text-[#94A3B8] text-xs break-words">{tarefa.descricao}</p>
      ) : null}
    </article>
  );
}
