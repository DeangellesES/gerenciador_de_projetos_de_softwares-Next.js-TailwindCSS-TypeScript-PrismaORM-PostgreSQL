"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  COLUNAS_KANBAN,
  ROTULOS_COLUNA,
  type ColunaKanban,
  type Tarefa,
} from "@/lib/kanban";

type FormularioTarefaProps = {
  children: ReactNode;
  projetoId?: string;
  tarefa?: Tarefa;
  colunaPadrao?: ColunaKanban;
  aoConcluir: (tarefa: Tarefa) => void;
};

const CAMPOS =
  "w-full bg-[#080F21] border border-white/10 rounded-md px-3 py-2 text-white placeholder:text-white/40 focus:border-blue-400 focus:outline-none";

export default function FormularioTarefa({
  children,
  projetoId,
  tarefa,
  colunaPadrao = "to",
  aoConcluir,
}: FormularioTarefaProps) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const editando = Boolean(tarefa);

  function abrir() {
    setErro(null);
    formulario.current?.reset();
    dialogo.current?.showModal();
  }

  function fechar() {
    dialogo.current?.close();
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEnviando(true);
    setErro(null);

    const dados = new FormData(evento.currentTarget);

    const corpo = {
      titulo: dados.get("titulo"),
      descricao: dados.get("descricao") || null,
      coluna: dados.get("coluna"),
    };

    try {
      const resposta = await fetch(
        editando ? `/api/tarefas/${tarefa!.id}` : `/api/projetos/${projetoId}/tarefas`,
        {
          method: editando ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        },
      );

      if (!resposta.ok) {
        const retorno = await resposta.json().catch(() => null);
        setErro(retorno?.erro ?? "Não foi possível salvar a tarefa.");
        return;
      }

      const salva = (await resposta.json()) as Tarefa;
      fechar();
      aoConcluir(salva);
    } catch {
      setErro("Falha de conexão com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <span onClick={abrir} className="contents">
        {children}
      </span>

      <dialog
        ref={dialogo}
        onClose={() => setErro(null)}
        className="bg-[#131B2E] border border-white/10 text-white rounded-xl p-0 w-full max-w-lg backdrop:bg-black/70 m-auto"
      >
        <form ref={formulario} onSubmit={enviar} className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editando ? "Editar tarefa" : "Nova tarefa"}
            </h2>
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Título
            <input
              name="titulo"
              required
              maxLength={200}
              defaultValue={tarefa?.titulo ?? ""}
              className={CAMPOS}
              placeholder="O que precisa ser feito?"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Descrição
            <textarea
              name="descricao"
              maxLength={600}
              rows={3}
              defaultValue={tarefa?.descricao ?? ""}
              className={CAMPOS}
              placeholder="Detalhes da tarefa (opcional)"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Coluna
            <select
              name="coluna"
              defaultValue={tarefa?.coluna ?? colunaPadrao}
              className={CAMPOS}
            >
              {COLUNAS_KANBAN.map((coluna) => (
                <option key={coluna} value={coluna} className="bg-[#131B2E]">
                  {ROTULOS_COLUNA[coluna].titulo}
                </option>
              ))}
            </select>
          </label>

          {erro ? <p className="text-sm text-red-300">{erro}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={fechar}
              className="text-[#94A3B8] hover:text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="bg-blue-400 hover:bg-blue-300 disabled:opacity-60 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
            >
              {enviando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
