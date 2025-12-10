import { ref, get, set, child } from "firebase/database";
import { realtimeDB } from "../firebase/firebaseService";

export async function getBusyDates(userId) {
  try {
    const scheduleRef = ref(realtimeDB, `agenda/${userId}`);
    const snapshot = await get(scheduleRef);

    let markedDates = {};

    if (snapshot.exists()) {
      const data = snapshot.val();
      
      Object.keys(data).forEach(date => {
        // VERIFICAÇÃO CRUCIAL: Só marca se estiver confirmado
        if (data[date].status === 'confirmed') {
            markedDates[date] = {
              disabled: true,
              disableTouchEvent: true,
              marked: true,
              dotColor: 'red' // Dia realmente ocupado
            };
        }
      });
    }
    return markedDates;
  } catch (error) {
    console.error("Error fetching busy dates:", error);
    return {};
  }
}