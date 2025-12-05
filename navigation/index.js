import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainLayout from '../components/MainLayout';
import Home from "../pages/Home/Home";
import notification from "../pages/Notificacao/notification";
import PerfilA from "../pages/Notificacao/perfilA";
import contestarstrike from "../pages/Notificacao/contestarstrike";
import login from "../pages/Login/login";
import register from "../pages/Login/register";
import agenda from "../pages/Agenda/agenda";
import configuracoes from "../pages/configuracao/configuracoes";
import aparencia from "../pages/configuracao/aparencia";
import notificacao from "../pages/configuracao/notificacao";
import permissoes from "../pages/configuracao/permissoes";
import conta from "../pages/configuracao/conta";
import perfilPP from "../pages/Perfil/perfilPP";
import chatScreen from "../pages/Chat/chatScreen";
import conversasScreen from "../pages/Chat/conversasScreen";
import criacaoformulario from "../pages/Agenda/criacaoformulario";
import scheduleScreen from "../pages/Agenda/scheduleScreen";



const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function MainScreens() {
  return (
    <MainLayout>
      <MainStack.Navigator
        initialRouteName="login"
        screenOptions={{ headerShown: false }}
      >
        <MainStack.Screen name="Home" component={Home} />
        <MainStack.Screen name="perfilA" component={PerfilA} />
        <MainStack.Screen name="chat" component={chat} />
        <MainStack.Screen name="notification" component={notification} />
      </MainStack.Navigator>
    </MainLayout>
  );
}

export default function Routes() {
  return (
    <Stack.Navigator
      initialRouteName="login"
      screenOptions={{ headerShown: false }}   // <-- Removendo header de TODAS as telas
    >
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="notification" component={notification} />
      <Stack.Screen name="perfilA" component={PerfilA} />
      <Stack.Screen name="contestarstrike" component={contestarstrike} />
      <Stack.Screen name="login" component={login} />
      <Stack.Screen name="register" component={register} />
      <Stack.Screen name="agenda" component={agenda} />
      <Stack.Screen name="perfilPP" component={perfilPP} />
      <Stack.Screen name="configuracoes" component={configuracoes} />
      <Stack.Screen name="aparencia" component={aparencia} />
      <Stack.Screen name="notificacao" component={notificacao} />
      <Stack.Screen name="permissoes" component={permissoes} />
      <Stack.Screen name="conta" component={conta} />
      <Stack.Screen name="chatScreen" component={chatScreen} />
      <Stack.Screen name="conversasScreen" component={conversasScreen} />
      <Stack.Screen name="calendario" component={scheduleScreen} options={{ title: "Agendamentos" }} />
      <Stack.Screen name="criacaoformulario" component={criacaoformulario} options={{ title: "Novo Agendamento" }} />


    </Stack.Navigator>
  );
}
