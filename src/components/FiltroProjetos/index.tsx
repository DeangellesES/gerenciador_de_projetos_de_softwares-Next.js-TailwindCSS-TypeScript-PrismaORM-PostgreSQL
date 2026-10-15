"use client";

import { useState } from "react";
import BuscaProjetos from "@/components/BuscaProjetos";
import type { Projeto, StatusProjeto } from "@/lib/projetos";

type Categoria = "todos" | StatusProjeto;

const categorias: { valor: Categoria; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "ativo", rotulo: "Em Andamento" },
  { valor: "concluido", rotulo: "Iniciando" },
  { valor: "ideia", rotulo: "Finalizando" },
];

function contarPorStatus(projetos: Projeto[], status: StatusProjeto) {
  return projetos.filter((projeto) => projeto.status === status).length;
}

type FiltroProjetosProps = {
  projetos: Projeto[];
  mostrarCategorias?: boolean;
};

export default function FiltroProjetos({
  projetos,
  mostrarCategorias = true,
}: FiltroProjetosProps) {
  const [categoria, setCategoria] = useState<Categoria>("todos");

  const visiveis =
    categoria === "todos"
      ? projetos
      : projetos.filter((projeto) => projeto.status === categoria);

  return (
    <>
      {mostrarCategorias && (
        <div
          role="tablist"
          aria-label="Filtrar projetos por categoria"
          className="flex gap-2 bg-[#080F21] w-fit p-2 rounded-lg"
        >
          {categorias.map(({ valor, rotulo }) => {
            const selecionado = valor === categoria;
            const total =
              valor === "todos"
                ? projetos.length
                : contarPorStatus(projetos, valor);

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
