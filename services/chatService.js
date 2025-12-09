import { ref, push, set, get, query, orderByChild, equalTo } from "firebase/database";
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
      status: "pendente", // ou "ativo", "concluído"
      mensagens: {},
      contrato: {
        servico: dadosContrato.servico || "Serviço não especificado",
        valor: dadosContrato.valor || "A combinar",
        descricao: dadosContrato.descricao || "",
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
          chats.push({ id_chat: child.key, ...child.val() });
        });
      }
    };

    processSnapshot(snapCliente);
    processSnapshot(snapTrabalhador);

    const chatsCompletos = await Promise.all(
      chatsIniciais.map(async (chat) => {
        const idOutroUsuario = chat.id_cliente === userId ? chat.id_trabalhador : chat.id_cliente;
        
        const userRef = ref(realtimeDB, `users/${idOutroUsuario}`);
        const userSnap = await get(userRef);
        const outroUsuarioData = userSnap.exists() ? userSnap.val() : { nome: "Usuário Desconhecido" };

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
