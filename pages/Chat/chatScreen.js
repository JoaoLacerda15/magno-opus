import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { ref, onValue, push, set } from "firebase/database";
import { realtimeDB } from "../../firebase/firebaseService";
import { useAuth } from "../../context/authContext";

export default function chatScreen() {
  const route = useRoute?.() || {};
  const chatId = route.params?.chatId || "chat_teste_123";

  // Se o contexto de autenticação não estiver configurado, define um user padrão
  const auth = useAuth?.() || {};
  const user = auth.user || { uid: "usuario_teste_001", nome: "Usuário de Teste" };

  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  useEffect(() => {
    // Protege contra falta de banco durante testes offline
    if (!realtimeDB) {
      console.warn("⚠️ Firebase Realtime Database não configurado. Usando modo de teste local.");
      return;
    }

    const mensagensRef = ref(realtimeDB, `chats/${chatId}/mensagens`);
    const unsubscribe = onValue(mensagensRef, (snapshot) => {
      if (snapshot.exists()) {
        const dados = Object.values(snapshot.val());
        setMensagens(dados);
      } else {
        setMensagens([]);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  async function enviarMensagem() {
    if (!novaMensagem.trim()) return;

    if (!realtimeDB) {
      console.log("Mensagem enviada (modo teste):", novaMensagem);
      setMensagens((prev) => [
        ...prev,
        {
          id_usuario: user.uid,
          mensagem: novaMensagem,
          data: new Date().toISOString(),
        },
      ]);
      setNovaMensagem("");
      return;
    }

    const mensagensRef = ref(realtimeDB, `chats/${chatId}/mensagens`);
    const novaMensagemRef = push(mensagensRef);

    const mensagem = {
      id_usuario: user.uid,
      mensagem: novaMensagem,
      data: new Date().toISOString(),
    };

    await set(novaMensagemRef, mensagem);
    setNovaMensagem("");
  }

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.message,
        item.id_usuario === user.uid ? styles.myMessage : styles.otherMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.mensagem}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mensagens}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 16 }}
      />



      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={novaMensagem}
          onChangeText={setNovaMensagem}
        />
        <TouchableOpacity onPress={enviarMensagem}>
          <Ionicons name="send" size={26} color="#007bff" />
        </TouchableOpacity>
      </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  message: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#E5E5EA",
  },
  messageText: { fontSize: 15 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 20,
    marginRight: 10,
  },
});
