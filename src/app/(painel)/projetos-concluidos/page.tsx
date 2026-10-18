import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { listarProjetos } from "@/lib/repositorio-projetos";
import { exigirUsuarioNaPagina } from "@/lib/sessao";

export const metadata: Metadata = {
  title: "Projetos Finalizados",
};

export default async function PaginaProjetosConcluidos() {
  const usuario = await exigirUsuarioNaPagina();
  const projetos = await listarProjetos(usuario.id, { status: "concluido" });

  return (
    <ListaProjetos
      titulo="Projetos Finalizados"
      descricao="Trabalhos finalizados e disponíveis no portfólio."
      botao="Novo Projeto"
      statusPadrao="concluido"
      mostrarStatus={false}
      mostrarCategorias={false}
      projetos={projetos}
    />
  );
}
