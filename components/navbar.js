import React from "react";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function BarraNavegacao() {
  const navigation = useNavigation();

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


      {/* Agenda – NOVO  */}
      <TouchableOpacity onPress={() => navigation.navigate("calendario")}>
        <Image
          source={require("../assets/relogio.png")}
          style={styles.icones}
        />
      </TouchableOpacity>

      {/* Perfil – NOVO */}
      <TouchableOpacity onPress={() => navigation.navigate("perfilPP")}>
        <Image
          source={require("../assets/user.png")}  // <- Coloque o ícone que preferir
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
