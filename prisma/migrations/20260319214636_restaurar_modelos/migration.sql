-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleSistema" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavelProjetoId" INTEGER NOT NULL,
    CONSTRAINT "Projeto_responsavelProjetoId_fkey" FOREIGN KEY ("responsavelProjetoId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjetoRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'LEITOR',
    "projetoId" INTEGER NOT NULL,
    CONSTRAINT "ProjetoRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjetoRole_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Rata" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "identificacao" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "linhagem" TEXT NOT NULL,
    "prenhez" BOOLEAN NOT NULL DEFAULT false,
    "dataNascimento" DATETIME NOT NULL,
    "dataFinalExperimento" DATETIME NOT NULL,
    "inclusao" BOOLEAN NOT NULL,
    "morte" BOOLEAN,
    "grupoId" INTEGER NOT NULL,
    CONSTRAINT "Rata_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "Grupo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Grupo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nomeGrupo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Gestacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dataPrenhez" DATETIME NOT NULL,
    "rataId" INTEGER NOT NULL,
    "ganhoPesoMaterno" REAL,
    "nCorposLuteos" INTEGER,
    "nImplantacoes" INTEGER,
    "nFetosVivos" INTEGER,
    "nFetosMortos" INTEGER,
    "nMortesEmbrionarias" INTEGER,
    "perdasPreImplantacao" REAL,
    "perdasPosImplantacao" REAL,
    "pesoTotalNinhada" REAL,
    CONSTRAINT "Gestacao_rataId_fkey" FOREIGN KEY ("rataId") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Feto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "identificacao" TEXT NOT NULL,
    "statusPeriodo" TEXT NOT NULL DEFAULT 'VIVO',
    "pesoFeto" REAL,
    "pesoPlacenta" REAL,
    "dataMorte" DATETIME,
    "rataId" INTEGER NOT NULL,
    CONSTRAINT "Feto_rataId_fkey" FOREIGN KEY ("rataId") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DadosGerais" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rataId" INTEGER NOT NULL,
    "peso" REAL NOT NULL,
    "consumoAgua" REAL NOT NULL,
    "consumoRacao" REAL NOT NULL,
    "dataMedicao" DATETIME NOT NULL,
    CONSTRAINT "DadosGerais_rataId_fkey" FOREIGN KEY ("rataId") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TOTG" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rataId" INTEGER NOT NULL,
    "t0" REAL NOT NULL,
    "t30" REAL NOT NULL,
    "t60" REAL NOT NULL,
    "t120" REAL NOT NULL,
    "diagnostico" TEXT,
    CONSTRAINT "TOTG_rataId_fkey" FOREIGN KEY ("rataId") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EstresseOxidativo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absorsanciaAmostra" REAL NOT NULL,
    "proteinaTotal" REAL NOT NULL,
    "concentracaoHemoglobina" REAL NOT NULL,
    "tbars" REAL NOT NULL,
    "tioisReduzidos" REAL NOT NULL,
    "peroxidoHidrogenio" REAL NOT NULL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "EstresseOxidativo_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DosagensBioquimicas" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "absorsanciaAmostra" REAL NOT NULL,
    "absorsanciaPadrao" REAL NOT NULL,
    "concentracaoTriglicerides" REAL NOT NULL,
    "concentracaoColesterolTotal" REAL NOT NULL,
    "concentracaoGPT" REAL NOT NULL,
    "concentracaoVLDL" REAL NOT NULL,
    "rataid" INTEGER NOT NULL,
    CONSTRAINT "DosagensBioquimicas_rataid_fkey" FOREIGN KEY ("rataid") REFERENCES "Rata" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Projeto_responsavelProjetoId_key" ON "Projeto"("responsavelProjetoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjetoRole_userId_projetoId_key" ON "ProjetoRole"("userId", "projetoId");

-- CreateIndex
CREATE UNIQUE INDEX "Rata_numero_key" ON "Rata"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Gestacao_rataId_key" ON "Gestacao"("rataId");

-- CreateIndex
CREATE UNIQUE INDEX "TOTG_rataId_key" ON "TOTG"("rataId");

-- CreateIndex
CREATE UNIQUE INDEX "EstresseOxidativo_rataid_key" ON "EstresseOxidativo"("rataid");

-- CreateIndex
CREATE UNIQUE INDEX "DosagensBioquimicas_rataid_key" ON "DosagensBioquimicas"("rataid");
