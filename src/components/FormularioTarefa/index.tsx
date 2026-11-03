"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { X } from "lucide-react";
import {
  BOTAO_CANCELAR,
  BOTAO_PRIMARIO,
  CAMPOS,
} from "@/components/ui/estilos";
import { enviarJson } from "@/lib/cliente-api";
import {
  COLUNAS_KANBAN,
  ROTULOS_COLUNA,
  normalizarTarefa,
  type ColunaKanban,
  type Tarefa,
  type TarefaSerializada,
} from "@/lib/kanban";

type FormularioTarefaProps = {
  children: ReactElement;
  projetoId?: string;
  tarefa?: Tarefa;
  colunaPadrao?: ColunaKanban;
  aoConcluir: (tarefa: Tarefa) => void;
};

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

    const resultado = await enviarJson<TarefaSerializada>(
      editando
        ? `/api/tarefas/${tarefa?.id}`
        : `/api/projetos/${projetoId}/tarefas`,
      editando ? "PATCH" : "POST",
      corpo,
      "Não foi possível salvar a tarefa.",
    );

    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    fechar();
    aoConcluir(normalizarTarefa(resultado.dados));
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
            <button type="button" onClick={fechar} className={BOTAO_CANCELAR}>
              Cancelar
            </button>
            <button type="submit" disabled={enviando} className={BOTAO_PRIMARIO}>
              {enviando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
