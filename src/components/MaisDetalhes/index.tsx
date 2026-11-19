"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  BOTAO_CANCELAR,
  BOTAO_DISCRETO,
  BOTAO_PRIMARIO,
  CAMPOS,
} from "@/components/ui/estilos";
import { enviarJson } from "@/lib/cliente-api";
import type { Projeto } from "@/lib/projetos";

type MaisDetalhesProps = {
  projeto: Projeto;
};

export default function MaisDetalhes({ projeto }: MaisDetalhesProps) {
  const router = useRouter();
  const [detalhes, setDetalhes] = useState<string[]>(projeto.detalhes ?? []);
  const [editandoIndice, setEditandoIndice] = useState<number | null>(null);
  const [valorEditado, setValorEditado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function persistir(novosDetalhes: string[]): Promise<boolean> {
    setSalvando(true);
    setErro(null);

    const resultado = await enviarJson<Projeto>(
      `/api/projetos/${projeto.id}`,
      "PATCH",
      { detalhes: novosDetalhes },
      "Não foi possível salvar os detalhes.",
    );

    setSalvando(false);

    if (!resultado.ok) {
      setErro(resultado.erro);
      return false;
    }

    setDetalhes(resultado.dados.detalhes ?? novosDetalhes);
    router.refresh();
    return true;
  }

  function adicionar() {
    setDetalhes((atual) => [...atual, ""]);
    setEditandoIndice(detalhes.length);
    setValorEditado("");
    setErro(null);
  }

  function editar(indice: number) {
    setEditandoIndice(indice);
    setValorEditado(detalhes[indice] ?? "");
    setErro(null);
  }

  function cancelar() {
    if (editandoIndice !== null && !detalhes[editandoIndice]?.trim()) {
      setDetalhes((atual) =>
        atual.filter((_, posicao) => posicao !== editandoIndice),
      );
    }

    setEditandoIndice(null);
    setValorEditado("");
    setErro(null);
  }

  async function salvarEdicao() {
    if (editandoIndice === null) {
      return;
    }

    const texto = valorEditado.trim();

    if (!texto) {
      setErro("Informe o texto do detalhe.");
      return;
    }

    const novosDetalhes = detalhes.map((detalhe, indice) =>
      indice === editandoIndice ? texto : detalhe,
    );

    if (await persistir(novosDetalhes)) {
      setEditandoIndice(null);
      setValorEditado("");
    }
  }

  async function excluir(indice: number) {
    let proximoIndice = editandoIndice;

    if (editandoIndice === indice) {
      proximoIndice = null;
      setValorEditado("");
    } else if (editandoIndice !== null && indice < editandoIndice) {
      proximoIndice = editandoIndice - 1;
    }

    setEditandoIndice(proximoIndice);
    await persistir(detalhes.filter((_, posicao) => posicao !== indice));
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-texto font-semibold">Mais detalhes</h2>

      {detalhes.length === 0 && editandoIndice === null ? (
        <p className="text-sm text-texto-terciario">
          Nenhum detalhe adicionado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {detalhes.map((detalhe, indice) => {
            const editando = editandoIndice === indice;

            return (
              <div
                key={indice}
                className="bg-realce border border-borda rounded-lg p-3"
              >
                {editando ? (
                  <div className="flex items-start gap-3 flex-wrap">
                    <textarea
                      value={valorEditado}
                      onChange={(evento) => setValorEditado(evento.target.value)}
                      maxLength={600}
                      rows={3}
                      placeholder="Ex.: Autenticação com JWT e banco PostgreSQL."
                      className={`${CAMPOS} flex-1 min-w-[200px]`}
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={cancelar}
                        disabled={salvando}
                        className={BOTAO_CANCELAR}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={salvarEdicao}
                        disabled={salvando}
                        className={BOTAO_PRIMARIO}
                      >
                        {salvando ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-texto-suave whitespace-pre-wrap break-words flex-1 min-w-0">
                      {detalhe}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => editar(indice)}
                        disabled={salvando}
                        className="text-xs text-texto-secundario hover:text-texto flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <Pencil size={13} />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => excluir(indice)}
                        disabled={salvando}
                        className="text-xs text-perigo hover:text-perigo-forte flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        <Trash2 size={13} />
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {erro ? <p className="text-sm text-perigo">{erro}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={adicionar}
          disabled={salvando}
          className={BOTAO_DISCRETO}
        >
          <Plus size={14} />
          Adicionar mais detalhes
        </button>
      </div>
    </section>
  );
}
