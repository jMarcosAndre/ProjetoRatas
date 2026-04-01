/*
  Warnings:

  - You are about to drop the `Grupo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `grupoId` on the `Rata` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Grupo";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "grupo" TEXT
);
INSERT INTO "new_Rata" ("dataFinalExperimento", "dataNascimento", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez") SELECT "dataFinalExperimento", "dataNascimento", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez" FROM "Rata";
DROP TABLE "Rata";
ALTER TABLE "new_Rata" RENAME TO "Rata";
CREATE UNIQUE INDEX "Rata_numero_key" ON "Rata"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
