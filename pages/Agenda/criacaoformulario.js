import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { collection, addDoc } from "firebase/firestore";
import { firestoreDB, auth } from "../../firebase/firebaseService"; // <-- IMPORTAÇÃO CORRETA
import BarraNavegacao from "../../components/navbar";

export default function CriacaoFormulario({ route, navigation }) {
  const { selectedDate } = route.params || {};

  const [nomePessoa, setNomePessoa] = useState("");
  const [servico, setServico] = useState("");
  const [horario, setHorario] = useState("");
  const [valor, setValor] = useState("");
  const [local, setLocal] = useState("");
  const [pagamento, setPagamento] = useState("");

  const handleSave = async () => {
    if (!nomePessoa || !servico || !horario || !pagamento) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      await addDoc(collection(firestoreDB, "agendamentos"), {
        name: nomePessoa,
        title: servico,
        time: horario,
        pagamento: pagamento,
        valor: valor || null,
        local: local || null,
        date: selectedDate,
        createdAt: new Date(),
        uid: auth.currentUser?.uid || null, // agora funciona
      });

      alert("Agendamento criado com sucesso!");
      navigation.goBack();

    } catch (error) {
      console.log("Erro ao salvar:", error);
      alert("Erro ao salvar o agendamento.");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.dateLabel}>Data do agendamento</Text>
        <Text style={styles.dateValue}>
          {selectedDate?.split("-").reverse().join("/")}
        </Text>

        <TextInput
          label="Nome da Pessoa"
          value={nomePessoa}
          onChangeText={setNomePessoa}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Serviço"
          value={servico}
          onChangeText={setServico}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Horário (ex: 14:00)"
          value={horario}
          onChangeText={setHorario}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Valor (R$)"
          value={valor}
          onChangeText={setValor}
          style={styles.input}
          keyboardType="numeric"
          mode="outlined"
        />

        <TextInput
          label="Local"
          value={local}
          onChangeText={setLocal}
          style={styles.input}
          mode="outlined"
        />

        <Text style={styles.label}>Forma de Pagamento</Text>
        <View style={styles.pickerBox}>
          <Picker
            selectedValue={pagamento}
            onValueChange={(value) => setPagamento(value)}
            dropdownIconColor="#2563eb"
          >
            <Picker.Item label="Selecione..." value="" />
            <Picker.Item label="Dinheiro" value="dinheiro" />
            <Picker.Item label="Pix" value="pix" />
            <Picker.Item label="Cartão Débito" value="debito" />
            <Picker.Item label="Cartão Crédito" value="credito" />
          </Picker>
        </View>

        <Button mode="contained" onPress={handleSave} style={styles.button}>
          Salvar Agendamento
        </Button>
      </Card>
      <BarraNavegacao/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#f1f5f9",
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: "white",
  },
  dateLabel: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "600",
  },
  dateValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 20,
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    fontSize: 15,
    color: "#334155",
    fontWeight: "600",
  },
  pickerBox: {
    borderWidth: 1.2,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    marginBottom: 15,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    marginTop: 15,
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    borderRadius: 10,
  },
});
