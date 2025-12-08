import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator, // Importado para mostrar loading
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AuthService from "../../services/authService";
import BarraNavegacao from "../../components/navbar";

const auth = new AuthService();

export default function PerfilPP() {
  const route = useRoute();
  const navigation = useNavigation();
  const userId = route.params?.userId;

  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true); // Adicionando estado de carregamento

  React.useEffect(() => {
    async function carregarUsuario() {
      setLoading(true); // Inicia o carregamento

      if (!userId) {
        console.warn("❌ ERRO DE ROTA: userId não foi passado para a tela PerfilPP.");
        setLoading(false);
        return;
      }
      
      console.log(`✅ Tentando carregar usuário com ID: ${userId}`);

      try {
        const dados = await auth.getUserById(userId);
        
        if (dados) {
          console.log("✅ Dados do usuário carregados com sucesso.");
        } else {
          console.warn("⚠️ Usuário não encontrado no banco de dados.");
        }
        
        setUser(dados);
      } catch (e) {
        // Log de erro fundamental para debug de falhas no Firebase/Rede
        console.error("❌ ERRO ao carregar usuário via getUserById:", e.message);
        setUser(null);
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    }

    carregarUsuario();
  }, [userId]);

  // PROFISSÃO = primeira tag marcada
  const profissao =
    user?.tags?.length > 0 ? user.tags[0] : "Profissão não informada";

  // ----------------------------------------------------
  // 🔍 Tela de Carregamento ou Usuário Não Encontrado
  // ----------------------------------------------------
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={{ marginTop: 10 }}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#E53935" />
        <Text style={{ fontSize: 16, color: "#E53935", marginTop: 10 }}>
          Usuário não encontrado ou ID inválido.
        </Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // ----------------------------------------------------
  // 🖼️ Renderização Principal do Perfil
  // ----------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                // Usando a primeira letra do nome como fallback (opcional)
                <Text style={styles.avatarText}>{user.nome ? user.nome[0].toUpperCase() : '?'}</Text>
              )}
            </View>

            {/* Nome */}
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#222" }}>
              {user?.nome || "Usuário Desconhecido"}
            </Text>

            {/* Profissão via TAG */}
            <Text style={styles.jobTitle}>
              {profissao}
            </Text>

            {/* Localização */}
            <Text style={styles.location}>
              {user?.cep
                ? `${user.cep}${user?.estado ? ", " + user.estado : ""}`
                : "Localização não informada"}
            </Text>

            {/* Sobre mim */}
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Sobre mim:</Text>

              <Text style={styles.aboutText}>
                {user?.bio && typeof user.bio === "string" && user.bio.trim() !== ""
                  ? user.bio
                  : "Nenhuma descrição informada"}
              </Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>Portfólio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>Comentários</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>Agenda</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>Conversar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Analytics Section (mantida como estava) */}
          <View style={styles.analyticsSection}>
            <View style={styles.analyticsTitleContainer}>
              <Text style={styles.analyticsTitle}>Análise</Text>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#333" />
            </View>
            {/* ... Itens de Análise ... */}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BarraNavegacao />
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1 },

  // Estilo para o estado de carregamento/erro
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  header: {
    backgroundColor: "#1565C0",
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  backButton: { width: 40, height: 40, justifyContent: "center" },

  profileSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },

  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd", // Cor de fundo para o fallback
    marginBottom: 12,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
  },
  // Estilo para a letra inicial do nome
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },

  jobTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },

  location: { fontSize: 14, color: "#666", marginBottom: 16 },

  aboutSection: { width: "100%", marginBottom: 20 },
  aboutTitle: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 4 },
  aboutText: { fontSize: 14, color: "#333", lineHeight: 20 },

  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },

  actionButton: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  analyticsSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },

  analyticsTitleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 8 },
  analyticsTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },

  statItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20, gap: 12 },
  statTextContainer: { flex: 1 },
  statNumber: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 4 },
  statDescription: { fontSize: 12, color: "#666", lineHeight: 16 },
});