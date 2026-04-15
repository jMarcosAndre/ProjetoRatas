// Script para criar o usuário admin inicial
// Uso: node --loader ts-node/esm prisma/seed.ts
import 'dotenv/config'
import { prisma } from '../src/lib/prisma.js'
import bcrypt from 'bcrypt'

const hash = await bcrypt.hash('joao2605', 10)

const user = await prisma.user.upsert({
  where:  { email: 'jm.andrevaz@gmail.com' },
  update: {},
  create: {
    nome:        'João',
    email:       'jm.andrevaz@gmail.com',
    password:    hash,
    roleSistema: 'ADMIN',
  },
})

console.log('Admin criado com sucesso:', user.email, '|', user.roleSistema)
await prisma.$disconnect()
