import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Garanta que a pasta 'prisma' está na raiz do projeto
  schema: "./prisma/schema.prisma", 
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    // Certifique-se de que a variável DATABASE_URL existe no seu ficheiro .env
    url: process.env["DATABASE_URL"],
  },
});