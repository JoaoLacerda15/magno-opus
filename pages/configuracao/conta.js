import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, StatusBar } from "react-native"
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons"

export default function Conta({ navigation }) {
  const menuItems = [
    { id: 1, icon: "notifications-outline", iconSet: "Ionicons", label: "Sair da conta", route: "login" },
    { id: 2, icon: "language", iconSet: "Ionicons", label: "Excluir conta", route: "Idioma" },
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
        <Text style={styles.headerTitle}>Conta</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

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
        
        {/* Botões de Ação */}
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.footerButtonText}>Aplicar alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.restoreButton}>
            <Text style={styles.footerButtonText}>Restaurar padrão</Text>
          </TouchableOpacity>
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
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 30,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: "center",
  },
  restoreButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    marginLeft: 8,
    alignItems: "center",
  },
  footerButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
  },

})
