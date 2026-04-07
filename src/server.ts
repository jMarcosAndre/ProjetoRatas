import 'dotenv/config'
import express from 'express'

import { autenticar, apenasAdmin } from './middleware/auth.js'

import { login, createUser, listUsers } from './Controller/UserController.js'
import { createProjeto, listProjetos, editProjeto, deleteProjeto, addColaborador, getPermissoes, getDashboard } from './Controller/ProjetoController.js'
import { getAll, getById, create, update, remove } from './Controller/RataController.js'
import { getGestacaoHandler, upsertGestacaoHandler } from './Controller/GestacaoController.js'
import { listFetosHandler, createFetoHandler, updateFetoHandler, deleteFetoHandler } from './Controller/FetoController.js'
import { listarDadosHandler, registrarDadosHandler, deletarDadosHandler } from './Controller/DadosGeraisController.js'
import { getTOTGHandler, upsertTOTGHandler } from './Controller/TOTGController.js'

const app = express()
app.use(express.json())

// --- Auth ---
app.post('/auth/login', login)

// --- Usuários (só ADMIN) ---
app.post('/users',  autenticar, apenasAdmin, createUser)
app.get('/users',   autenticar, apenasAdmin, listUsers)

// --- Projetos ---
app.post('/projects',                          autenticar, apenasAdmin, createProjeto)
app.get('/projects',                           autenticar, listProjetos)
app.put('/projects/:id',                       autenticar, apenasAdmin, editProjeto)
app.delete('/projects/:id',                    autenticar, apenasAdmin, deleteProjeto)
app.post('/projects/:id/colaboradores',        autenticar, apenasAdmin, addColaborador)
app.get('/projects/:id/permissoes',            autenticar, getPermissoes)
app.get('/projects/:id/dashboard',             autenticar, getDashboard)

// --- Ratas ---
app.get('/ratas',        autenticar, getAll)
app.get('/ratas/:id',    autenticar, getById)
app.post('/ratas',       autenticar, create)
app.put('/ratas/:id',    autenticar, update)
app.delete('/ratas/:id', autenticar, remove)

// --- Gestação (1:1 com Rata) ---
app.get('/ratas/:rataId/gestacao', autenticar, getGestacaoHandler)
app.put('/ratas/:rataId/gestacao', autenticar, upsertGestacaoHandler)

// --- Fetos (1:N com Rata) ---
app.get('/ratas/:rataId/fetos',  autenticar, listFetosHandler)
app.post('/ratas/:rataId/fetos', autenticar, createFetoHandler)
app.put('/fetos/:id',            autenticar, updateFetoHandler)
app.delete('/fetos/:id',         autenticar, deleteFetoHandler)

// --- TOTG (1:1 com Rata) ---
app.get('/ratas/:rataId/totg', autenticar, getTOTGHandler)
app.put('/ratas/:rataId/totg', autenticar, upsertTOTGHandler)

// --- Dados Gerais (1:N com Rata, múltiplos por dia) ---
app.get('/ratas/:rataId/dados-gerais',  autenticar, listarDadosHandler)
app.post('/ratas/:rataId/dados-gerais', autenticar, registrarDadosHandler)
app.delete('/dados-gerais/:id',         autenticar, deletarDadosHandler)

const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
