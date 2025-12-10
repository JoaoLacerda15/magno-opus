import { ref, get } from "firebase/database";
import { realtimeDB } from "../firebase/firebaseService"; 

export const getAgendaUsuario = async (userId) => {
    try {
        if (!realtimeDB) throw new Error("Banco de dados não inicializado");
        
        const agendaRef = ref(realtimeDB, `agenda/${userId}`);
        const snapshot = await get(agendaRef);

        if (!snapshot.exists()) return [];

        const data = snapshot.val(); 
        const promessas = [];

        // Função auxiliar para processar um único item (mesclar com chat se precisar)
        const prepararItem = async (item, idOriginal, dataKey) => {
            let itemFinal = {
                id: idOriginal,
                date: dataKey,
                ...item
            };

            // SE tiver chatId E não for manual, busca os dados completos no Chat
            if (item.chatId && item.status !== 'formulario') {
                try {
                    const chatRef = ref(realtimeDB, `chats/${item.chatId}`);
                    const chatSnap = await get(chatRef);
                    
                    if (chatSnap.exists()) {
                        const chatData = chatSnap.val();
                        const contrato = chatData.contrato || {}; 

                        // Mesclagem inteligente de dados
                        itemFinal = {
                            ...itemFinal,
                            servico: itemFinal.servico || contrato.servico || contrato.titulo || "Serviço Integrado",
                            nomeCliente: itemFinal.nomeCliente || contrato.nomeCliente || contrato.cliente || "Cliente",
                            time: itemFinal.time || contrato.horario || contrato.hora || "",
                            local: itemFinal.local || contrato.endereco || contrato.local || "Local a definir",
                            valor: itemFinal.valor || contrato.valor || "0,00",
                            descricao: itemFinal.descricao || contrato.descricao || ""
                        };
                    }
                } catch (err) {
                    console.log(`Erro ao buscar chat ${item.chatId}`, err);
                }
            }
            return itemFinal;
        };

        // 1. Percorre as datas
        Object.keys(data).forEach(dateKey => {
            const conteudoDoDia = data[dateKey];
            
            if (!conteudoDoDia) return;

            // --- CORREÇÃO AQUI ---
            // Verifica se o objeto já possui chaves de evento (estrutura "quebrada" do Bernardo)
            // Se tiver 'status' ou 'servico' direto na raiz do dia, é um evento único.
            const keys = Object.keys(conteudoDoDia);
            const pareceEventoUnico = keys.includes('status') || keys.includes('servico') || keys.includes('chatId');

            if (pareceEventoUnico) {
                // TRATAMENTO PARA O CASO DO BERNARDO
                // O próprio conteudoDoDia é o evento
                promessas.push(prepararItem(conteudoDoDia, `fix_${dateKey}`, dateKey));
            } else {
                // TRATAMENTO PADRÃO (ARTHUR e outros)
                // É um mapa de IDs { "id1": {...}, "id2": {...} }
                keys.forEach(agendamentoKey => {
                    const item = conteudoDoDia[agendamentoKey];
                    // Garante que é um objeto antes de processar
                    if (item && typeof item === 'object') {
                        promessas.push(prepararItem(item, agendamentoKey, dateKey));
                    }
                });
            }
        });
        
        // 3. Aguarda e resolve tudo
        const listaCompleta = await Promise.all(promessas);

        // 4. Ordena por Data
        return listaCompleta.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
            const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
            return dateA - dateB;
        });

    } catch (error) {
        console.error("Erro ao buscar agenda:", error);
        throw error;
    }
};