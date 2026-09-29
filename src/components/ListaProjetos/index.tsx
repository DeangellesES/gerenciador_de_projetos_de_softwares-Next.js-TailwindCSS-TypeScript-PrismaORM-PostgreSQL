import type { ReactNode } from "react";
import BuscaProjetos from "@/components/BuscaProjetos";
import type { Projeto } from "@/lib/projetos";
import { Plus } from 'lucide-react';

type ListaProjetosProps = {
  titulo: string;
  botao: string;
  descricao: string;
  projetos: Projeto[];
  children?: ReactNode;
};

export default function ListaProjetos({
  titulo,
  botao,
  descricao,
  projetos,
  children,
}: ListaProjetosProps) {
  return (
    <div className="px-10 py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex justify-between">
          <h1 className="text-white text-2xl font-bold">{titulo}</h1>
          <button className="text-white bg-blue-400 py-2 px-4 rounded-md flex gap-1 items-center"><Plus />{botao}</button>
        </div>
        <p className="text-[#94A3B8] text-sm">{descricao}</p>
      </header>
      {children}

      <div className="flex gap-4 bg-[#080F21] w-fit p-3 rounded">
        <p className="text-white text-sm">Todos 5</p>
        <p className="text-white text-sm">Em Andamento 2</p>
        <p className="text-white text-sm">Concluídos 3</p>
      </div>

      <BuscaProjetos projetos={projetos} />
    </div>
  );
}
