import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ref, onValue, push, set } from "firebase/database";
import { realtimeDB } from "../../firebase/firebaseService";
import { useAuth } from "../../context/authContext";
import MenuChat from "./MenuChat";

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  const { chatId, outroUsuario } = route.params || {};
  const { user } = useAuth(); // Seu hook de auth

  const myId = user?.id || user?.uid;

  const [mensagens, setMensagens] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  const [menuVisible, setMenuVisible] = useState(false);

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
          id_usuario: myId,
          mensagem: msgTemp,
          data: new Date().toISOString(),
        });
    } catch (error) {
        console.error(error);
        setNovaMensagem(msgTemp); // Devolve texto se falhar
    }
  }

  const renderItem = ({ item }) => { // Parte das mensagens slk
    const isMyMessage = item.id_usuario === user?.uid || item.id_usuario === user?.id;
    return (
      <View style={[
          styles.messageRow, 
          isMyMessage ? styles.rowEnd : styles.rowStart
      ]}>
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myBubble : styles.otherBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.mensagem}</Text>
        </View>

        <Text style={styles.timeText}>
            {new Date(item.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (!user) {
      return (
          <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
              <ActivityIndicator size="large" color="#007bff" />
          </View>
      )
  }

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

         <Text style={styles.headerTitle}>
          {outroUsuario?.nome || "Chat"}
         </Text>

           {/* Botão do MenuChat */}
         <TouchableOpacity
           onPress={() => setMenuVisible(true)}
            style={{ padding: 4 }}
          >
            <Ionicons name="menu" size={26} color="#333" />
         </TouchableOpacity>
       </View>
         <MenuChat
           visible={menuVisible}
           onClose={() => setMenuVisible(false)}
           chatId={chatId}
           outroUsuario={outroUsuario}
         />

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
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
   headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  messageRow: {
    marginBottom: 12,
    maxWidth: "75%", // Limita a largura total para não encostar na outra borda
  },
  // Alinhamento para MINHAS mensagens (Direita)
  rowEnd: {
    alignSelf: "flex-end",
    alignItems: "flex-end", // Alinha o texto da hora à direita também
  },
  // Alinhamento para OUTRAS mensagens (Esquerda)
  rowStart: {
    alignSelf: "flex-start",
    alignItems: "flex-start", // Alinha o texto da hora à esquerda
  },

  // Estilo do Balão
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 2, // Efeito visual de "bico" do chat
  },
  otherBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 2, // Efeito visual de "bico" do chat
  },

  messageText: { fontSize: 15, color: '#000' },
  
  // Estilo da Hora
  timeText: {
      fontSize: 11,
      color: "#999",
      marginTop: 4, // Espaço entre o balão e a hora
      marginHorizontal: 2
  },
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
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
  },
});
