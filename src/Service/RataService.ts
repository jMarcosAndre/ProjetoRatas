import { PrismaClient } from '@prisma/client'
const prisma= new PrismaClient()

export class RataService {
    async cadastrarRata(data: {
        identificacao: number;
        numero: number;
        linhagem: 'Wistar' | 'Sprague-Dawley' | 'SHR' | 'WAR';
        dataNascimento: Date;
        dataFinalExperimento: Date;
        grupoInicial?: 'FDmod' | 'NDmod'; 
    }) {
        let idDoGrupoEncontrado: number | null = null

       
        if (data.grupoInicial) {
            const grupoBusca = await prisma.grupo.findFirst({
                where: { nomeGrupo: data.grupoInicial }
            });

            if (!grupoBusca) {
                throw new Error("Grupo experimental não encontrado.");
            }
            idDoGrupoEncontrado = grupoBusca.id;
        }

        return await prisma.rata.create({
            data: {
                identificacao: data.identificacao,
                numero: data.numero,
                linhagem: data.linhagem,
                dataNascimento: data.dataNascimento,
                dataFinalExperimento: data.dataFinalExperimento,
                inclusao: false,
                grupoId: idDoGrupoEncontrado
            },
            include: { grupo: true }
        });
    }

    async buscarRatasFiltradas(linhagem?: string, grupoNome?: string) {
        // Filtro para evitar erro de undefined
        const filtros: any = {};

        if (linhagem) filtros.linhagem = linhagem;
        
        if (grupoNome) {
            filtros.grupo = {
                nomeGrupo: grupoNome
            };
        }

        return await prisma.rata.findMany({
            where: filtros,
            include: { grupo: true }
        });
    }
}