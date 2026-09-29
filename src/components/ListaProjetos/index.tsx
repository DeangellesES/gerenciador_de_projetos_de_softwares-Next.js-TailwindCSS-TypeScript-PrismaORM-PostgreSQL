import type { ReactNode } from "react";
import BotaoNovoProjeto from "@/components/BotaoNovoProjeto";
import FiltroProjetos from "@/components/FiltroProjetos";
import type { Projeto, StatusProjeto } from "@/lib/projetos";

type ListaProjetosProps = {
  titulo: string;
  botao: string;
  descricao: string;
  projetos: Projeto[];
  statusPadrao?: StatusProjeto;
  children?: ReactNode;
};

export default function ListaProjetos({
  titulo,
  botao,
  descricao,
  projetos,
  statusPadrao,
  children,
}: ListaProjetosProps) {
  return (
    <div className="px-10 py-8 flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex justify-between">
          <h1 className="text-white text-2xl font-bold">{titulo}</h1>
          <BotaoNovoProjeto rotulo={botao} statusPadrao={statusPadrao} />
        </div>
        <p className="text-[#94A3B8] text-sm">{descricao}</p>
      </header>
      {children}

      <FiltroProjetos projetos={projetos} />
    </div>
  );
}
