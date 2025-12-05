import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet, Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AuthService from "../../services/authService";

const auth = new AuthService();

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (route.params?.message) {
      Alert.alert("Sucesso", route.params.message);
    }
  }, [route.params]);

  const handleLogin = async () => {
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
      Alert.alert("Erro", e.message);
    }
  };

  return (
    <View style={styles.container}>

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12
  },
});
