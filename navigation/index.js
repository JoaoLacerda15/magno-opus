import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Renomiei tudo que estava tudo errado essa bomba aqui
import MainLayout from '../components/MainLayout';
import Home from "../pages/Home/Home";
//import MenuChat from "../pages/Chat/MenuChat";
import Notification from "../pages/Notificacao/notification";
import PerfilA from "../pages/Notificacao/perfilA";
import ContestarStrike from "../pages/Notificacao/contestarstrike"; // Era contestarstrike (CSGO?????)
import Login from "../pages/Login/login";
import Register from "../pages/Login/register";
import Agenda from "../pages/Agenda/agenda";
import Configuracoes from "../pages/configuracao/configuracoes";
import Aparencia from "../pages/configuracao/aparencia";
import NotificacaoConf from "../pages/configuracao/notificacao"; // Mudei nome pra evitar conflito com a outra notificacao
import Permissoes from "../pages/configuracao/permissoes";
import Conta from "../pages/configuracao/conta";
import PerfilPP from "../pages/Perfil/perfilPP";
import ChatScreen from "../pages/Chat/chatScreen";
import ConversasScreen from "../pages/Chat/conversasScreen";
import CriacaoFormulario from "../pages/Agenda/criacaoformulario";
import ScheduleScreen from "../pages/Agenda/scheduleScreen";

import { useAuth } from "../context/authContext";

const Stack = createNativeStackNavigator();

export default function Routes() {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#1a94f8ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {user ? (
        // Se o miseravel estiver logado já mostra tudo aí
        // O "Home" vira a tela inicial automaticamente pq é a primeira da lista, home é braba
        <>
          <Stack.Screen name="Home" component={Home} />
          
          {/* Telas de Notificação */}
          <Stack.Screen name="notification" component={Notification} />
          <Stack.Screen name="perfilA" component={PerfilA} />
          <Stack.Screen name="contestarstrike" component={ContestarStrike} />
          
          {/* Telas de Agenda */}
          <Stack.Screen name="agenda" component={Agenda} />
          <Stack.Screen name="calendario" component={ScheduleScreen} />
          <Stack.Screen name="criacaoformulario" component={CriacaoFormulario} />

          {/* Telas de Perfil */}
          <Stack.Screen name="perfilPP" component={PerfilPP} />

          {/* Telas de Configuração */}
          <Stack.Screen name="configuracoes" component={Configuracoes} />
          <Stack.Screen name="aparencia" component={Aparencia} />
          <Stack.Screen name="notificacao" component={NotificacaoConf} />
          <Stack.Screen name="permissoes" component={Permissoes} />
          <Stack.Screen name="conta" component={Conta} />

          {/* Telas de Chat */}
          <Stack.Screen name="chatScreen" component={ChatScreen} /> 
          <Stack.Screen name="conversasScreen" component={ConversasScreen} />
        </>
      ) : (
         // Se o desgrama n tiver logado vai pra essas tela aí
        // Mostra só Login e Registro n sobra nada pro beta
        <>
          <Stack.Screen name="login" component={Login} />
          <Stack.Screen name="register" component={Register} />
        </>
      )}

    </Stack.Navigator>
  );
}