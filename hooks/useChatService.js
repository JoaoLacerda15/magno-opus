import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { listarChatsUsuario } from "../services/chatService";
import { useAuth } from "../context/authContext"; // Ajuste para onde está seu AuthContext

export function useChatService() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Pegando o ID do usuário logado

  const carregarChats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const meuId = user.id || user.uid; // Garante que pega o ID certo
      const dados = await listarChatsUsuario(meuId);
      // Ordena: mensagens mais recentes primeiro
      const ordenado = dados.sort((a, b) => {
        const dateA = a.mensagens ? Object.values(a.mensagens).pop()?.data : a.criadoEm;
        const dateB = b.mensagens ? Object.values(b.mensagens).pop()?.data : b.criadoEm;
        return new Date(dateB) - new Date(dateA);
      });
      setChats(ordenado);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect recarrega a lista toda vez que você volta para essa tela
  useFocusEffect(
    useCallback(() => {
      carregarChats();
    }, [user])
  );

  return { chats, loading, recarregar: carregarChats };
}