import React, { useState, useEffect } from "react";
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
import { useAuth } from "../../context/authContext";

const authService = new AuthService();

export default function PerfilPP() {
  const route = useRoute();
  const navigation = useNavigation();

  const { user: userLogado } = useAuth();

  const targetUserId = route.params?.userId || userLogado?.id || userLogado?.uid;

  const [perfilExibido, setPerfilExibido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosDoPerfil() {
      setLoading(true);

      if (!targetUserId) {
        console.warn("Nenhum ID identificado para exibir o perfil.");
        setLoading(false);
        return;
      }

      if (userLogado && targetUserId === userLogado.id) {
        console.log("✅ Exibindo dados do próprio usuário (via Contexto)");
        setPerfilExibido(userLogado);
        setLoading(false);
        return;
      }

      console.log(`🔍 Buscando dados do usuário ID: ${targetUserId}`);
      try {
        const dados = await authService.getUserById(targetUserId);
        setPerfilExibido(dados);
      } catch (e) {
        console.error("❌ Erro ao buscar perfil:", e.message);
        setPerfilExibido(null);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDoPerfil();
  }, [targetUserId, userLogado]);

  // PROFISSÃO = primeira tag marcada
  const profissao =
    perfilExibido?.tags?.length > 0 ? perfilExibido.tags[0] : "Profissão não informada";

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

  if (!perfilExibido) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#E53935" />
        <Text style={{ fontSize: 16, color: "#E53935", marginTop: 10 }}>
          Perfil não encontrado.
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
              {perfilExibido?.avatar ? (
                <Image 
                  source={{ uri: perfilExibido.avatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                // Usando a primeira letra do nome como fallback (opcional)
                <Text style={styles.avatarText}>
                  {perfilExibido.nome ? perfilExibido.nome[0].toUpperCase() : '?'}
                </Text>
              )}
            </View>

            {/* Nome */}
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#222" }}>
              {perfilExibido?.nome || "Usuário"}
            </Text>

            {/* Profissão via TAG */}
            <Text style={styles.jobTitle}>
              {profissao}
            </Text>

            {/* Localização */}
            <Text style={styles.location}>
              {perfilExibido?.cidade && perfilExibido?.estado
                ? `${perfilExibido.cidade} - ${perfilExibido.estado}`
                : `CEP: '${perfilExibido?.cep}'`|| "Localização não informada"}
            </Text>

            {/* Sobre mim */}
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Sobre mim:</Text>

              <Text style={styles.aboutText}>
                {perfilExibido?.bio || "Nenhuma descrição informada"}
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

              {/* SÓ MOSTRA O BOTÃO CONVERSAR SE NÃO FOR EU MESMO */}
              {userLogado?.id !== perfilExibido.id && (
                <TouchableOpacity 
                    style={[styles.actionButton, { width: '100%' }]}
                    // Importante: Passando o ID do usuário alvo para o chat
                    onPress={() => navigation.navigate('chatScreen', {
                        targetUserId: perfilExibido.id // ID de com quem quero falar
                    })}
                >
                    <Text style={styles.buttonText}>Conversar</Text>
                </TouchableOpacity>
              )}

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