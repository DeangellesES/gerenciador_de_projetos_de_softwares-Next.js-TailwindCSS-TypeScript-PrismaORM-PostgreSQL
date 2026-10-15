import Link from "next/link";
import { CalendarDays, SquareKanban } from "lucide-react";
import {
  ROTULOS_STATUS,
  STATUS_MEUS_PROJETOS,
  formatarData,
  type Projeto,
  type StatusProjeto,
} from "@/lib/projetos";

const cores: Record<StatusProjeto, { barra: string; badge: string }> = {
  ativo: { barra: "bg-sky-400", badge: "bg-sky-400/15 text-sky-300" },
  iniciando: { barra: "bg-cyan-400", badge: "bg-cyan-400/15 text-cyan-300" },
  finalizando: { barra: "bg-violet-400", badge: "bg-violet-400/15 text-violet-300" },
  concluido: { barra: "bg-emerald-400", badge: "bg-emerald-400/15 text-emerald-300" },
  ideia: { barra: "bg-amber-400", badge: "bg-amber-400/15 text-amber-300" },
};

type CartaoProjetoProps = {
  projeto: Projeto;
};

export default function CartaoProjeto({ projeto }: CartaoProjetoProps) {
  const { barra, badge } = cores[projeto.status];
  const emMeusProjetos = STATUS_MEUS_PROJETOS.includes(projeto.status);

  return (
    <article className="bg-[#131B2E] border border-white/10 rounded-xl p-5 flex flex-col gap-4 transition-colors hover:border-white/25">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-lg">{projeto.nome}</h3>
          <p className="text-[#94A3B8] text-sm mt-1">{projeto.descricao}</p>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${badge}`}
        >
          {ROTULOS_STATUS[projeto.status]}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {projeto.stack.map((tecnologia) => (
          <span
            key={tecnologia}
            className="text-xs text-[#D1D5DB] bg-white/5 border border-white/10 rounded-md px-2 py-1"
          >
            {tecnologia}
          </span>
        ))}
      </div>

      {projeto.status !== "ideia" ? (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-xs text-[#94A3B8]">
            <span>Progresso</span>
            <span>{projeto.progresso ?? 0}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${barra}`}
              style={{ width: `${projeto.progresso ?? 0}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
        {projeto.prazo ? (
          <span className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <CalendarDays size={14} />
            {formatarData(projeto.prazo)}
          </span>
        ) : (
          <span className="text-xs text-[#64748B]">Sem prazo definido</span>
        )}
        <div className="flex items-center gap-2">
          {emMeusProjetos ? (
            <Link
              href={`/projetos/${projeto.id}/kanban`}
              className="text-sm text-[#D1D5DB] bg-white/5 border border-white/10 hover:border-white/25 hover:text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors"
            >
              <SquareKanban size={14} />
              Kanban
            </Link>
          ) : null}
          <Link
            href={`/projetos/${projeto.id}`}
            className="text-sm text-sky-300 hover:text-sky-200 transition-colors"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}
