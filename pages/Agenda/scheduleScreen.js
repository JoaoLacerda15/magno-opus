import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, FlatList, Text, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { Card } from "react-native-paper";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";

import { getAgendaUsuario } from "../../services/agendaService";

import { useAuth } from "../../context/authContext";

import ScheduleModal from "../../components/ScheduleModal";
import BarraNavegacao from "../../components/navbar";

// ---------- Calendário PT-BR ----------
LocaleConfig.locales["pt-br"] = {
  monthNames: [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ],
  monthNamesShort: [
    "Jan","Fev","Mar","Abr","Mai","Jun",
    "Jul","Ago","Set","Out","Nov","Dez"
  ],
  dayNames: [
    "Domingo","Segunda-feira","Terça-feira","Quarta-feira",
    "Quinta-feira","Sexta-feira","Sábado"
  ],
  dayNamesShort: ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"],
  today: "Hoje",
};
LocaleConfig.defaultLocale = "pt-br";

export default function ScheduleScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user: userLogado } = useAuth();

  const insets = useSafeAreaInsets();

  // 1. Lógica de Identidade (Igual ao PerfilPP)
  const targetUserId = route.params?.userId || userLogado?.id || userLogado?.uid;
  const isOwner = userLogado && (userLogado.id === targetUserId || userLogado.uid === targetUserId);

  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtra eventos locais para o dia selecionado
  const eventsOfDay = schedules.filter((item) => item.date === selectedDate);


  const getStatusInfo = (status) => {
    switch (status) {
        case 'confirmed': return { label: 'Confirmado', color: '#4CAF50', bg: '#E8F5E9' };
        case 'concluido': return { label: 'Concluído', color: '#2196F3', bg: '#E3F2FD' };
        case 'formulario': return { label: 'Manual', color: '#FF9800', bg: '#FFF3E0' };
        default: return { label: 'Pendente', color: '#9E9E9E', bg: '#F5F5F5' };
    }
  };

  // ▶️ Carrega agendamentos em tempo real
  useEffect(() => {
    carregarDados();
  }, [targetUserId]);

  const carregarDados = async () => {
    setLoading(true);
    try {
        if (targetUserId) {
            const data = await getAgendaUsuario(targetUserId);
            setSchedules(data);
        }
    } catch (error) {
        console.error("Erro ao carregar agenda:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    const marked = {};
    schedules.forEach((item) => {
      if (item.date) {
        const info = getStatusInfo(item.status);
        marked[item.date] = { marked: true, dotColor: info.color };
      }
    });
    setMarkedDates(marked);
  }, [schedules]);

  // ▶️ Quando o usuário toca num dia
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleShowDetails = (item) => {
    const info = getStatusInfo(item.status);
    
    Alert.alert(
        "Detalhes do Serviço",
        `\n👤 Cliente: ${item.nomeCliente || "Não informado"}` +
        `\n🛠 Serviço: ${item.servico || "Não informado"}` +
        `\n📍 Local: ${item.local || "Não informado"}` +
        `\n💰 Valor: R$ ${item.valor || "A combinar"}` +
        `\n🕒 Horário: ${item.time || "Dia todo"}` +
        `\n📌 Status: ${info.label}` + 
        (item.descricao ? `\n📝 Obs: ${item.descricao}` : ""),
        [{ text: "Fechar", style: "cancel" }]
    );
  };

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f1f5f9", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View style={styles.container}>
        
        <Text style={styles.screenTitle}>
            {isOwner ? "Minha Agenda" : "Agenda Disponível"}
        </Text>

        <Card style={styles.card}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={{
              ...markedDates,
              ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: "#2563eb" } } : {}),
            }}
            theme={{ todayTextColor: "#2563eb", selectedDayBackgroundColor: "#2563eb", selectedDayTextColor: "#fff", arrowColor: "#2563eb" }}
          />
        </Card>

        <Text style={styles.agendaTitle}>
            {selectedDate ? `Eventos de ${formatarData(selectedDate)}` : "Selecione uma data para ver detalhes"}
        </Text>

        <FlatList
            data={eventsOfDay}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={selectedDate ? (<Text style={styles.noEventsText}>Nenhum evento para este dia.</Text>) : null}
            renderItem={({ item }) => {
              const statusInfo = getStatusInfo(item.status);
              return (
                <TouchableOpacity onPress={() => handleShowDetails(item)} activeOpacity={0.7}>
                    <Card style={styles.eventCard}>
                        <View style={styles.cardContent}>
                            <View style={[styles.statusLine, { backgroundColor: statusInfo.color }]} />
                            <View style={{ flex: 1 }}>
                                <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                    <Text style={styles.eventTitle}>{item.servico || "Serviço"}</Text>
                                    {item.time && <Text style={styles.timeText}>{item.time}</Text>}
                                </View>
                                <Text style={styles.eventSubtitle}>{item.nomeCliente ? `${item.nomeCliente}` : "Cliente não informado"}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                                    <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                                </View>
                            </View>
                            <Ionicons name="information-circle-outline" size={24} color="#ccc" style={{marginLeft: 10}} />
                        </View>
                    </Card>
                </TouchableOpacity>
              );
            }}
        />

        {isOwner && selectedDate && (
            <View style={styles.floatingButtonContainer}>
                <TouchableOpacity style={styles.btnFloating} onPress={() => navigation.navigate("criacaoformulario", { selectedDate })}>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.btnFloatingText}>Novo Agendamento</Text>
                </TouchableOpacity>
            </View>
        )}

      </View>
      <BarraNavegacao/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 15,
      textAlign: 'center'
  },
  card: {
    borderRadius: 16,
    padding: 5, // Reduzi um pouco
    elevation: 3
  },

  // AGENDA LISTA
  agendaTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#0f172a",
  },
  emptyContainer: {
      alignItems: 'center',
      marginTop: 10
  },
  noEventsText: {
    color: "#64748b",
    fontSize: 16,
    marginBottom: 10,
  },
  btnAdd: {
      backgroundColor: '#2563eb',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20
  },
  btnAddText: {
      color: '#fff',
      fontWeight: 'bold'
  },

  // CARD DE EVENTO
  eventCard: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden'
  },
  cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      paddingLeft: 16
  },
  statusLine: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 6,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  eventSubtitle: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2,
  },
  statusText: {
      fontSize: 12,
      fontWeight: 'bold',
      marginTop: 4
  }
});