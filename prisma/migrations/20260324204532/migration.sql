-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Projeto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavelProjetoId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    CONSTRAINT "Projeto_responsavelProjetoId_fkey" FOREIGN KEY ("responsavelProjetoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Projeto" ("descricao", "id", "nome", "responsavelProjetoId", "status") SELECT "descricao", "id", "nome", "responsavelProjetoId", "status" FROM "Projeto";
DROP TABLE "Projeto";
ALTER TABLE "new_Projeto" RENAME TO "Projeto";
CREATE UNIQUE INDEX "Projeto_responsavelProjetoId_key" ON "Projeto"("responsavelProjetoId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
