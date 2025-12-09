import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableWithoutFeedback, 
  Keyboard,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AuthService from "../../services/authService";
import { useAuth } from "../../context/authContext";

const authService = new AuthService();

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (route.params?.message) {
      // 💡 Alert.alert("Sucesso", route.params.message);
    }
  }, [route.params]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha o email e a senha.");
      return;
    }

    setIsLoading(true);

    try {
      const userData = await authService.login(email, password);

      Alert.alert("Sucesso", `Bem-vindo, ${userData.nome || userData.email}!`);

      await setUser(userData);

    } catch (e) {
      Alert.alert("Erro", e.message || "Ocorreu um erro desconhecido.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={20}
    >
      <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      >
          <View style={styles.innerContainer}>

                <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>Login</Text>

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

            {/* --- BOTÃO DE LOGIN MODIFICADO --- */}
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading} // Impede clicar 2x
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            {/* ---------------------------------- */}

            <Text style={{ marginTop: 16, textAlign: "center" }}>
              Não tem uma conta?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("register")}
              style={{ padding: 10 }}
            >
              <Text style={{ color: "#007AFF", textAlign: "center", fontWeight: "bold" }}>Criar conta</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1, // Importante para o ScrollView ocupar a tela toda
    justifyContent: "center",
  },
  innerContainer: {
    padding: 20,
    justifyContent: "center",
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12
  },
  logo: {
    alignSelf: "center",
    marginBottom: 20,
    // Adicionei altura/largura fixa ou relativa para evitar erros se a imagem for grande
    height: 100, 
    width: 100 
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A0CFFF", // Cor mais clara quando desabilitado
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});
