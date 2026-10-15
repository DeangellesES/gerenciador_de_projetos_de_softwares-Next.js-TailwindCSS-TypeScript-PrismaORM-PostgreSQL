"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  ROTULOS_STATUS_NOVO_PROJETO,
  STATUS_PROJETO,
  paraTextoData,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";

type FormularioProjetoProps = {
  children: ReactNode;
  projeto?: Projeto;
  statusPadrao?: StatusProjeto;
  mostrarStatus?: boolean;
  statusOpcoes?: StatusProjeto[];
};

const CAMPOS =
  "w-full bg-[#080F21] border border-white/10 rounded-md px-3 py-2 text-white placeholder:text-white/40 focus:border-blue-400 focus:outline-none";

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
    const progresso = String(dados.get("progresso") ?? "");

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
      progresso: progresso === "" ? null : Number(progresso),
      prazo: dados.get("prazo") || null,
    };

    try {
      const resposta = await fetch(
        editando ? `/api/projetos/${projeto!.id}` : "/api/projetos",
        {
          method: editando ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(corpo),
        },
      );

      if (!resposta.ok) {
        const retorno = await resposta.json().catch(() => null);
        setErro(retorno?.erro ?? "Não foi possível salvar o projeto.");
        return;
      }

      const criado = await resposta.json();
      fechar();
      router.refresh();

      if (!editando) {
        router.push(`/projetos/${criado.id}`);
      }
    } catch {
      setErro("Falha de conexão com o servidor.");
    } finally {
      setEnviando(false);
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

          {statusFixo ? (
            campoPrazo
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm">
                Status
                <select
                  name="status"
                  defaultValue={projeto?.status ?? statusPadrao}
                  className={CAMPOS}
                >
                  {opcoesStatus.map((status) => (
                    <option key={status} value={status} className="bg-[#131B2E]">
                      {ROTULOS_STATUS_NOVO_PROJETO[status]}
                    </option>
                  ))}
                </select>
              </label>

              {campoPrazo}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Progresso (%)
              <input
                type="number"
                name="progresso"
                min={0}
                max={100}
                defaultValue={projeto?.progresso ?? ""}
                className={CAMPOS}
                placeholder="0 a 100"
              />
            </label>

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
