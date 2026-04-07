/*
  Warnings:

  - Added the required column `projetoId` to the `Rata` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProjetoRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "projetoId" INTEGER NOT NULL,
    CONSTRAINT "ProjetoRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjetoRole_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProjetoRole" ("id", "projetoId", "role", "userId") SELECT "id", "projetoId", "role", "userId" FROM "ProjetoRole";
DROP TABLE "ProjetoRole";
ALTER TABLE "new_ProjetoRole" RENAME TO "ProjetoRole";
CREATE UNIQUE INDEX "ProjetoRole_userId_projetoId_key" ON "ProjetoRole"("userId", "projetoId");
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
    "grupo" TEXT,
    "projetoId" INTEGER NOT NULL,
    CONSTRAINT "Rata_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rata" ("dataFinalExperimento", "dataNascimento", "grupo", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez") SELECT "dataFinalExperimento", "dataNascimento", "grupo", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez" FROM "Rata";
DROP TABLE "Rata";
ALTER TABLE "new_Rata" RENAME TO "Rata";
CREATE UNIQUE INDEX "Rata_numero_key" ON "Rata"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
