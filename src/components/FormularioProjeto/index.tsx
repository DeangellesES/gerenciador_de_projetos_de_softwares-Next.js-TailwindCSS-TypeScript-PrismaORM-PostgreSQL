"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type ReactElement,
} from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  BOTAO_CANCELAR,
  BOTAO_PRIMARIO,
  CAMPOS,
} from "@/components/ui/estilos";
import { enviarJson } from "@/lib/cliente-api";
import {
  ROTULOS_STATUS,
  STATUS_PROJETO,
  paraTextoData,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";

const ROTA_POR_STATUS: Record<StatusProjeto, string> = {
  ativo: "/projetos",
  iniciando: "/projetos",
  finalizando: "/projetos",
  concluido: "/projetos-concluidos",
  ideia: "/ideias-futuras",
};

type FormularioProjetoProps = {
  children: ReactElement;
  projeto?: Projeto;
  statusPadrao?: StatusProjeto;
  mostrarStatus?: boolean;
  statusOpcoes?: StatusProjeto[];
};

export default function FormularioProjeto({
  children,
  projeto,
  statusPadrao = "ativo",
  mostrarStatus = true,
  statusOpcoes = [...STATUS_PROJETO],
}: FormularioProjetoProps) {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const formulario = useRef<HTMLFormElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const editando = Boolean(projeto);
  const statusFixo = !mostrarStatus;
  const opcoesStatus =
    projeto && !statusOpcoes.includes(projeto.status)
      ? [...statusOpcoes, projeto.status]
      : statusOpcoes;

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
      nome: dados.get("nome"),
      descricao: dados.get("descricao"),
      status: statusFixo
        ? (projeto?.status ?? statusPadrao)
        : dados.get("status"),
      stack: String(dados.get("stack") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      prazo: dados.get("prazo") || null,
    };

    const resultado = await enviarJson<Projeto>(
      editando ? `/api/projetos/${projeto?.id}` : "/api/projetos",
      editando ? "PATCH" : "POST",
      corpo,
      "Não foi possível salvar o projeto.",
    );

    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    fechar();
    router.refresh();

    if (!editando) {
      router.push(ROTA_POR_STATUS[resultado.dados.status]);
    }
  }

  const campoPrazo = (
    <label className="flex flex-col gap-1 text-sm">
      Prazo
      <input
        type="date"
        name="prazo"
        defaultValue={projeto ? paraTextoData(projeto.prazo) : ""}
        className={CAMPOS}
      />
    </label>
  );

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
              {editando ? "Editar projeto" : "Novo projeto"}
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
            Nome
            <input
              name="nome"
              required
              maxLength={120}
              defaultValue={projeto?.nome ?? ""}
              className={CAMPOS}
              placeholder="Nome do projeto"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Descrição
            <textarea
              name="descricao"
              required
              maxLength={600}
              rows={3}
              defaultValue={projeto?.descricao ?? ""}
              className={CAMPOS}
              placeholder="Do que se trata o projeto?"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Status
              {statusFixo ? (
                <input
                  value={ROTULOS_STATUS[projeto?.status ?? statusPadrao]}
                  readOnly
                  disabled
                  className={`${CAMPOS} opacity-70 cursor-not-allowed`}
                />
              ) : (
                <select
                  name="status"
                  defaultValue={projeto?.status ?? statusPadrao}
                  className={CAMPOS}
                >
                  {opcoesStatus.map((status) => (
                    <option key={status} value={status} className="bg-[#131B2E]">
                      {ROTULOS_STATUS[status]}
                    </option>
                  ))}
                </select>
              )}
            </label>

            {campoPrazo}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Stack
              <input
                name="stack"
                defaultValue={projeto?.stack.join(", ") ?? ""}
                className={CAMPOS}
                placeholder="Next.js, Prisma"
              />
            </label>
          </div>

          <p className="text-xs text-[#94A3B8] border border-white/10 bg-white/5 rounded-md px-3 py-2">
            O progresso é calculado automaticamente pelo quadro Kanban: cada
            tarefa em To Do vale 0%, em Doing 50% e em Done 100%. Ao concluir o
            projeto, ele vai para 100%.
          </p>

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
