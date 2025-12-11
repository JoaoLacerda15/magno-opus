import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, StyleSheet } from "react-native";
import AuthService from "../../services/authService";
import { useNavigation } from "@react-navigation/native";

const authService = new AuthService();

const MAX_TAG_LENGTH = 40;

export default function Register() {
  const navigation = useNavigation();

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
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const handleBlurCep = async () => {
    const cepLimpo = cep.replace(/\D/g, ''); // Remove traços/pontos

    if (cepLimpo.length !== 8) return; // Só busca se tiver 8 dígitos

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        Alert.alert("Erro", "CEP não encontrado.");
        setCidade("");
        setUf("");
      } else {
        setCidade(data.localidade || "");
        setUf(data.uf || "");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao buscar CEP. Verifique sua conexão.");
      console.error(error);
    } finally {
      setLoadingCep(false);
    }
  };

  function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  for (let i = 1; i <= 9; i++) 
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) 
    soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

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
    if (text.length <= MAX_TAG_LENGTH) {
      setCustomTag(text);
    } else {
      Alert.alert("Limite excedido", `Máximo ${MAX_TAG_LENGTH} caracteres.`);
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
    if (!nome || !email || !senha) {
      return Alert.alert("Erro", "Nome, Email e Senha são obrigatórios.");
    }

    if (cpf && !validarCPF(cpf)) {
      return Alert.alert("CPF Inválido", "Por favor, digite um CPF válido.");
    }

    setLoading(true);

    try {
      const dadosUsuario = {
          nome: nome,
          email: email,
          password: senha,
          userType: isWorker ? "trabalhador" : "comum",
          cpf: cpf,
          cep: cep,
          cidade: cidade,
          estado: uf,
          tags: isWorker ? selectedTags : []
      };

      const resultado = await authService.register(dadosUsuario);
      
      console.log("Usuário criado com ID:", resultado.id);
      Alert.alert("Sucesso", "Conta criada!", [
          { 
            text: "Ir para Login", 
            onPress: () => navigation.navigate("login")
          }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", error.message || "Não foi possível registrar.");
    } finally {
        setLoading(false);
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
          <Text style={styles.title}>Criar Conta</Text>

          <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} />
          
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            keyboardType="email-address" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
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
            maxLength={14} // Máscara simples visualmente (opcional)
          />
          
          {/* CAMPO DE CEP COM BUSCA AUTOMÁTICA */}
          <View>
            <TextInput 
                style={styles.input} 
                placeholder="CEP (apenas números)" 
                keyboardType="numeric" 
                value={cep} 
                onChangeText={setCep}
                maxLength={9}
                onBlur={handleBlurCep} // Busca quando sai do campo
            />
            {/* Indicador de carregamento do CEP dentro do input (opcional visualmente) */}
            {loadingCep && (
                <View style={{position: 'absolute', right: 15, top: 15}}>
                    <ActivityIndicator size="small" color="#007AFF" />
                </View>
            )}
          </View>

          <View style={styles.cityUfContainer}>
            <TextInput 
                style={[styles.input, styles.cityInput]} 
                placeholder="Cidade" 
                value={cidade} 
                onChangeText={setCidade} 
                editable={!loadingCep} // Bloqueia enquanto carrega
            />
            <TextInput 
                style={[styles.input, styles.ufInput]} 
                placeholder="UF" 
                maxLength={2} 
                autoCapitalize="characters" 
                value={uf} 
                onChangeText={setUf}
                editable={!loadingCep}
            />
          </View>

          {/* Seletor Tipo */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, !isWorker ? styles.activeButton : styles.inactiveButton, { marginRight: 10 }]}
              onPress={() => setIsWorker(false)}
            >
              <Text style={!isWorker ? styles.activeText : styles.inactiveText}>Comum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.userTypeButton, isWorker ? styles.activeButton : styles.inactiveButton]}
              onPress={() => setIsWorker(true)}
            >
              <Text style={isWorker ? styles.activeText : styles.inactiveText}>Trabalhador</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tags (Só se for trabalhador) */}
          {isWorker && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.tagTitle}>Escolha suas tags:</Text>
              <View style={styles.tagsContainer}>
                {defaultTags.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[styles.tagButton, selectedTags.includes(tag) ? styles.selectedTag : styles.unselectedTag]}
                  >
                    <Text style={[styles.tagText, selectedTags.includes(tag) ? styles.selectedTagText : styles.unselectedTagText]}>{tag}</Text>
                  </TouchableOpacity>
                ))}
                {selectedTags.filter(tag => !defaultTags.includes(tag)).map((tag) => (
                    <TouchableOpacity key={tag} onPress={() => toggleTag(tag)} style={[styles.tagButton, styles.customTagButton]}>
                        <Text style={styles.selectedTagText}>{tag}</Text>
                    </TouchableOpacity>
                ))}
              </View>

              <View style={{ marginTop: 10 }}>
                <TextInput
                  value={customTag}
                  onChangeText={handleCustomTagChange}
                  placeholder="Criar nova tag..."
                  maxLength={MAX_TAG_LENGTH}
                  style={[styles.input, { marginBottom: 5 }]} 
                />
                <Text style={styles.charLimitText}>{customTag.length}/{MAX_TAG_LENGTH}</Text>
                <TouchableOpacity onPress={handleAddCustomTag} style={[styles.addTagButton, { marginTop: 10 }]}>
                  <Text style={styles.addTagText}>Adicionar Tag</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            style={[styles.registerButton, loading && {opacity: 0.7}]}
            disabled={loading}
          >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.registerButtonText}>Registrar</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation?.navigate("login")} 
            style={styles.loginLinkContainer}
          >
            <Text style={styles.loginLinkText}>Já tem conta? Entrar</Text>
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