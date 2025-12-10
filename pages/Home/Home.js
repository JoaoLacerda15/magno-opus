import React, { useState, useRef, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator, // Adicionado para a tela de carregamento do ID
} from "react-native";
import BarraNavegacao from "../../components/navbar";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthService from "../../services/authService";
import { useAuth } from "../../context/authContext";
import { listarChatsUsuario } from "../../services/chatService";

const auth = new AuthService();
const { width } = Dimensions.get("window");

export default function Home() {
  const navigation = useNavigation();

  const { user, loading } = useAuth();

  const route = useRoute();

  // 1. ESTADO CENTRALIZADO E DE CARREGAMENTO
  const loggedUserId = user?.id || user?.uid || null;

  // -------------------------------
  // 🔍 SISTEMA DE BUSCA (mantido)
  // -------------------------------
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loadingBusca, setLoadingBusca] = useState(true);

  const [idsComChat, setIdsComChat] = useState(new Set());

  const tagsDisponiveis = [
    "limpeza",
    "pedreiro",
    "técnico",
    "jardim",
    "pintura",
    "reforma",
    "Marceneiro",
    "Encanador",
    "Eletricista",
  ];

  useEffect(() => {
    async function carregarDadosIniciais() {
        if (!loggedUserId) return;

        setLoadingBusca(true);
        try {
            // Busca os chats existentes
            const meusChats = await listarChatsUsuario(loggedUserId);
            
            // Cria um Set com os IDs das outras pessoas
            const idsBloqueados = new Set();
            meusChats.forEach(chat => {
                const outroId = chat.id_cliente === loggedUserId ? chat.id_trabalhador : chat.id_cliente;
                if (outroId) idsBloqueados.add(outroId);
            });

            setIdsComChat(idsBloqueados);

            // Agora sim, executa a busca inicial passando os IDs bloqueados manualmente
            // (pois o estado setIdsComChat pode não ter atualizado ainda neste ciclo)
            await executarBusca("", null, idsBloqueados);

        } catch (error) {
            console.error("Erro ao carregar chats:", error);
            // Se der erro nos chats, busca usuários mesmo assim
            await executarBusca(""); 
        } finally {
            setLoadingBusca(false);
        }
    }

    carregarDadosIniciais();
  }, [loggedUserId]);

  const executarBusca = async (query, tag = selectedTag) => {
    setLoadingBusca(true)
    try {
      const data = await auth.searchUsers(query, tag);
      
      const resultadosFiltrados = data.filter(usuario => {
        const isTrabalhador = usuario.userType?.toLowerCase() === 'trabalhador';        
        const isNotMe = usuario.id !== loggedUserId;
        return isTrabalhador && isNotMe;
      });

      setResults(resultadosFiltrados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingBusca(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
  };

  const buscarApertarEnter = () => {
    executarBusca(search);
  };

  const filtrarPorTag = (tag) => {
    const novaTag = tag === selectedTag ? null : tag;
    setSelectedTag(novaTag);
    executarBusca(search, novaTag);
  };

  // -------------------------------
  // MENU LATERAL (Define os itens do menu com o ID ATUALIZADO)
  // -------------------------------
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(width)).current;

  const toggleMenu = () => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setMenuVisible(false));
    } else {
      setMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Os itens do menu são definidos AQUI para usar o estado atualizado de loggedUserId
  const menuItems = [
    { label: "Configuração", icon: "settings", route: "configuracoes" },
    { label: "Histórico", icon: "history", route: "conversasScreen" },
    { label: "Estatísticas", icon: "bar-chart", route: "Estatisticas" },
    { label: "Agenda", icon: "event", route: "calendario" },
    { label: "Favoritos", icon: "favorite", route: "notification" },

    // Envia o ID PERSISTENTE (loggedUserId) para o Perfil PP
    { 
        label: "Gerenciar Perfil", 
        icon: "manage-accounts", 
        route: "perfilPP", 
        params: { userId: loggedUserId } 
    },
  ];
  
  // -------------------------------
  // ⚠️ TELA DE CARREGAMENTO ENQUANTO BUSCA O ID
  // -------------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  // -------------------------------
  // RENDERIZAÇÃO PRINCIPAL
  // -------------------------------
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingBottom: '20%'}}>
        <ScrollView style={styles.container}>
          {/* 🔍 BARRA DE PESQUISA */}
          <View style={styles.searchBar}>
            <Icon name="search" size={24} color="gray" />
            <TextInput
              placeholder="Pesquisar nome ou serviço..."
              style={{ flex: 1, marginLeft: 8 }}
              value={search}
              onChangeText={handleSearch}
              onSubmitEditing={buscarApertarEnter}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={toggleMenu}>
              <Icon name="settings" size={26} color="black" />
            </TouchableOpacity>
          </View>

          {/* TAGS DE FILTRO */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {tagsDisponiveis.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tagButton,
                  selectedTag === tag && styles.tagButtonAtivo,
                ]}
                onPress={() => filtrarPorTag(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === tag && styles.tagTextAtivo,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* RESULTADOS */}
          {results.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>Resultados da Busca:</Text>
              {results.map((userRes, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.resultItem}
                  onPress={() =>
                    navigation.navigate("perfilPP", { userId: userRes.id }) // Ajuste para rota correta
                  }
                >
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {userRes.nome}
                  </Text>
                  <Text style={{ color: "gray" }}>{userRes.email}</Text>
                  {userRes.tags?.length > 0 && (
                    <Text style={{ color: "#666", marginTop: 4 }}>
                      Tags: {userRes.tags.join(", ")}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* NAVBAR: Não precisa passar props, ela pega do AuthContext */}
        <BarraNavegacao />

        {/* MENU LATERAL */}
        {menuVisible && (
          <TouchableOpacity
            activeOpacity={1}
            onPress={toggleMenu}
            style={styles.overlay}
          >
            <Animated.View
              style={[
                styles.sideMenu,
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={toggleMenu}>
                  <Icon name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <View style={styles.menuContent}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => {
                      toggleMenu();
                      if (item.route) {
                          navigation.navigate(item.route, item.params || {});
                      }
                    }}
                  >
                    <Icon name={item.icon} size={24} color="#444" />
                    <Text style={styles.menuText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Estilo para o carregamento do ID
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: '10%'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333'
  },
  
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },

  resultItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 10,
  },

  tagButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },

  tagButtonAtivo: {
    backgroundColor: "#007bff",
  },

  tagText: {
    color: "#555",
    fontWeight: "bold",
  },

  tagTextAtivo: {
    color: "#fff",
  },

  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  sideMenu: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    width: width * 0.7,
    backgroundColor: "#fff",
    padding: 20,
    elevation: 10,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },

  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  menuContent: {
    marginTop: 20,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
});