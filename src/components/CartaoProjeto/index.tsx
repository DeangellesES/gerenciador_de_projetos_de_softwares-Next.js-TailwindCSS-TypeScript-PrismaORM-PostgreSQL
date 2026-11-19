import Link from "next/link";
import { CalendarDays, SquareKanban } from "lucide-react";
import {
  ROTULOS_STATUS,
  ROTA_POR_STATUS,
  STATUS_MEUS_PROJETOS,
  formatarData,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";

const cores: Record<StatusProjeto, { barra: string; badge: string }> = {
  ativo: {
    barra: "bg-status-ativo",
    badge: "bg-status-ativo-suave text-status-ativo",
  },
  iniciando: {
    barra: "bg-status-iniciando",
    badge: "bg-status-iniciando-suave text-status-iniciando",
  },
  finalizando: {
    barra: "bg-status-finalizando",
    badge: "bg-status-finalizando-suave text-status-finalizando",
  },
  concluido: {
    barra: "bg-status-concluido",
    badge: "bg-status-concluido-suave text-status-concluido",
  },
  ideia: {
    barra: "bg-status-ideia",
    badge: "bg-status-ideia-suave text-status-ideia",
  },
};

type CartaoProjetoProps = {
  projeto: Projeto;
};

export default function CartaoProjeto({ projeto }: CartaoProjetoProps) {
  const { barra, badge } = cores[projeto.status];
  const emMeusProjetos = STATUS_MEUS_PROJETOS.includes(projeto.status);
  const secao = ROTA_POR_STATUS[projeto.status];
  const hrefDetalhes =
    secao === "/projetos"
      ? `/projetos/${projeto.id}`
      : `/projetos/${projeto.id}?secao=${encodeURIComponent(secao)}`;

  return (
    <article className="bg-superficie border border-borda rounded-xl p-5 flex flex-col gap-4 transition-colors hover:border-borda-forte">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-texto font-semibold text-lg min-w-0">
          {projeto.nome}
        </h3>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${badge}`}
        >
          {ROTULOS_STATUS[projeto.status]}
        </span>
      </div>

      <p className="text-texto-secundario text-sm break-words">{projeto.descricao}</p>

      <div className="flex flex-wrap gap-2">
        {projeto.stack.map((tecnologia) => (
          <span
            key={tecnologia}
            className="text-xs text-texto-suave bg-realce border border-borda rounded-md px-2 py-1"
          >
            {tecnologia}
          </span>
        ))}
      </div>

      {projeto.status !== "ideia" ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-texto-secundario">
            <span>Progresso</span>
            <span>{projeto.progresso ?? 0}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-borda overflow-hidden">
            <div
              className={`h-full rounded-full ${barra}`}
              style={{ width: `${projeto.progresso ?? 0}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-borda">
        {projeto.prazo ? (
          <span className="flex items-center gap-1.5 text-xs text-texto-secundario">
            <CalendarDays size={14} />
            {formatarData(projeto.prazo)}
          </span>
        ) : (
          <span className="text-xs text-texto-terciario">Sem prazo definido</span>
        )}
        <div className="flex items-center gap-2">
          {emMeusProjetos ? (
            <Link
              href={`/projetos/${projeto.id}/kanban`}
              className="text-sm text-texto-suave bg-realce border border-borda hover:border-borda-forte hover:text-texto px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <SquareKanban size={14} />
              Kanban
            </Link>
          ) : null}
          <Link
            href={hrefDetalhes}
            className="text-sm text-status-ativo hover:text-destaque transition-colors"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
