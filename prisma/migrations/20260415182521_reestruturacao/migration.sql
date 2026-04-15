/*
  Warnings:

  - You are about to drop the `DosagensBioquimicas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EstresseOxidativo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DosagensBioquimicas";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EstresseOxidativo";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Hemoglobina" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "absBranco" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "Hemoglobina_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProteinaTotal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "valor" REAL NOT NULL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "ProteinaTotal_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TBARS" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "absBranco" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "TBARS_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TioisReduzidos" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "absBranco" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "TioisReduzidos_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SOD" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "percentAutoxidacao" REAL NOT NULL,
    "volumeAmostra" REAL NOT NULL,
    "atividade" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "SOD_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GSHPx" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leitura1" REAL NOT NULL,
    "leitura2" REAL NOT NULL,
    "leitura3" REAL NOT NULL,
    "leitura4" REAL NOT NULL,
    "atividade" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "GSHPx_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "H2O2" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "absBranco" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "H2O2_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Triglicerides" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "absPadrao" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "Triglicerides_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ColesterolTotal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "absPadrao" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "ColesterolTotal_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GPT" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "GPT_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GOT" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absAmostra" REAL NOT NULL,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "GOT_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VLDL" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "concentracao" REAL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "VLDL_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Hemoglobina_rataid_key" ON "Hemoglobina"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "ProteinaTotal_rataid_key" ON "ProteinaTotal"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "TBARS_rataid_key" ON "TBARS"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "TioisReduzidos_rataid_key" ON "TioisReduzidos"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "SOD_rataid_key" ON "SOD"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "GSHPx_rataid_key" ON "GSHPx"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "H2O2_rataid_key" ON "H2O2"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "Triglicerides_rataid_key" ON "Triglicerides"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "ColesterolTotal_rataid_key" ON "ColesterolTotal"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "GPT_rataid_key" ON "GPT"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "GOT_rataid_key" ON "GOT"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "VLDL_rataid_key" ON "VLDL"("rataid");
