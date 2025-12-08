import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, realtimeDB } from '../firebase/firebaseService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // flag para evitar state updates depois do unmount

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            const handleUser = async () => {
                try {
                    if (firebaseUser) {
                        await firebaseUser.reload();

                        if (!firebaseUser.emailVerified) {
                            console.log('Usuário não verificou o email.');
                            if (isMounted) setUser(null);
                            return;
                        }

                        const uid = firebaseUser.uid;

                        // login
                        const loginRef = ref(realtimeDB, `logins/${uid}`);
                        const loginSnap = await get(loginRef);
                        const loginData = loginSnap.exists() ? loginSnap.val() : {};

                        // dados do usuário
                        const usuarioRef = ref(realtimeDB, `usuarios/${uid}`);
                        const usuarioSnap = await get(usuarioRef);
                        const usuarioData = usuarioSnap.exists() ? usuarioSnap.val() : {};

                        // dados do endereço
                        const enderecoRef = ref(realtimeDB, `enderecos/${uid}`);
                        const enderecoSnap = await get(enderecoRef);
                        const enderecoData = enderecoSnap.exists() ? enderecoSnap.val() : {};

                        // junta tudo
                        const dadosCompletos = {
                            uid,
                            email: loginData.email ?? firebaseUser.email,
                            ...usuarioData,
                            ...enderecoData,
                        };

                        if (isMounted) setUser(dadosCompletos);
                    } else {
                        if (isMounted) setUser(null);
                    }
                } catch (error) {
                    console.error('Erro ao buscar dados do usuário:', error);
                    if (isMounted) setUser(null);
                } finally {
                    if (isMounted) setLoading(false);
                }
            };


            handleUser();
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
        <AuthContext.Provider value={{ user, setUser, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
