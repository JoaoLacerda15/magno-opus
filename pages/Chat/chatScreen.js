import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ref, onValue, push, set } from "firebase/database";
import { realtimeDB } from "../../firebase/firebaseService";
import { useAuth } from "../../context/authContext";

export default function chatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const { chatId } = route.params || {};
  

  // Se o contexto de autenticação não estiver configurado, define um user padrão
  const { user } = useAuth(); // Seu hook de auth
  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  useEffect(() => {
    if (!chatId) return;

    const mensagensRef = ref(realtimeDB, `chats/${chatId}/mensagens`);
    
    // Listener em tempo real
    const unsubscribe = onValue(mensagensRef, (snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val();
        // Converte objeto em array e ordena por data (caso necessário)
        const listaMensagens = Object.values(dados).sort((a, b) => 
            new Date(a.data) - new Date(b.data)
        );
        setMensagens(listaMensagens);
      } else {
        setMensagens([]);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => { //Rolar pro fum toda vez q o infeliz mandar mensagem
    if (mensagens.length > 0) {
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [mensagens]);

  async function handleEnviarMensagem() {
    if (!novaMensagem.trim()) return;

    const msgTemp = novaMensagem;
    setNovaMensagem(""); // Limpa input rápido para UX

    try {
        const mensagensRef = ref(realtimeDB, `chats/${chatId}/mensagens`);
        const novaMensagemRef = push(mensagensRef);
    
        await set(novaMensagemRef, {
          id_usuario: user.uid, // ou user.id dependendo do seu context
          mensagem: msgTemp,
          data: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        setNovaMensagem(msgTemp); // Devolve texto se falhar
    }
  }

  const renderItem = ({ item }) => {
    const isMyMessage = item.id_usuario === user?.uid || item.id_usuario === user?.id;
    return (
      <View
        style={[
          styles.message,
          isMyMessage ? styles.myMessage : styles.otherMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.mensagem}</Text>
        <Text style={styles.timeText}>
            {new Date(item.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Ajuste conforme seu Header
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mensagens}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite uma mensagem..."
          value={novaMensagem}
          onChangeText={setNovaMensagem}
          multiline
        />
        <TouchableOpacity onPress={handleEnviarMensagem} disabled={!novaMensagem.trim()}>
          <Ionicons 
            name="send" 
            size={26} 
            color={novaMensagem.trim() ? "#007bff" : "#ccc"} 
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { 
      padding: 16, 
      paddingTop: 50, // Ajuste para StatusBar
      borderBottomWidth: 1, 
      borderBottomColor: "#eee",
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10
  },
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
  myMessageText: { color: "#fff" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    color: props => props.myMessage ? '#fff' : '#000'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 20,
    marginRight: 10,
    maxHeight: 100,
  },
});
