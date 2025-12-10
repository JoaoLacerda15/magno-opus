import { ref, push, set } from "firebase/database";
import { realtimeDB } from "../firebase/firebaseService";

/**
 * Envia uma notificação para um usuário específico
 */
export async function enviarNotificacao(destinatarioId, dadosProposta, remetente, chatId) {
  try {
    const notificacoesRef = ref(realtimeDB, `notificacoes/${destinatarioId}`);
    const novaNotifRef = push(notificacoesRef);

    const servicosTexto = dadosProposta.servicos.join(", ");
    const mensagemCorpo = `Oferta de R$${dadosProposta.valor} para ${servicosTexto}. \nLocal: ${dadosProposta.endereco}`;

    await set(novaNotifRef, {
      titulo: "Nova Proposta de Serviço",
      mensagem: mensagemCorpo,
      data: new Date().toISOString(),
      lida: false,
      tipo: "proposta",
      chatIdRelacionado: chatId,
      dadosDetalhados: {
        valor: dadosProposta.valor,
        servicos: dadosProposta.servicos,
        descricao: dadosProposta.descricao,
        endereco: dadosProposta.endereco,
        remetenteId: remetente.id || remetente.uid,
        remetenteNome: remetente.nome
      }
    });

    console.log("✅ Notificação enviada com sucesso!");
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    throw error;
  }
}

export async function notificarRecusa(remetenteId, destinatarioNome, servicoNome) {
    try {
        const notifRef = ref(realtimeDB, `notificacoes/${remetenteId}`);
        const novaNotifRef = push(notifRef);

        await set(novaNotifRef, {
            titulo: "Proposta Recusada",
            mensagem: `Sua proposta para ${servicoNome} foi recusada por ${destinatarioNome}.`,
            data: new Date().toISOString(),
            lida: false,
            tipo: "aviso_recusa", // Tipo diferente para apenas exibir
            dadosDetalhados: {
                remetenteNome: destinatarioNome // Para aparecer a foto/nome de quem recusou
            }
        });
        console.log("✅ Remetente notificado sobre a recusa.");
    } catch (error) {
        console.error("Erro ao notificar recusa:", error);
    }
}