// App.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BarraNavegacao from "../../components/navbar";

import { ref, onValue, remove, update } from "firebase/database";
import { realtimeDB } from "../../firebase/firebaseService";
import { useAuth } from "../../context/authContext";
import { atualizarContratoChat, recusarContratoChat, confirmarAgendamento } from "../../services/chatService";
import { notificarRecusa } from "../../services/notification";
import { SafeAreaView } from 'react-native-safe-area-context';

// ------------------- NOTIFICAÇÕES -------------------
export default function NotificationsPage() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const myId = user?.id || user?.uid;

  useEffect(() => {
    if (!myId) return;

    const notifRef = ref(realtimeDB, `notificacoes/${myId}`);

    // Ouve as notificações em tempo real
    const unsubscribe = onValue(notifRef, (snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val();
        const lista = Object.entries(dados).map(([key, val]) => ({
          id: key,
          ...val
        })).sort((a, b) => new Date(b.data) - new Date(a.data));
        setNotificacoes(lista);
      } else {
        setNotificacoes([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [myId]);

  // --- LÓGICA DE ACEITAR ---
  const handleAceitar = async (item) => {
    try {
        if (!item.chatIdRelacionado) return Alert.alert("Erro", "Chat não encontrado.");

        await atualizarContratoChat(item.chatIdRelacionado, item.dadosDetalhados);

        if (item.dadosDetalhados.dataServico) {
          await confirmarAgendamento(myId, item.dadosDetalhados.dataServico);
          console.log("Agenda confirmada para:", item.dadosDetalhados.dataServico);
        } else {
            console.warn("⚠️ Data de serviço não encontrada na notificação! (Bug antigo)");
        }

        const itemRef = ref(realtimeDB, `notificacoes/${myId}/${item.id}`);
        await remove(itemRef);

        Alert.alert("Sucesso", "Proposta aceita e agenda atualizada!");
    } catch (error) {
        Alert.alert("Erro", "Falha ao aceitar.");
    }
  };

  // --- LÓGICA DE RECUSAR ---
  const handleRecusar = async (item) => {
    try {
      // 1. Deleta o chat
      if (item.chatIdRelacionado) {
          await recusarContratoChat(item.chatIdRelacionado);
      }

      // 2. Atualiza a notificação ATUAL (para quem recusou ver que recusou)
      const itemRef = ref(realtimeDB, `notificacoes/${myId}/${item.id}`);
      await update(itemRef, {
          tipo: "recusado", 
          titulo: "Você recusou esta proposta",
          lida: true
      });

      // 3. Notifica a OUTRA PESSOA (Remetente)
      // Precisamos do ID do remetente que está dentro de dadosDetalhados
      const idRemetente = item.dadosDetalhados?.remetenteId;
      const nomeServico = item.dadosDetalhados?.servicos 
          ? (Array.isArray(item.dadosDetalhados.servicos) ? item.dadosDetalhados.servicos[0] : item.dadosDetalhados.servicos) 
          : "serviço";
      
      if (idRemetente) {
          const meuNome = user.nome || "O usuário";
          await notificarRecusa(idRemetente, meuNome, nomeServico);
      }

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao recusar proposta.");
    }
  };

  const handleLimpar = async (id) => {
      const itemRef = ref(realtimeDB, `notificacoes/${myId}/${id}`);
      await remove(itemRef);
  }

  if (loading) {
    return (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#007BFF"/>
        </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.principal}>
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={notificacoes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
              <NotificationCard 
                  item={item} 
                  onAceitar={() => handleAceitar(item)} 
                  onRecusar={() => handleRecusar(item)}
                  onLimpar={() => handleLimpar(item.id)}
              />
          )}
          ListEmptyComponent={
              <Text style={{textAlign:'center', color:'#888', marginTop:20}}>
                  Nenhuma notificação no momento.
              </Text>
          }
        />
        <BarraNavegacao />
      </View>
    </SafeAreaView>
  );
}

// ------------------- COMPONENTE DE NOTIFICAÇÃO -------------------
function NotificationCard({ item, onAceitar, onRecusar, onLimpar }) {
  const navigation = useNavigation();

  // Extraindo dados para facilitar leitura
  const { titulo, tipo, dadosDetalhados, mensagem, data } = item;

  const displayTitle = titulo || item.title || "Notificação";

  const isStrike = displayTitle === "Strike";
  const isProposta = tipo === "proposta"; // Proposta Pendente
  const isRecusada = tipo === "recusado"; // Proposta Recusada

  // Se for proposta, pega os dados detalhados, senão usa defaults
  const profileName = dadosDetalhados?.remetenteNome || "Sistema";
  const servicoNome = dadosDetalhados?.servicos 
      ? (Array.isArray(dadosDetalhados.servicos) ? dadosDetalhados.servicos.join(", ") : dadosDetalhados.servicos)
      : "Aviso";

  const dataObj = new Date(data);
  const dataFormatada = !isNaN(dataObj) ? dataObj.toLocaleDateString() : "";
  const horaFormatada = !isNaN(dataObj) ? dataObj.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "";

  return (
    <View
      style={[
        styles.card,
        isStrike && styles.cardStrike,
        isRecusada && styles.cardRecusado, // Estilo cinza/vermelho se recusado
      ]}
    >
      <Text style={[
          styles.cardTitle, 
          isStrike && {color:'#BD4311'},
          isRecusada && {color:'#666', textDecorationLine: 'line-through'} // Riscado se recusado
      ]}>
          {displayTitle}
      </Text>

      <View style={styles.topRow}>
        <Image source={require("../../assets/profile.png")} style={[styles.avatar, isRecusada && {opacity: 0.5}]} />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.profileName}>{profileName}</Text>
          
          {(isProposta || isRecusada) ? (
            <>
                <Text style={styles.label}>Serviço: <Text style={styles.info}>{servicoNome}</Text></Text>
                <Text style={styles.label}>Valor: <Text style={styles.info}>R$ {dadosDetalhados?.valor}</Text></Text>
                
                {/* Se foi recusada, mostra um aviso extra */}
                {isRecusada && (
                    <Text style={{color: '#D32F2F', fontWeight:'bold', marginTop: 5}}>
                        🚫 Você recusou esta oferta.
                    </Text>
                )}
            </>
          ) : (
            <Text style={styles.info}>{mensagem}</Text>
          )}

          <Text style={styles.time}>{dataFormatada} às {horaFormatada}</Text>

          {/* BOTÕES */}
          <View style={styles.buttonRow}>
            
            {/* Botões de Ação APENAS se for Proposta Pendente */}
            {isProposta && (
                <>
                    <TouchableOpacity style={[styles.btn, {backgroundColor:'#4CAF50'}]} onPress={onAceitar}>
                        <Text style={styles.btnText}>Aceitar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={[styles.btn, {backgroundColor:'#F44336'}]} onPress={onRecusar}>
                        <Text style={styles.btnText}>Recusar</Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Se for STRIKE: Contestar */}
            {isStrike && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#D32F2F" }]}
                onPress={() => navigation.navigate("contestarstrike")}
              >
                <Text style={styles.btnText}>Contestar</Text>
              </TouchableOpacity>
            )}

            {/* Botão de Limpar para itens recusados ou avisos */}
            {(isRecusada || (!isProposta && !isStrike)) && (
                <TouchableOpacity style={[styles.btn, {backgroundColor:'#999'}]} onPress={onLimpar}>
                    <Text style={styles.btnText}>Limpar</Text>
                </TouchableOpacity>
            )}
            
            {/* Ver Perfil (disponível em quase todos, menos se recusado para não poluir) */}
            {!isRecusada && (
                <TouchableOpacity style={[styles.btn, {backgroundColor:'#007BFF'}]} onPress={() => navigation.navigate("perfilA")}>
                    <Text style={styles.btnText}>Ver Perfil</Text>
                </TouchableOpacity>
            )}

          </View>
        </View>
      </View>
    </View>
  );
}

// ------------------- OUTRAS PÁGINAS -------------------
function PerfilAPage() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>📄 Perfil A</Text>
    </View>
  );
}

function ContestarStrikePage() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>⚠️ Contestar Strike</Text>
    </View>
  );
}

function ContestacaoEnviarPage() {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>📤 Enviar Contestação</Text>
    </View>
  );
}

// ------------------- ESTILOS -------------------
const styles = StyleSheet.create({
  principal: {
    flex: 1,
    paddingTop: 30,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },

  // FOTO NO TOPO
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
  },

  avatar: { width: 60, height: 60, borderRadius: 30 },
  profileName: { fontSize: 16, fontWeight: "bold" },

  buttonRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  btn: {
    backgroundColor: "#007BFF",
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
});
