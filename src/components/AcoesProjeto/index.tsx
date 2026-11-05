"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import FormularioProjeto from "@/components/FormularioProjeto";
import {
  BOTAO_CONCLUIR,
  BOTAO_DISCRETO,
  BOTAO_PERIGO,
} from "@/components/ui/estilos";
import { enviarJson, requisitarApi } from "@/lib/cliente-api";
import {
  STATUS_MEUS_PROJETOS,
  STATUS_PROJETO,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";

type AcoesProjetoProps = {
  projeto: Projeto;
};

export default function AcoesProjeto({ projeto }: AcoesProjetoProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [removendo, setRemovendo] = useState(false);
  const [concluindo, setConcluindo] = useState(false);

  const projetoFuturo = projeto.status === "ideia";

  const statusOpcoes: StatusProjeto[] = projetoFuturo
    ? ["ideia"]
    : STATUS_MEUS_PROJETOS.includes(projeto.status)
      ? STATUS_MEUS_PROJETOS
      : [...STATUS_PROJETO];

  async function excluir() {
    const confirmado = window.confirm(
      `Excluir "${projeto.nome}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmado) {
      return;
    }

    setRemovendo(true);
    setErro(null);

    const resultado = await requisitarApi<Projeto>(
      `/api/projetos/${projeto.id}`,
      { method: "DELETE" },
      "Não foi possível excluir o projeto.",
    );

    setRemovendo(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    router.push("/projetos");
    router.refresh();
  }

  async function alterarStatus(status: StatusProjeto) {
    setConcluindo(true);
    setErro(null);

    const resultado = await enviarJson<Projeto>(
      `/api/projetos/${projeto.id}`,
      "PATCH",
      { status },
      "Não foi possível atualizar o projeto.",
    );

    setConcluindo(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <FormularioProjeto
        projeto={projeto}
        statusOpcoes={statusOpcoes}
        mostrarStatus={!projetoFuturo}
        statusPadrao={projetoFuturo ? "ideia" : undefined}
      >
        <button type="button" className={BOTAO_DISCRETO}>
          <Pencil size={14} />
          Editar
        </button>
      </FormularioProjeto>

      {projeto.status === "finalizando" ? (
        <button
          type="button"
          onClick={() => alterarStatus("concluido")}
          disabled={concluindo}
          className={BOTAO_CONCLUIR}
        >
          <CheckCircle2 size={14} />
          {concluindo ? "Concluindo..." : "Concluir"}
        </button>
      ) : null}

      <button
        type="button"
        onClick={excluir}
        disabled={removendo}
        className={BOTAO_PERIGO}
      >
        <Trash2 size={14} />
        {removendo ? "Excluindo..." : "Excluir"}
      </button>

      {erro ? <span className="text-xs text-red-300">{erro}</span> : null}
    </div>
  );
}
