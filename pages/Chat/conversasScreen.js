import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useChatService } from "../../hooks/useChatService";
import BarraNavegacao from "../../components/navbar";

export default function conversasScreen() {
  const { chats, loading } = useChatService();
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    const ultimaMensagem =
      item.mensagens && Object.values(item.mensagens).length > 0
        ? Object.values(item.mensagens).at(-1).mensagem
        : "Nenhuma mensagem";

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => navigation.navigate("chat", { chatId: item.id_chat })}
      >
        <Image
          source={
            item.outroUsuario?.photoURL
              ? { uri: item.outroUsuario.photoURL }
              : require("../../assets/cpu.png")
          }
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>
            {item.outroUsuario?.nome || "Trabalhador"}
          </Text>
          <Text style={styles.lastMessage}>{ultimaMensagem}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Conversas</Text>
        <Ionicons name="chatbubble-outline" size={24} color="black" />
      </View>

      {/* Botão inspirado na imagem (agora com ícone de pessoa) */}
      <TouchableOpacity
        style={styles.customButton}
        onPress={() => navigation.navigate("chatScreen")}
      >
        <Ionicons name="person-outline" size={20} color="#000000ff" />
        <Text style={styles.customButtonText}>usuario</Text>
      </TouchableOpacity>

      {/* Lista de conversas */}
      {loading ? (
        <Text style={styles.loadingText}>Carregando conversas...</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id_chat}
          renderItem={renderItem}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>
              Você ainda não iniciou nenhum contrato.
            </Text>
          )}
        />
      )}
      <BarraNavegacao />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold" },

  // --- Botão personalizado ---
  customButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B8DDFF",
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  customButtonText: {
    color: "#000000ff",
    fontSize: 16,
    marginLeft: 8,
    fontWeight: "600",
  },

  // --- Lista de chats ---
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: "bold" },
  lastMessage: { color: "#666", marginTop: 2 },
  loadingText: { textAlign: "center", marginTop: 30 },
  emptyText: { textAlign: "center", marginTop: 30, color: "#888" },
});
