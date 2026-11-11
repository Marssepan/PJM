/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Sign` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SignKind" AS ENUM ('WORD', 'PHRASE');

-- AlterTable
ALTER TABLE "Alphabet" ADD COLUMN     "handshape" TEXT,
ADD COLUMN     "movement" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Sign" ADD COLUMN     "facial_expression" TEXT,
ADD COLUMN     "kind" "SignKind" NOT NULL DEFAULT 'WORD',
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Sign_slug_key" ON "Sign"("slug");

-- CreateIndex
CREATE INDEX "Sign_category_id_idx" ON "Sign"("category_id");

-- CreateIndex
CREATE INDEX "Sign_kind_idx" ON "Sign"("kind");
