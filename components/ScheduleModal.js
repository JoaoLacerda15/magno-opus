import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
} from "react-native";
import { Card } from "react-native-paper";

export default function ScheduleModal({
  visible,
  onClose,
  fadeAnim,
  scaleAnim,
  selectedDate,
  eventsOfDay,
  onNewSchedule,
}) {
  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Título */}
        <Text style={styles.title}>Agendamentos do Dia</Text>
        <Text style={styles.dateText}>
          {selectedDate
            ? selectedDate.split("-").reverse().join("/")
            : ""}
        </Text>

        {/* Lista de eventos */}
        {eventsOfDay?.length === 0 ? (
          <Text style={styles.noEvents}>Nenhum evento encontrado.</Text>
        ) : (
          <FlatList
            data={eventsOfDay}
            keyExtractor={(item) => item.id}
            style={{ width: "100%" }}
            renderItem={({ item }) => (
              <Card style={styles.eventCard}>
                <Text style={styles.eventTitle}>
                  {item.title || "Agendamento"}
                </Text>
                <Text style={styles.eventTime}>
                  {item?.time || "Horário não informado"}
                </Text>
              </Card>
            )}
          />
        )}

        {/* Botões */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.buttonAdd} onPress={onNewSchedule}>
            <Text style={styles.btnText}>Novo Agendamento</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonClose} onPress={onClose}>
            <Text style={styles.btnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },

  modalContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#0f172a",
    textAlign: "center",
  },

  dateText: {
    fontSize: 16,
    color: "#475569",
    marginBottom: 20,
    textAlign: "center",
  },

  noEvents: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginTop: 10,
  },

  eventCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    marginBottom: 10,
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

  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  buttonAdd: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  buttonClose: {
    backgroundColor: "#64748b",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
