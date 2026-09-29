import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { listarProjetos } from "@/lib/repositorio-projetos";

export const metadata: Metadata = {
  title: "Projetos Concluídos",
};

export default async function PaginaProjetosConcluidos() {
  const projetos = await listarProjetos({ status: "concluido" });

  return (
    <ListaProjetos
      titulo="Projetos Concluídos"
      descricao="Trabalhos finalizados e disponíveis no portfólio."
      botao="Novo Projeto"
      statusPadrao="concluido"
      projetos={projetos}
    />
  );
}
