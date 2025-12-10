import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from "react-native";
import { ref, push } from "firebase/database";
import { db } from "../../firebase/firebaseService";

const MAX_TAG_LENGTH = 40;

export default function Register() {
  // Estados para os campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  // Estados de controle
  const [isWorker, setIsWorker] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");

  // Tags padrão ajustadas para serem mais parecidas com a imagem de exemplo
  const defaultTags = [
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

  function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  function handleCustomTagChange(text) {
    // A lógica de alerta já está aqui
    if (text.length <= MAX_TAG_LENGTH) {
      setCustomTag(text);
    } else {
      Alert.alert(
        "Limite excedido",
        `A tag pode ter no máximo ${MAX_TAG_LENGTH} caracteres.`,
        [{ text: "OK" }]
      );
    }
  }

  function handleAddCustomTag() {
    // A lógica de alerta já está aqui
    const newTag = customTag.trim();

    if (newTag.length === 0) {
      Alert.alert("Tag vazia", "Digite um nome para a tag.");
      return;
    }

    if (newTag.length > MAX_TAG_LENGTH) {
      Alert.alert(
        "Tag muito longa",
        `A tag pode ter no máximo ${MAX_TAG_LENGTH} caracteres.`
      );
      return;
    }

    if (selectedTags.includes(newTag) || defaultTags.includes(newTag)) {
      Alert.alert("Tag já existe", "Essa tag já está disponível ou selecionada.");
      return;
    }

    setSelectedTags([...selectedTags, newTag]);
    setCustomTag("");
  }

  async function handleRegister() {
    try {
      // Exemplo de como você usaria os novos estados
      // if (!nome || !email || !senha) {
      //   Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      //   return;
      // }

      const userRef = ref(db, "usuarios/");
      const newUser = push(userRef);

      await push(userRef, {
        nome,
        email,
        senha,
        cpf,
        cep,
        cidade,
        uf,
        isWorker,
        tags: isWorker ? selectedTags : [],
      });
      
      Alert.alert("Sucesso", "Usuário registrado!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível registrar.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* TÍTULO DA TELA */}
          <Text style={styles.title}>Criar Conta</Text>

          {/* CAMPOS DE INPUT */}
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            secureTextEntry={true}
            value={senha}
            onChangeText={setSenha}
          />
          <TextInput
            style={styles.input}
            placeholder="CPF"
            keyboardType="numeric"
            value={cpf}
            onChangeText={setCpf}
          />
          <TextInput
            style={styles.input}
            placeholder="CEP (apenas números)"
            keyboardType="numeric"
            value={cep}
            onChangeText={setCep}
          />

          {/* CIDADE E UF (em linha) */}
          <View style={styles.cityUfContainer}>
            <TextInput
              style={[styles.input, styles.cityInput]}
              placeholder="Cidade"
              value={cidade}
              onChangeText={setCidade}
            />
            <TextInput
              style={[styles.input, styles.ufInput]}
              placeholder="UF"
              maxLength={2}
              autoCapitalize="characters"
              value={uf}
              onChangeText={setUf}
            />
          </View>

          {/* SELETOR COMUM / TRABALHADOR */}
          <View style={styles.userTypeContainer}>
            {/* Botão Comum */}
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                !isWorker ? styles.activeButton : styles.inactiveButton,
                { marginRight: 10 },
              ]}
              onPress={() => setIsWorker(false)}
            >
              <Text style={!isWorker ? styles.activeText : styles.inactiveText}>
                Comum
              </Text>
            </TouchableOpacity>

            {/* Botão Trabalhador */}
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                isWorker ? styles.activeButton : styles.inactiveButton,
              ]}
              onPress={() => setIsWorker(true)}
            >
              <Text style={isWorker ? styles.activeText : styles.inactiveText}>
                Trabalhador
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* TAGS SÓ APARECEM SE FOR TRABALHADOR */}
          {isWorker && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.tagTitle}>Escolha suas tags:</Text>

              {/* LISTA DE TAGS PADRÃO e SELECIONADAS */}
              <View style={styles.tagsContainer}>
                {defaultTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[
                      styles.tagButton,
                      selectedTags.includes(tag) ? styles.selectedTag : styles.unselectedTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag) ? styles.selectedTagText : styles.unselectedTagText,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                {/* LISTA DE TAGS PERSONALIZADAS SELECIONADAS */}
                {selectedTags
                    .filter(tag => !defaultTags.includes(tag))
                    .map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            onPress={() => toggleTag(tag)}
                            style={[styles.tagButton, styles.customTagButton]}
                        >
                            <Text style={styles.selectedTagText}>
                                {tag}
                            </Text>
                        </TouchableOpacity>
                ))}

              </View>

              {/* CAMPO DE NOVA TAG - Modificado aqui */}
              <View style={{ marginTop: 10 }}>
                <TextInput
                  value={customTag}
                  onChangeText={handleCustomTagChange}
                  placeholder="Criar nova tag..."
                  maxLength={MAX_TAG_LENGTH}
                  style={[styles.input, { marginBottom: 5 }]} 
                />
                
                {/* Contador de caracteres (Adicionado) */}
                <Text style={styles.charLimitText}>
                  {customTag.length}/{MAX_TAG_LENGTH}
                </Text>

                {/* BOTÃO ADICIONAR TAG */}
                <TouchableOpacity
                  onPress={handleAddCustomTag}
                  style={[styles.addTagButton, { marginTop: 10 }]}
                >
                  <Text style={styles.addTagText}>Adicionar Tag</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* BOTÃO FINAL */}
          <TouchableOpacity
            onPress={handleRegister}
            style={styles.registerButton}
          >
            <Text style={styles.registerButtonText}>
              Registrar
            </Text>
          </TouchableOpacity>
          
          {/* LINK ENTRAR */}
          <TouchableOpacity 
            onPress={() => Alert.alert("Entrar", "Navegar para a tela de Login")}
            style={styles.loginLinkContainer}
          >
            <Text style={styles.loginLinkText}>
              Já tem conta? Entrar
            </Text>
          </TouchableOpacity>


        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ESTILOS - Estilos para melhor aparência e o novo estilo charLimitText
const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 60,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  cityUfContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  cityInput: {
    flex: 2.5,
    marginRight: 10,
    marginBottom: 0,
  },
  ufInput: {
    flex: 1,
    marginBottom: 0,
  },
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
    height: 45,
  },
  userTypeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activeButton: {
    backgroundColor: "#007AFF",
  },
  inactiveButton: {
    backgroundColor: "#DDD",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inactiveText: {
    color: "#333",
    fontWeight: "bold",
  },
  tagTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tagButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  selectedTag: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  unselectedTag: {
    backgroundColor: "#F1F1F1",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  customTagButton: {
    backgroundColor: "#007AFF",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  tagText: {
    fontWeight: "bold",
  },
  selectedTagText: {
    color: "#fff",
  },
  unselectedTagText: {
    color: "#333",
  },
  charLimitText: { // Novo estilo adicionado
    color: "#555",
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 5,
  },
  addTagButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
  },
  addTagText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    marginTop: 30,
    borderRadius: 8,
  },
  registerButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLinkContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  loginLinkText: {
    color: "#007AFF",
    fontSize: 16,
    textDecorationLine: 'underline',
  }
});