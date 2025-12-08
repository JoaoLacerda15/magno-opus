import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { realtimeDB } from "../firebase/firebaseService";
import { auth } from "../context/authContext"; // depende do seu contexto de autenticação

export function useChatService() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = auth?.currentUser?.uid;
    if (!userId) {
      setLoading(false);
      return;
    }

    const chatsRef = ref(realtimeDB, "chats");

    // Escuta em tempo real os chats
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setChats([]);
        setLoading(false);
        return;
      }

      // Filtra os chats onde o usuário é cliente ou trabalhador
      const todos = Object.entries(data).map(([id, value]) => ({
        id_chat: id,
        ...value,
      }));

      const relacionados = todos.filter(
        (chat) => chat.id_cliente === userId || chat.id_trabalhador === userId
      );

      setChats(relacionados);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { chats, loading };
}
