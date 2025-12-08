import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"

export default function Configuracoes({ navigation }) {
  const menuItems = [
    { id: 1, icon: "moon-outline", iconSet: "Ionicons", label: "Aparência", route: "aparencia" },
    { id: 2, icon: "notifications-outline", iconSet: "Ionicons", label: "Notificações", route: "notificacao" },
    { id: 3, icon: "language", iconSet: "Ionicons", label: "Idioma", route: "Idioma" },
    { id: 4, icon: "alert-circle-outline", iconSet: "Ionicons", label: "Contatos Bloqueados", route: "ContatosBloqueados" },
    { id: 5, icon: "apps", iconSet: "MaterialIcons", label: "Permissões do aplicativo", route: "permissoes" },
    { id: 6, icon: "grid", iconSet: "Ionicons", label: "Acessibilidade", route: "acessibilidade" },
    { id: 7, icon: "logo-usd", iconSet: "Ionicons", label: "Assinatura", route: "premium" },
    { id: 8, icon: "people-outline", iconSet: "Ionicons", label: "Mudar de conta", route: "conta" },
    { id: 9, icon: "chatbox-outline", iconSet: "Ionicons", label: "Enviar feedback", route: "Feedback" },
    { id: 10, icon: "information-circle-outline", iconSet: "Ionicons", label: "Sobre", route: "Sobre" },
    { id: 11, icon: "refresh-outline", iconSet: "Ionicons", label: "Restaurar padrão", route: "RestaurarPadrao" },
  ]

  const handleMenuPress = (route) => {
    if (navigation && route) {
      navigation.navigate(route)
    }
  }

  const renderIcon = (iconName, iconSet) => {
    if (iconSet === "MaterialIcons") {
      return <MaterialIcons name={iconName} size={24} color="#000" />
    } else if (iconSet === "MaterialCommunityIcons") {
      return <MaterialCommunityIcons name={iconName} size={24} color="#000" />
    }
    return <Ionicons name={iconName} size={24} color="#000" />
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D4E4F0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Geral</Text>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                {renderIcon(item.icon, item.iconSet)}
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#D4E4F0",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 16,
    fontWeight: "400",
  },
})
