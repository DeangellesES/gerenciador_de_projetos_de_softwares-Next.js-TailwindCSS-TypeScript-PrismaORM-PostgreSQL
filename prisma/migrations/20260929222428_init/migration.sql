-- CreateEnum
CREATE TYPE "StatusProjeto" AS ENUM ('ativo', 'concluido', 'ideia');

-- CreateTable
CREATE TABLE "projetos" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(120) NOT NULL,
    "descricao" VARCHAR(600) NOT NULL,
    "status" "StatusProjeto" NOT NULL DEFAULT 'ativo',
    "stack" TEXT[],
    "progresso" INTEGER,
    "prazo" DATE,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projetos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projetos_status_idx" ON "projetos"("status");
