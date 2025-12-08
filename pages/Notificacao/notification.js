// App.js
import React from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BarraNavegacao from "../../components/navbar";

// ------------------- NOTIFICAÇÕES -------------------
export default function NotificationsPage() {
  const data = [
    {
      id: "1",
      title: "Serviço Concluído",
      profileName: "Ana Clara",
      service: "Manutenção Elétrica",
      date: "07/06/2025",
      time: "14:30",
      rating: 4.5,
      contestar: false,
    },
    {
      id: "2",
      title: "Strike",
      profileName: "Joana Silva",
      service: "Limpeza Residencial",
      date: "08/06/2025",
      time: "09:00",
      rating: 2.0,
      contestar: true,
    },
  ];

  return (
    <View style={styles.principal}>
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard {...item} />}
      />
      <BarraNavegacao />
    </View>
  );
}

// ------------------- COMPONENTE DE NOTIFICAÇÃO -------------------
function NotificationCard({ title, profileName, service, date, time, rating, contestar }) {
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.card,
        title === "Strike" && {
          backgroundColor: "#fff",
          borderWidth: 6,
          borderColor: "#BD4311",
        },
      ]}
    >
      <Text style={styles.cardTitle}>{title}</Text>

      {/* FOTO NO TOPO DO CARD */}
      <View style={styles.topRow}>
        <Image source={require("../../assets/profile.png")} style={styles.avatar} />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.profileName}>{profileName}</Text>
          <Text>Referente a: {service}</Text>
          <Text>Data: {date}</Text>
          <Text>Hora: {time}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("perfilA")}>
              <Text style={styles.btnText}>Ver Detalhes</Text>
            </TouchableOpacity>

            {contestar && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "red" }]}
                onPress={() => navigation.navigate("contestarstrike")}
              >
                <Text style={styles.btnText}>Contestar Strike</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ alignItems: "center" }}>
          <Text style={{ fontWeight: "bold" }}>Avaliação</Text>
          <Ionicons name="star" size={20} color="gold" />
          <Text>{rating}</Text>
        </View>
      </View>
    </View>
  );
}

// ------------------- OUTRAS PÁGINAS -------------------
function PerfilAPage() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>📄 Perfil A</Text>
    </View>
  );
}

function ContestarStrikePage() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>⚠️ Contestar Strike</Text>
    </View>
  );
}

function ContestacaoEnviarPage() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>📤 Enviar Contestação</Text>
    </View>
  );
}

// ------------------- ESTILOS -------------------
const styles = StyleSheet.create({
  principal: {
    flex: 1,
    paddingTop: 30,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },

  // FOTO NO TOPO
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },

  avatar: { width: 60, height: 60, borderRadius: 30 },
  profileName: { fontSize: 16, fontWeight: "bold" },

  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  btn: {
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
