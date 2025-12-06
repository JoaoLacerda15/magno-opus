// Importações
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, realtimeDB } from '../firebase/firebaseService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Função auxiliar para pegar dados de um nó do DB
    const fetchNode = async (path) => {
        console.log(`Buscando dados de: ${path}`);
        const snapshot = await get(ref(realtimeDB, path));
        const data = snapshot.exists() ? snapshot.val() : {};
        console.log(`Dados recebidos de ${path}:`, data);
        return data;
    };

    useEffect(() => {
        let active = true;

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log("onAuthStateChanged disparado. Usuário:", firebaseUser);

            const processUser = async () => {
                try {
                    if (!firebaseUser) {
                        console.log("Nenhum usuário logado.");
                        if (active) setUser(null);
                        return;
                    }

                    console.log("Recarregando usuário Firebase...");
                    await firebaseUser.reload();

                    if (!firebaseUser.emailVerified) {
                        console.log("Email não verificado.");
                        if (active) setUser(null);
                        return;
                    }

                    const uid = firebaseUser.uid;
                    console.log("UID do usuário:", uid);

                    const [loginData, usuarioData, enderecoData] = await Promise.all([
                        fetchNode(`logins/${uid}`),
                        fetchNode(`usuarios/${uid}`),
                        fetchNode(`enderecos/${uid}`)
                    ]);

                    const dadosCompletos = {
                        uid,
                        email: loginData.email ?? firebaseUser.email,
                        ...usuarioData,
                        ...enderecoData,
                    };

                    console.log("Objeto final de dados do usuário:", dadosCompletos);

                    if (active) setUser(dadosCompletos);

                } catch (err) {
                    console.error('Erro ao buscar dados do usuário:', err);
                    if (active) setUser(null);
                } finally {
                    if (active) setLoading(false);
                }
            };

            processUser();
        });

        return () => {
            active = false;
            unsubscribe();
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            return { success: true };
        } catch (err) {
            return { success: false, msg: err.message };
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
