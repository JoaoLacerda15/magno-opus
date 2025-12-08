import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Alert, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableWithoutFeedback, 
  Keyboard 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AuthService from "../../services/authService";

const auth = new AuthService();

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
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
      const user = await auth.login(email, password);

      Alert.alert("Sucesso", `Bem-vindo, ${user.nome || user.email}!`);

      // Enviar o ID para a Home
      navigation.reset({
        index: 0,
        routes: [
          { name: "Home", params: { userId: user.id } }
        ]
      });

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

            <Button title="Login" onPress={handleLogin} />

            <Text style={{ marginTop: 16, textAlign: "center" }}>
              Não tem uma conta?
            </Text>

            <Button
              title="Criar conta"
              onPress={() => navigation.navigate("register")}
            />
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
  }
});
