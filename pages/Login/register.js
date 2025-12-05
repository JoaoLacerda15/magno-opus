import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import AuthService from "../../services/authService"; // <-- import da classe

const auth = new AuthService(); // <-- instancia a classe

export default function Register({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("comum"); // padrão comum
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [tags, setTags] = useState([]);

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

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRegister = async () => {
    try {
      await auth.register({
        nome,
        email,
        password,
        userType,
        cpf,
        cep,
        tags: userType === "trabalhador" ? tags : [], // tags só pro trabalhador
      });

      Alert.alert("Sucesso", "Conta criada!");
      navigation.navigate("login");
    } catch (error) {
      Alert.alert("Erro", error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
      />

      <TextInput
        style={styles.input}
        placeholder="CEP"
        value={cep}
        onChangeText={setCep}
      />

      {/* Tipo de usuário */}
      <View style={styles.userTypeContainer}>
        <TouchableOpacity
          style={[styles.userTypeButton, userType === "comum" && styles.userTypeButtonSelected]}
          onPress={() => setUserType("comum")}
        >
          <Text style={[styles.userTypeText, userType === "comum" && styles.userTypeTextSelected]}>
            Comum
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.userTypeButton, userType === "trabalhador" && styles.userTypeButtonSelected]}
          onPress={() => setUserType("trabalhador")}
        >
          <Text style={[styles.userTypeText, userType === "trabalhador" && styles.userTypeTextSelected]}>
            Trabalhador
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tags só aparecem para trabalhador */}
      {userType === "trabalhador" && (
        <>
          <Text style={styles.label}>Escolha suas tags:</Text>
          <View style={styles.tagContainer}>
            {tagsDisponiveis.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, tags.includes(tag) && styles.tagSelected]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[styles.tagText, tags.includes(tag) && styles.tagTextSelected]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10, borderRadius: 8 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  link: { color: "#007AFF", textAlign: "center", marginTop: 15 },
  userTypeContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  userTypeButton: { paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: "#007AFF", borderRadius: 8 },
  userTypeButtonSelected: { backgroundColor: "#007AFF" },
  userTypeText: { color: "#007AFF", fontWeight: "bold" },
  userTypeTextSelected: { color: "#fff" },
  label: { marginBottom: 5, fontWeight: "bold", fontSize: 16 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  tag: { borderWidth: 1, borderColor: "#007AFF", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, margin: 5 },
  tagSelected: { backgroundColor: "#007AFF" },
  tagText: { color: "#007AFF" },
  tagTextSelected: { color: "#fff" },
});
