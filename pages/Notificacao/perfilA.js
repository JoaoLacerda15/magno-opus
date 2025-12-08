import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import BarraNavegacao from "../../components/navbar";

export default function PerfilAPage({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image source={require("../../assets/profile.png")} style={styles.avatar} />
        <Text style={[styles.bold, { color: "green" }]}>Concluído</Text>
        <Text style={styles.star}>⭐</Text>
        <Text style={styles.bold}>4.5</Text>

        <Text style={styles.sectionTitle}>Solicitante</Text>
        <Text>Ana Clara</Text>

        <Text style={styles.sectionTitle}>Profissional</Text>
        <Text>Gustavo Rodriguês</Text>

        <Text style={styles.sectionTitle}>Serviço</Text>
        <Text>Manutenção Elétrica</Text>

        <Text>Data: 07/06/2025</Text>
        <Text>Hora: 14:30</Text>
        <Text>Rua das Palmeiras, 14</Text>

        <Text style={styles.sectionTitle}>Pagamento</Text>
        <Text>Boleto</Text>
        <Text>R$600,00</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Ver Menos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: "center",
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  bold: { fontWeight: "bold", fontSize: 16 },
  star: { fontSize: 24, color: "orange" },
  sectionTitle: { marginTop: 12, fontWeight: "bold", fontSize: 16 },
  button: {
    marginTop: 20,
    backgroundColor: "gray",
    padding: 10,
    borderRadius: 8,
  },
  buttonText: { color: "white", fontWeight: "bold" },
});
