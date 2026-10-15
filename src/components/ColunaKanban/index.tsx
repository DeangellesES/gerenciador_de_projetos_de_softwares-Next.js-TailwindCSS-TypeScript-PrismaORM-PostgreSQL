"use client";

import { useRef, useState, type DragEvent } from "react";
import { Plus } from "lucide-react";
import CartaoTarefa from "@/components/CartaoTarefa";
import FormularioTarefa from "@/components/FormularioTarefa";
import {
  ROTULOS_COLUNA,
  type ColunaKanban as Coluna,
  type Tarefa,
} from "@/lib/kanban";

type ColunaKanbanProps = {
  coluna: Coluna;
  tarefas: Tarefa[];
  projetoId: string;
  arrastandoId: string | null;
  onIniciarArrasto: (id: string) => void;
  onFinalizarArrasto: () => void;
  onSoltar: (coluna: Coluna, indice: number) => void;
  onAdicionar: (tarefa: Tarefa) => void;
  onAtualizar: (tarefa: Tarefa) => void;
  onRemover: (id: string) => void;
};

export default function ColunaKanban({
  coluna,
  tarefas,
  projetoId,
  arrastandoId,
  onIniciarArrasto,
  onFinalizarArrasto,
  onSoltar,
  onAdicionar,
  onAtualizar,
  onRemover,
}: ColunaKanbanProps) {
  const lista = useRef<HTMLDivElement>(null);
  const [sobre, setSobre] = useState(false);
  const { titulo, descricao } = ROTULOS_COLUNA[coluna];

  function calcularIndice(evento: DragEvent<HTMLDivElement>) {
    const container = lista.current;

    if (!container) {
      return tarefas.length;
    }

    const cartoes = Array.from(
      container.querySelectorAll<HTMLElement>("[data-tarefa-id]"),
    );

    for (let indice = 0; indice < cartoes.length; indice += 1) {
      const area = cartoes[indice].getBoundingClientRect();

      if (evento.clientY < area.top + area.height / 2) {
        return indice;
      }
    }

    return cartoes.length;
  }

  function soltar(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
    setSobre(false);

    if (arrastandoId) {
      onSoltar(coluna, calcularIndice(evento));
    }
  }

  function sair(evento: DragEvent<HTMLDivElement>) {
    if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) {
      setSobre(false);
    }
  }

  return (
    <section className="bg-[#131B2E] border border-white/10 rounded-xl flex flex-col min-h-[24rem]">
      <header className="flex items-start justify-between gap-2 p-4 border-b border-white/10">
        <div>
          <h2 className="text-white font-semibold flex items-center gap-2">
            {titulo}
            <span className="text-xs font-medium text-[#94A3B8] bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
              {tarefas.length}
            </span>
          </h2>
          <p className="text-[#64748B] text-xs mt-0.5">{descricao}</p>
        </div>

        <FormularioTarefa
          projetoId={projetoId}
          colunaPadrao={coluna}
          aoConcluir={onAdicionar}
        >
          <button
            type="button"
            aria-label={`Adicionar tarefa em ${titulo}`}
            className="text-[#94A3B8] hover:text-white border border-white/10 hover:border-white/25 rounded-md p-1.5 transition-colors cursor-pointer"
          >
            <Plus size={16} />
          </button>
        </FormularioTarefa>
      </header>

      <div
        ref={lista}
        onDragOver={(evento) => {
          evento.preventDefault();
          setSobre(true);
        }}
        onDragLeave={sair}
        onDrop={soltar}
        className={`flex-1 flex flex-col gap-2 p-3 rounded-b-xl transition-colors ${
          sobre ? "bg-[#7DD3FC]/5 ring-1 ring-inset ring-[#7DD3FC]/40" : ""
        }`}
      >
        {tarefas.length === 0 ? (
          <p className="text-[#64748B] text-xs border border-dashed border-white/10 rounded-lg p-4 text-center m-auto">
            Arraste tarefas para cá
          </p>
        ) : (
          tarefas.map((tarefa) => (
            <CartaoTarefa
              key={tarefa.id}
              tarefa={tarefa}
              arrastando={arrastandoId === tarefa.id}
              onIniciarArrasto={onIniciarArrasto}
              onFinalizarArrasto={onFinalizarArrasto}
              aoConcluirEdicao={onAtualizar}
              onRemover={onRemover}
            />
          ))
        )}
      </div>
    </section>
  );
}
