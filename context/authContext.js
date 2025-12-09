import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, realtimeDB } from '../firebase/firebaseService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (isMounted) setUser(null);
        setLoading(false);
        return;
      }

      try {
        await firebaseUser.reload();

        if (!firebaseUser.emailVerified) {
          console.log("Usuário sem email verificado.");
          if (isMounted) setUser(null);
          return;
        }

        const uid = firebaseUser.uid;

        // 🔥 BUSCA NO CAMINHO CORRETO
        const userRef = ref(realtimeDB, `users/${uid}`);
        const snap = await get(userRef);

        if (snap.exists() && isMounted) {
          const userData = snap.val();

          setUser({
            uid,
            ...userData, // nome, email, cpf, tags, etc
          });
        } else {
          console.log("Usuário não encontrado no caminho users/uid");
          if (isMounted) setUser(null);
        }

      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
