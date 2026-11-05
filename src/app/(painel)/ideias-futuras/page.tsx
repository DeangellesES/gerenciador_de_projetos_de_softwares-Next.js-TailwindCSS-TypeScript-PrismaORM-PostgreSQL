import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { listarProjetos } from "@/lib/repositorio-projetos";
import { exigirUsuarioNaPagina } from "@/lib/sessao";

export const metadata: Metadata = {
  title: "Projetos Futuros",
};

export default async function PaginaIdeiasFuturas() {
  const usuario = await exigirUsuarioNaPagina();
  const projetos = await listarProjetos(usuario.id, { status: "ideia" });

  return (
    <ListaProjetos
      titulo="Projetos Futuros"
      descricao="Projetos guardados para quando houver tempo e motivação."
      botao="Novo Projeto"
      statusPadrao="ideia"
      mostrarStatus={false}
      statusDisponiveis={["ideia"]}
      projetos={projetos}
    />
  );
}
