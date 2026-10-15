"use client";

import { useState } from "react";
import BuscaProjetos from "@/components/BuscaProjetos";
import {
  ROTULOS_STATUS,
  STATUS_PROJETO,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";

type Categoria = "todos" | StatusProjeto;

function contarPorStatus(projetos: Projeto[], status: StatusProjeto) {
  return projetos.filter((projeto) => projeto.status === status).length;
}

type FiltroProjetosProps = {
  projetos: Projeto[];
  mostrarCategorias?: boolean;
  statusDisponiveis?: StatusProjeto[];
};

export default function FiltroProjetos({
  projetos,
  mostrarCategorias = true,
  statusDisponiveis = [...STATUS_PROJETO],
}: FiltroProjetosProps) {
  const [categoria, setCategoria] = useState<Categoria>("todos");

  const visiveis =
    categoria === "todos"
      ? projetos
      : projetos.filter((projeto) => projeto.status === categoria);

  const categoriasVisiveis: { valor: Categoria; rotulo: string; total: number }[] = [
    { valor: "todos", rotulo: "Todos", total: projetos.length },
    ...statusDisponiveis
      .filter((status) => contarPorStatus(projetos, status) > 0)
      .map((status) => ({
        valor: status,
        rotulo: ROTULOS_STATUS[status],
        total: contarPorStatus(projetos, status),
      })),
  ];

  return (
    <>
      {mostrarCategorias && (
        <div
          role="tablist"
          aria-label="Filtrar projetos por categoria"
          className="flex gap-2 bg-[#080F21] w-fit p-2 rounded-lg"
        >
          {categoriasVisiveis.map(({ valor, rotulo, total }) => {
            const selecionado = valor === categoria;

            return (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={selecionado}
                onClick={() => setCategoria(valor)}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  selecionado
                    ? "bg-[#131B2E] text-white font-medium"
                    : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
              >
                {rotulo}{" "}
                <span
                  className={selecionado ? "text-white/80" : "text-[#64748B]"}
                >
                  {total}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <BuscaProjetos projetos={visiveis} />
    </>
  );
}
