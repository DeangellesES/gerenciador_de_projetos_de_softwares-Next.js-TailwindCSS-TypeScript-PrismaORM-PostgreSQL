"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import FormularioProjeto from "@/components/FormularioProjeto";
import type { Projeto, StatusProjeto } from "@/lib/projetos";

type AcoesProjetoProps = {
  projeto: Projeto;
};

export default function AcoesProjeto({ projeto }: AcoesProjetoProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

  async function excluir() {
    const confirmado = window.confirm(
      `Excluir "${projeto.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmado) {
      return;
    }

    setRemovendo(true);
    setErro(null);

    try {
      const resposta = await fetch(`/api/projetos/${projeto.id}`, { method: "DELETE" });

      if (!resposta.ok) {
        const retorno = await resposta.json().catch(() => null);
        setErro(retorno?.erro ?? "Não foi possível excluir o projeto.");
        return;
      }

      router.push("/projetos");
      router.refresh();
    } catch {
      setErro("Falha de conexão com o servidor.");
    } finally {
      setRemovendo(false);
    }
  }

  async function alterarStatus(status: StatusProjeto) {
    setConcluindo(true);
    setErro(null);

    try {
      const resposta = await fetch(`/api/projetos/${projeto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!resposta.ok) {
        const retorno = await resposta.json().catch(() => null);
        setErro(retorno?.erro ?? "Não foi possível atualizar o projeto.");
        return;
      }

      router.refresh();
    } catch {
      setErro("Falha de conexão com o servidor.");
    } finally {
      setConcluindo(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <FormularioProjeto projeto={projeto}>
        <button
          type="button"
          className="text-sm text-[#94A3B8] hover:text-white border border-white/10 hover:border-white/25 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Pencil size={14} />
          Editar
        </button>
      </FormularioProjeto>

      {projeto.status !== "concluido" ? (
        <button
          type="button"
          onClick={() => alterarStatus("concluido")}
          disabled={concluindo}
          className="text-sm text-emerald-300 hover:text-emerald-200 border border-emerald-400/20 hover:border-emerald-400/40 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
        >
          <CheckCircle2 size={14} />
          {concluindo ? "Concluindo..." : "Concluir"}
        </button>
      ) : null}

      <button
        type="button"
        onClick={excluir}
        disabled={removendo}
        className="text-sm text-red-300 hover:text-red-200 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-60 cursor-pointer"
      >
        <Trash2 size={14} />
        {removendo ? "Excluindo..." : "Excluir"}
      </button>

      {erro ? <span className="text-xs text-red-300">{erro}</span> : null}
    </div>
  );
}
