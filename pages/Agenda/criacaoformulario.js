import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, Card } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { ref as rtdbRef, push, set, update } from "firebase/database";
import { realtimeDB, auth } from "../../firebase/firebaseService";
import BarraNavegacao from "../../components/navbar";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../../context/authContext";


export default function CriacaoFormulario({ route, navigation }) {
  const { selectedDate, item } = route.params || {};

  const { user: userLogado } = useAuth();

  // Estado inicial baseado se é edição ou novo
  const [nomePessoa, setNomePessoa] = useState(item?.nomeCliente || item?.name || "");
  const [servico, setServico] = useState(item?.servico || item?.title || "");
  const [horario, setHorario] = useState(item?.time || ""); // Campo novo no form
  const [valor, setValor] = useState(item?.valor || "");
  const [local, setLocal] = useState(item?.local || item?.endereco || "");
  const [pagamento, setPagamento] = useState(item?.pagamento || "");
  
  // Se for edição, guardamos o status original. Se for novo, status é "formulario"
  const [status, setStatus] = useState(item?.status || "formulario");

  const handleSave = async () => {
    if (!nomePessoa || !servico || !horario || !pagamento) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const userId = userLogado?.id || userLogado?.uid;

    if (!userId) {
        Alert.alert("Erro", "Usuário não autenticado. Tente fazer login novamente.");
        return;
    }

    try {
        // CAMINHO: agenda / USER_ID / DATA (YYYY-MM-DD)
        // Se for edição (item existe), usamos a chave dele. Se for novo, o push cria uma chave.
        
        // 1. Referência base para a data específica
        // Nota: O push gera um ID único automático
        
        let agendamentoRef;
        
        if (item && item.id) {
            const agendaDiaRef = rtdbRef(realtimeDB, `agenda/${userId}/${selectedDate}`);
            agendamentoRef = push(agendaDiaRef); // Cria novo ID
        } else {
             // MODO CRIAÇÃO (Novo)
            const agendaDiaRef = rtdbRef(realtimeDB, `agenda/${userId}/${selectedDate}`);
            agendamentoRef = push(agendaDiaRef); 
        }

        const dadosParaSalvar = {
            // Campos visuais do formulário
            nomeCliente: nomePessoa, // Mantendo padrão 'nomeCliente' da imagem, mas adaptável
            servico: servico,        // 'servico' na imagem
            time: horario,           // Extra
            pagamento: pagamento,
            valor: valor || null,
            local: local || null,
            
            // Metadados
            criadoEm: new Date().toISOString(),
            id_cliente: null, // Criado manualmente, não tem ID de cliente do app atrelado
            chatId: null,
            

            status: status === 'confirmed' ? 'confirmed' : 'formulario'
        };
        
        await set(agendamentoRef, dadosParaSalvar);

        alert("Agendamento salvo com sucesso!");
        navigation.goBack();

    } catch (error) {
      console.log("Erro ao salvar:", error);
      alert("Erro ao salvar o agendamento.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f1f5f9" }}>
        <View style={styles.container}>
        <ScrollView>
        <Card style={styles.card}>
            <Text style={styles.dateLabel}>Data do agendamento</Text>
            <Text style={styles.dateValue}>
            {selectedDate ? selectedDate.split("-").reverse().join("/") : "Data não selecionada"}
            </Text>

            <TextInput
            label="Nome da Pessoa"
            value={nomePessoa}
            onChangeText={setNomePessoa}
            style={styles.input}
            mode="outlined"
            activeOutlineColor="#2563eb"
            />

            <TextInput
            label="Serviço"
            value={servico}
            onChangeText={setServico}
            style={styles.input}
            mode="outlined"
            activeOutlineColor="#2563eb"
            />

            <TextInput
            label="Horário (ex: 14:00)"
            value={horario}
            onChangeText={setHorario}
            style={styles.input}
            mode="outlined"
            activeOutlineColor="#2563eb"
            />

            <TextInput
            label="Valor (R$)"
            value={valor}
            onChangeText={setValor}
            style={styles.input}
            keyboardType="numeric"
            mode="outlined"
            activeOutlineColor="#2563eb"
            />

            <TextInput
            label="Local"
            value={local}
            onChangeText={setLocal}
            style={styles.input}
            mode="outlined"
            activeOutlineColor="#2563eb"
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

            <Button 
                mode="contained" 
                onPress={handleSave} 
                style={styles.button}
                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
            >
            Salvar Agendamento
            </Button>
        </Card>
        </ScrollView>
        </View>
        <BarraNavegacao/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: "white",
    marginBottom: 80 // Espaço para navbar não cobrir
  },
  dateLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  dateValue: {
    fontSize: 24,
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
    borderWidth: 1,
    borderColor: "#79747E", // Cor padrão do outline do paper
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  input: {
    marginBottom: 12,
    backgroundColor: "white",
  },
  button: {
    marginTop: 15,
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 10,
  },
});