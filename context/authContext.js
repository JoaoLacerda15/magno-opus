import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, get } from 'firebase/database';
import { auth, realtimeDB } from '../firebase/firebaseService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUser = async (userData) => {
    setUserState(userData);
    if (userData) {
      await AsyncStorage.setItem("@magnoopus:user", JSON.stringify(userData));
    } else {
      await AsyncStorage.removeItem("@magnoopus:user");
    }
  };

  useEffect(() => {
    // Ao abrir o App, verifica se tem usuário salvo no celular
    const loadStorageData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("@magnoopus:user");
        if (storedUser) {
          setUserState(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar usuário do storage:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const logout = async () => {
    // Limpa o estado e o storage
    await setUser(null); 
    return { success: true };
  };

  return (
    // Passamos a nova função setUser que salva no storage automaticamente
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
