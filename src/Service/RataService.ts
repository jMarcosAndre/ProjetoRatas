import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { ProjetoService } from './ProjetoService'

export class RataService {
    private projetoService = new ProjetoService();

    /**
     * Cadastro de Rata vinculado a um projeto.
     * A trava agora verifica se o usuário é RESPONSAVEL no projeto ou ADMIN no sistema.
     */
    async cadastrarRata(projetoId: number, executorId: number, data: {
        identificacao: number;
        numero: number;
        linhagem: 'Wistar' | 'Sprague-Dawley' | 'SHR' | 'WAR';
        dataNascimento: Date;
        dataFinalExperimento: Date;
        grupo?: 'FDmod' | 'NDmod'; 
    }) {
        // Validação de Permissão (ProjetoService validará o RoleProjeto.RESPONSAVEL)
        await this.projetoService.validarPermissaoEscrita(projetoId, executorId);

        return await prisma.rata.create({
            data: {
            identificacao: data.identificacao,
            numero: data.numero,
            linhagem: data.linhagem,
            dataNascimento: data.dataNascimento,
            dataFinalExperimento: data.dataFinalExperimento,
            inclusao: false,
            grupo: data.grupo ?? null,
            // O campo agora será reconhecido após os passos acima
            projetoId: projetoId 
        }
    });
}

    /**
     * Método de Edição Geral da Rata.
     * Essencial para o botão de edição na sua tabela.
     */
    async update(id: number, projetoId: number, executorId: number, dadosParaAtualizar: {
        identificacao?: number;
        numero?: number;
        linhagem?: 'Wistar' | 'Sprague-Dawley' | 'SHR' | 'WAR';
        dataNascimento?: Date;
        dataFinalExperimento?: Date;
        inclusao?: boolean;
        morte?: boolean;
        grupo?: 'FDmod' | 'NDmod' | 'Controle' | 'DMod';
    }) {
        // Bloqueia a edição se o usuário for apenas COLABORADOR no projetoId enviado
        await this.projetoService.validarPermissaoEscrita(projetoId, executorId);

        const rataExiste = await prisma.rata.findUnique({ where: { id } });
        if (!rataExiste) throw new Error("Rata não encontrada.");

        return await prisma.rata.update({
            where: { id },
            data: {
                ...dadosParaAtualizar,
                grupo: dadosParaAtualizar.grupo ?? undefined
            }
        });
    }

    /**
     * Busca filtrada respeitando o contexto do projeto atual.
     */
    async buscarRatasFiltradas(filtros: {
        projetoId: number; 
        numero?: number;
        linhagem?: 'Wistar' | 'Sprague-Dawley' | 'SHR' | 'WAR';
        grupo?: 'FDmod' | 'NDmod' | 'Controle' | 'DMod';
        inclusao?: boolean;
    }) {
        const whereClause: any = {
            projetoId: filtros.projetoId
        };

        if (filtros.numero) whereClause.numero = filtros.numero;
        if (filtros.linhagem) whereClause.linhagem = filtros.linhagem;
        if (filtros.grupo) whereClause.grupo = filtros.grupo;
        
        if (filtros.inclusao !== undefined) {
            whereClause.inclusao = filtros.inclusao;
        }

        return await prisma.rata.findMany({
            where: whereClause,
            orderBy: { numero: 'asc' }
        });
    }
}