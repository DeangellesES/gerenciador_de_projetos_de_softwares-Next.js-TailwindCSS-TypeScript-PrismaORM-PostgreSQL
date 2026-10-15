-- CreateEnum
CREATE TYPE "ColunaKanban" AS ENUM ('to', 'doing', 'done');

-- CreateTable
CREATE TABLE "tarefas" (
    "id" TEXT NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descricao" VARCHAR(600),
    "coluna" "ColunaKanban" NOT NULL DEFAULT 'to',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "projeto_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tarefas_projeto_id_coluna_ordem_idx" ON "tarefas"("projeto_id", "coluna", "ordem");

-- AddForeignKey
ALTER TABLE "tarefas" ADD CONSTRAINT "tarefas_projeto_id_fkey" FOREIGN KEY ("projeto_id") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
