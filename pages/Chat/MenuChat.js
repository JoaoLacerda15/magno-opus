import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Tamanho da tela (para animação)
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function MenuChat({
  visible,
  onClose,
  id_user,
  contratoId,
  isTrabalhador, // true = trabalhador / false = contratante
}) {
  const [slideAnim] = useState(new Animated.Value(-SCREEN_WIDTH)); // animação
  const [userInfo, setUserInfo] = useState(null);
  const [contratoInfo, setContratoInfo] = useState(null);

  // MOCK: apenas estrutura — você pluga o Firebase depois
  async function carregarDados() {
    // Simula carregamento via Firebase (coloque seus gets aqui)
    const fakeUser = {
      nome: "Jane Marie Doe",
      foto: "https://i.pravatar.cc/300",
    };

    const fakeContrato = {
      descricao: "Pintar parede do quarto (cor azul bebê).",
      data: "20/02/2025",
      horario: "14:00",
      valor: "R$ 250,00",
      local: "Rua das Flores, 123",
    };

    setUserInfo(fakeUser);
    setContratoInfo(fakeContrato);
  }

  useEffect(() => {
    if (visible) {
      carregarDados();

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      slideAnim.setValue(-SCREEN_WIDTH);
    }
  }, [visible]);

  if (!userInfo || !contratoInfo) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Área escura */}
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      {/* menu */}
      <Animated.View style={[styles.menuContainer, { left: slideAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Fechar */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>

          {/* FOTO + NOME */}
          <View style={styles.profileSection}>
            <Image source={{ uri: userInfo.foto }} style={styles.avatar} />
            <Text style={styles.profileName}>{userInfo.nome}</Text>
          </View>

          {/* Linha separadora */}
          <View style={styles.separator} />

          {/* DESCRIÇÃO PROPOSTA */}
          <Text style={styles.sectionTitle}>Descrição proposta</Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.descItem}>
              {contratoInfo.descricao.length > 50
                ? contratoInfo.descricao.substring(0, 50) + "..."
                : contratoInfo.descricao}
            </Text>

            <Text style={styles.descSmall}>Data: {contratoInfo.data}</Text>
            <Text style={styles.descSmall}>Horário: {contratoInfo.horario}</Text>
            <Text style={styles.descSmall}>Valor: {contratoInfo.valor}</Text>
            <Text style={styles.descSmall}>Local: {contratoInfo.local}</Text>
          </View>

          {/* Linha separadora */}
          <View style={styles.separator} />

          {/* ÚLTIMA SEÇÃO — muda conforme tipo */}
          <View style={{ marginTop: 20 }}>

            {isTrabalhador ? (
              <>
                {/* BOTÃO ACEITAR */}
                <TouchableOpacity style={[styles.btn, styles.btnAzul]}>
                  <Text style={styles.btnText}>Aceitar</Text>
                </TouchableOpacity>

                {/* BOTÃO RECUSAR */}
                <TouchableOpacity style={[styles.btn, styles.btnLaranja]}>
                  <Text style={styles.btnText}>Recusar</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* BOTÃO EDITAR PROPOSTA */}
                <TouchableOpacity style={[styles.btn, styles.btnCinza]}>
                  <Text style={styles.btnText}>Editar Proposta</Text>
                </TouchableOpacity>
              </>
            )}

          </View>

        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
  },

  menuContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 45,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },

  closeBtn: {
    position: "absolute",
    top: 15,
    right: 15,
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
  },

  separator: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    color: "#222",
  },

  descriptionBox: {
    paddingLeft: 5,
    gap: 4,
  },

  descItem: {
    fontSize: 15,
    fontWeight: "500",
    color: "#444",
  },

  descSmall: {
    fontSize: 14,
    color: "#666",
  },

  btn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  btnAzul: {
        blue: '#3F59BF',
  },

  btnLaranja: {
    orange: '#F77C00',
  },

  btnCinza: {
    thirdGray: '#b6b6b6ff',
  },
});
