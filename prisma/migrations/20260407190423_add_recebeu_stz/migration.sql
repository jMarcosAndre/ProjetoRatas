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
    "recebeuSTZ" BOOLEAN NOT NULL DEFAULT false,
    "inclusao" BOOLEAN NOT NULL DEFAULT false,
    "morte" BOOLEAN,
    "grupo" TEXT,
    "projetoId" INTEGER NOT NULL,
    CONSTRAINT "Rata_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Rata" ("dataFinalExperimento", "dataNascimento", "grupo", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez", "projetoId") SELECT "dataFinalExperimento", "dataNascimento", "grupo", "id", "identificacao", "inclusao", "linhagem", "morte", "numero", "prenhez", "projetoId" FROM "Rata";
DROP TABLE "Rata";
ALTER TABLE "new_Rata" RENAME TO "Rata";
CREATE UNIQUE INDEX "Rata_numero_key" ON "Rata"("numero");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
