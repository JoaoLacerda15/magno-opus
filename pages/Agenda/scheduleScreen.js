import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Animated, FlatList, Text } from "react-native";
import { Card } from "react-native-paper";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";

import { firestoreDB } from "../../firebase/firebaseService";
import { collection, onSnapshot } from "firebase/firestore";

import ScheduleModal from "../../components/ScheduleModal";
import { LocaleConfig } from "react-native-calendars";
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

  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [modalVisible, setModalVisible] = useState(false);

  // Lista de eventos da data selecionada
  const eventsOfDay = schedules.filter((item) => item.date === selectedDate);

  // --- Animação do modal ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const animateModalIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const animateModalOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      callback && callback();
    });
  };

  // ▶️ Carrega agendamentos em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(firestoreDB, "agendamentos"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSchedules(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // ▶️ Marca dias com agendamentos
  useEffect(() => {
    const marked = {};
    schedules.forEach((item) => {
      if (item.date) {
        marked[item.date] = { marked: true, dotColor: "#3b82f6" };
      }
    });
    setMarkedDates(marked);
  }, [schedules]);

  // ▶️ Quando o usuário toca num dia
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setModalVisible(true);
    animateModalIn();
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            ...(selectedDate
              ? {
                  [selectedDate]: {
                    selected: true,
                    selectedColor: "#2563eb",
                  }
                }
              : {}),
          }}
          theme={{
            todayTextColor: "#2563eb",
            selectedDayBackgroundColor: "#2563eb",
            selectedDayTextColor: "#fff",
          }}
        />
      </Card>

      {/* ----------------------------- */}
      {/*        MODO AGENDA            */}
      {/* ----------------------------- */}

      <Text style={styles.agendaTitle}>Agenda do Dia</Text>

      {eventsOfDay.length === 0 ? (
        <Text style={styles.noEventsText}>Nenhum evento para este dia.</Text>
      ) : (
        <FlatList
          data={eventsOfDay}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title || "Agendamento"}</Text>
              <Text style={styles.eventTime}>{item.time || "Horário não definido"}</Text>
            </Card>
          )}
        />
      )}

      {/* ----------------------------- */}
      {/*   MODAL COM ANIMAÇÃO + LISTA  */}
      {/* ----------------------------- */}
      <ScheduleModal
        visible={modalVisible}
        fadeAnim={fadeAnim}
        scaleAnim={scaleAnim}
        onClose={() =>
          animateModalOut(() => setModalVisible(false))
        }
        selectedDate={selectedDate}
        eventsOfDay={eventsOfDay}
        onNewSchedule={() =>
          navigation.navigate("criacaoformulario", { selectedDate })

        }
      />
      <BarraNavegacao/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f1f5f9",
  },
  card: {
    borderRadius: 16,
    padding: 10,
  },

  // AGENDA
  agendaTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
    color: "#0f172a",
  },
  noEventsText: {
    color: "#64748b",
    fontSize: 16,
    marginTop: 5,
  },
  eventCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  eventTime: {
    fontSize: 14,
    color: "#475569",
    marginTop: 4,
  },
});

