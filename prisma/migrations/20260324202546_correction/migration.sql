/*
  Warnings:

  - Added the required column `status` to the `Projeto` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Projeto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavelProjetoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    CONSTRAINT "Projeto_responsavelProjetoId_fkey" FOREIGN KEY ("responsavelProjetoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Projeto" ("descricao", "id", "nome", "responsavelProjetoId") SELECT "descricao", "id", "nome", "responsavelProjetoId" FROM "Projeto";
DROP TABLE "Projeto";
ALTER TABLE "new_Projeto" RENAME TO "Projeto";
CREATE UNIQUE INDEX "Projeto_responsavelProjetoId_key" ON "Projeto"("responsavelProjetoId");
CREATE TABLE "new_Rata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "identificacao" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "linhagem" TEXT NOT NULL,
    "prenhez" BOOLEAN NOT NULL DEFAULT false,
    "dataNascimento" DATETIME NOT NULL,
    "dataFinalExperimento" DATETIME NOT NULL,
    "inclusao" BOOLEAN NOT NULL,
    "morte" BOOLEAN,
    "grupoId" INTEGER,
    CONSTRAINT "Rata_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Rata" ("dataFinalExperimento", "dataNascimento", "grupoId", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez") SELECT "dataFinalExperimento", "dataNascimento", "grupoId", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez" FROM "Rata";
DROP TABLE "Rata";
ALTER TABLE "new_Rata" RENAME TO "Rata";
CREATE UNIQUE INDEX "Rata_numero_key" ON "Rata"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
