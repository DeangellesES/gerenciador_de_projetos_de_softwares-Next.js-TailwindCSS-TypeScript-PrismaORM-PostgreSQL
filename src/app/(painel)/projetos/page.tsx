import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { listarProjetos } from "@/lib/repositorio-projetos";

export const metadata: Metadata = { title: "Meus Projetos" };

export default async function PaginaProjetos() {
  const projetos = await listarProjetos({ status: "ativo" });

  return (
    <ListaProjetos
      titulo="Meus Projetos"
      descricao="Projetos em desenvolvimento, com progresso e prazo atualizados."
      botao="Novo Projeto"
      statusPadrao="ativo"
      projetos={projetos}
    />
  );
}
