"use client";

import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";
import CartaoProjeto from "@/components/CartaoProjeto";
import { buscarProjetos, type Projeto } from "@/lib/projetos";

type BuscaProjetosProps = {
  projetos: Projeto[];
};

export default function BuscaProjetos({ projetos }: BuscaProjetosProps) {
  const [termo, setTermo] = useState("");
  const termoAdiado = useDeferredValue(termo);
  const resultados = buscarProjetos(projetos, termoAdiado);
  const buscando = termo !== termoAdiado;

  return (
    <>
      <div className="relative w-full max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70"
          size={18}
        />

        <input
          type="search"
          value={termo}
          onChange={(evento) => setTermo(evento.target.value)}
          aria-label="Buscar projetos"
          className="w-full bg-[#080F21] pl-10 pr-3 placeholder:text-white/70 p-2 rounded text-white"
          placeholder="Buscar Projetos"
        />
      </div>

      {resultados.length === 0 ? (
        <p className="text-[#64748B] text-sm border border-dashed border-white/10 rounded-xl p-8 text-center">
          {buscando
            ? "Buscando projetos..."
            : termo.trim()
              ? `Nenhum projeto encontrado para "${termo.trim()}".`
              : "Nenhum projeto por aqui ainda."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {resultados.map((projeto) => (
            <CartaoProjeto key={projeto.id} projeto={projeto} />
          ))}
        </div>
      )}
    </>
  );
}
