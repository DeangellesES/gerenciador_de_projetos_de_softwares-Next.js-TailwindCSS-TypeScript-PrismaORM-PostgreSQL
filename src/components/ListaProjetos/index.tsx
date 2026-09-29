import type { ReactNode } from "react";
import CartaoProjeto from "@/components/CartaoProjeto";
import type { Projeto } from "@/lib/projetos";

type ListaProjetosProps = {
  titulo: string;
  descricao: string;
  projetos: Projeto[];
  children?: ReactNode;
};

export default function ListaProjetos({
  titulo,
  descricao,
  projetos,
  children,
}: ListaProjetosProps) {
  return (
    <div className="px-10 py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-white text-2xl font-bold">{titulo}</h1>
        <p className="text-[#94A3B8] text-sm">{descricao}</p>
      </header>
      {children}
      {projetos.length === 0 ? (
        <p className="text-[#64748B] text-sm border border-dashed border-white/10 rounded-xl p-8 text-center">
          Nenhum projeto por aqui ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projetos.map((projeto) => (
            <CartaoProjeto key={projeto.id} projeto={projeto} />
          ))}
        </div>
      )}
    </div>
  );
}
