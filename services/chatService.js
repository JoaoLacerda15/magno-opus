import { ref, push, set, get, query, orderByChild, equalTo, remove } from "firebase/database";
import { realtimeDB } from "../firebase/firebaseService";

/**
 * Cria um novo chat (contrato) entre um cliente e um trabalhador.
 * @param {string} id_cliente - ID do usuário que está contratando.
 * @param {string} id_trabalhador - ID do trabalhador.
 * @param {object} dadosContrato - Dados adicionais do contrato (ex: serviço, valor, descrição).
 */
export async function criarChat(id_cliente, id_trabalhador, dadosContrato = {}) {
  try {
    if (!realtimeDB) throw new Error("Banco de dados não inicializado");

    const chatsRef = ref(realtimeDB, "chats");
    const novoChatRef = push(chatsRef);

    const novoChat = {
      id_cliente,
      id_trabalhador,
      criadoEm: new Date().toISOString(),
      status: "pendente", 
      mensagens: {},
      contrato: {
        status_contrato: "aguardando_aceite"
      },
    };

    await set(novoChatRef, novoChat);
    console.log("✅ Chat (contrato) criado com sucesso:", novoChatRef.key);
    return novoChatRef.key;
  } catch (error) {
    console.error("Erro ao criar chat:", error);
    throw error;
  }
}

export async function atualizarContratoChat(chatId, dadosContrato) {
    try {
        const contratoRef = ref(realtimeDB, `chats/${chatId}/contrato`);
        const statusRef = ref(realtimeDB, `chats/${chatId}/status`);

        // CORREÇÃO: Usando a variável correta 'dadosContrato'
        const contratoFinal = {
            valor: dadosContrato.valor,
            servicos: dadosContrato.servicos, 
            descricao: dadosContrato.descricao,
            endereco: dadosContrato.endereco, 
            remetenteNome: dadosContrato.remetenteNome || "", 
            dataInicio: new Date().toISOString(),
            status_contrato: "ativo"
        };
        
        await set(contratoRef, contratoFinal);
        await set(statusRef, "ativo"); 
        
        console.log("✅ Contrato atualizado e ativado!");
    } catch (error) {
        console.error("Erro ao atualizar contrato:", error);
    }
}

export async function recusarContratoChat(chatId) {
    try {
        if (!chatId) {
            console.error("❌ Tentativa de deletar chat sem ID.");
            return;
        }

        console.log(`🗑️ Tentando deletar chat ID: ${chatId}`);

        // Referência direta para o chat
        const chatRef = ref(realtimeDB, `chats/${chatId}`);
        
        // Remove o chat inteiro do banco de dados
        await remove(chatRef);

        console.log("✅ Chat deletado com sucesso.");
    } catch (error) {
        console.error("Erro ao deletar chat recusado:", error);
        throw error;
    }
}

/**
 * Busca todos os chats relacionados a um usuário (cliente ou trabalhador).
 * @param {string} userId - ID do usuário logado.
 * @returns {Array} Lista de chats.
 */
export async function listarChatsUsuario(userId) {
  try {
    const chatRef = ref(realtimeDB, "chats");

    // Busca tanto como cliente quanto como trabalhador
    const queryCliente = query(chatRef, orderByChild("id_cliente"), equalTo(userId));
    const queryTrabalhador = query(chatRef, orderByChild("id_trabalhador"), equalTo(userId));

    const [snapCliente, snapTrabalhador] = await Promise.all([get(queryCliente), get(queryTrabalhador)]);

    const chatsIniciais = [];

    const processSnapshot = (snap) => {
      if (snap.exists()) {
        snap.forEach((child) => {
          chatsIniciais.push({ id_chat: child.key, ...child.val() });
        });
      }
    };

    processSnapshot(snapCliente);
    processSnapshot(snapTrabalhador);

    const chatsUnicos = chatsIniciais.filter((chat, index, self) =>
      index === self.findIndex((t) => t.id_chat === chat.id_chat)
    );
    
    const chatsCompletos = await Promise.all(
      chatsIniciais.map(async (chat) => {
        const idOutroUsuario = chat.id_cliente === userId ? chat.id_trabalhador : chat.id_cliente;
        
        const userRef = ref(realtimeDB, `users/${idOutroUsuario}`);
        const userSnap = await get(userRef);
        let outroUsuarioData = { nome: "Usuário", photoURL: null };

        if (userSnap.exists()) {
            const data = userSnap.val();
            outroUsuarioData = {
                nome: data.nome || data.name || "Usuário",
                photoURL: data.photoURL || data.avatar || data.foto || null
            };
        }

        return {
          ...chat,
          outroUsuario: outroUsuarioData // Agora a gente tem nome e foto! :)
        };
      })
    );

    return chatsCompletos;
  } catch (error) {
    console.error("Erro ao listar chats do usuário:", error);
    return [];
  }
}

/**
 * Envia uma nova mensagem dentro de um chat.
 */
export async function enviarMensagem(chatId, id_usuario, texto) {
  try {
    if (!texto.trim()) return;

    const mensagensRef = ref(realtimeDB, `chats/${chatId}/mensagens`);
    const novaMensagemRef = push(mensagensRef);

    const mensagem = {
      id_usuario,
      mensagem: texto,
      data: new Date().toISOString(),
    };

    await set(novaMensagemRef, mensagem);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
  }
}
