import React from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useAuth } from "../context/authContext";

// 💡 Agora recebe 'userId' como propriedade
export default function BarraNavegacao({ userId = null }) { 
  const navigation = useNavigation();

  const { user } = useAuth();

  // Função auxiliar para navegar para o Perfil com o ID
  const navegarParaPerfil = () => {
    // Verifica se o ID existe antes de navegar.
    // Se o ID for null/undefined, a navegação ainda ocorre,
    // mas a tela 'perfilPP' exibirá a mensagem de erro (como configurado anteriormente).
    navigation.navigate("perfilPP", { userId: null });
  };

  return (
    <View style={styles.main}>

      {/* Notificações */}
      <TouchableOpacity onPress={() => navigation.navigate("notification")}>
        <Image
          source={require("../assets/notification.png")}
          style={styles.icones}
        />
      </TouchableOpacity>


      {/* Conversas */}
      <TouchableOpacity onPress={() => navigation.navigate("conversasScreen")}>
        <Image
          source={require("../assets/Message.png")}
          style={styles.icones}
        />
      </TouchableOpacity>
      
            {/* Home */}
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Image
          source={require("../assets/home.png")}
          style={styles.icones}
        />
      </TouchableOpacity>


      {/* Agenda */}
      <TouchableOpacity onPress={() => navigation.navigate("calendario")}>
        <Image
          source={require("../assets/relogio.png")}
          style={styles.icones}
        />
      </TouchableOpacity>

      {/* Perfil – USA A FUNÇÃO AUXILIAR */}
      <TouchableOpacity onPress={navegarParaPerfil}>
        <Image
          source={require("../assets/user.png")}
          style={styles.icones}
        />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    paddingHorizontal: 25,
    paddingBottom: 10,
    backgroundColor: "#B8DDFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  icones: {
    width: 32,
    height: 32,
    tintColor: "#000",
  },
});