import type { Metadata } from "next";
import ListaProjetos from "@/components/ListaProjetos";
import { listarProjetos } from "@/lib/repositorio-projetos";
import { STATUS_MEUS_PROJETOS } from "@/lib/projetos";
import { exigirUsuarioNaPagina } from "@/lib/sessao";

export const metadata: Metadata = { title: "Meus Projetos" };

export default async function PaginaProjetos() {
  const usuario = await exigirUsuarioNaPagina();
  const projetos = await listarProjetos(usuario.id, {
    status: STATUS_MEUS_PROJETOS,
  });

  return (
    <ListaProjetos
      titulo="Meus Projetos"
      descricao="Projetos em desenvolvimento, com progresso e prazo atualizados."
      botao="Novo Projeto"
      statusPadrao="ativo"
      statusDisponiveis={STATUS_MEUS_PROJETOS}
      projetos={projetos}
    />
  );
}
