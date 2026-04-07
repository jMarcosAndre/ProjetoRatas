/*
  Warnings:

  - Added the required column `dataRealizacao` to the `TOTG` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TOTG" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rataId" INTEGER NOT NULL,
    "dataRealizacao" DATETIME NOT NULL,
    "t0" REAL NOT NULL,
    "t30" REAL NOT NULL,
    "t60" REAL NOT NULL,
    "t120" REAL NOT NULL,
    "diagnostico" TEXT,
    CONSTRAINT "TOTG_rataId_fkey" FOREIGN KEY ("rataId") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TOTG" ("diagnostico", "id", "rataId", "t0", "t120", "t30", "t60") SELECT "diagnostico", "id", "rataId", "t0", "t120", "t30", "t60" FROM "TOTG";
DROP TABLE "TOTG";
ALTER TABLE "new_TOTG" RENAME TO "TOTG";
CREATE UNIQUE INDEX "TOTG_rataId_key" ON "TOTG"("rataId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
