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
} from "react-native";

import BarraNavegacao from "../../components/navbar";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";

import AuthService from "../../services/authService";
const auth = new AuthService();

const { width } = Dimensions.get("window");

export default function Home() {
  const navigation = useNavigation();
  const route = useRoute();

  // 🆕 RECEBE O ID DO LOGIN
  const userId = route.params?.userId || null;

  // -------------------------------
  // 🔍 SISTEMA DE BUSCA
  // -------------------------------
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

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

  const executarBusca = async (query, tag = selectedTag) => {
    const data = await auth.searchUsers(query, tag);
    setResults(data);
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
  // MENU LATERAL + DADOS DO USUÁRIO LOGADO
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

  const menuItems = [
    { label: "Configuração", icon: "settings", route: "configuracoes" },
    { label: "Histórico", icon: "history", route: "conversasScreen" },
    { label: "Estatísticas", icon: "bar-chart", route: "Estatisticas" },
    { label: "Agenda", icon: "event", route: "calendario" },
    { label: "Favoritos", icon: "favorite", route: "notification" },

    // 🆕 ENVIA userId PARA O PERFIL
    { label: "Gerenciar Perfil", icon: "manage-accounts", route: "perfilPP", params: { userId } },
  ];

  return (
    <View style={{ flex: 1 }}>
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

            {results.map((user, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resultItem}
                onPress={() =>
                  navigation.navigate("perfilDoTrabalhador", { user })
                }
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {user.nome}
                </Text>
                <Text style={{ color: "gray" }}>{user.email}</Text>

                {user.tags?.length > 0 && (
                  <Text style={{ color: "#666", marginTop: 4 }}>
                    Tags: {user.tags.join(", ")}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}


      </ScrollView>

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
                    navigation.navigate(item.route, item.params || {});
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
  );
}

const styles = StyleSheet.create({
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
