import { ref, set, get, push } from "firebase/database";
import { realtimeDB } from "../firebase/firebaseService";

// Normalizar strings (acentos e maiúsculas)
const normalize = (str) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() || "";

export default class AuthService {

  // ---------------------------------------
  // 🟦 REGISTRO DE USUÁRIO (AGORA COM ID REAL)
  // ---------------------------------------
  async register({ nome, email, password, userType, cpf, cep, cidade, estado, tags }) {

    if (!email || !password || !nome) {
      throw new Error("Nome, Email e Senha são obrigatórios.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verifica se email já existe
    const usersRef = ref(realtimeDB, "users");
    const snapshot = await get(usersRef);

    if (snapshot.exists()) {
      const users = snapshot.val();
      const emailExists = Object.values(users).some(
        (u) => u.email === normalizedEmail
      );
      if (emailExists) throw new Error("Email já cadastrado");
    }

    // Cria ID automático
    const newUserRef = push(usersRef);
    const userId = newUserRef.key; // <--- ID REAL

    await set(newUserRef, {
      id: userId,
      nome,
      email: normalizedEmail,
      password: password,
      userType,
      cpf: cpf || null,
      cep: cep || null,
      cidade: cidade || null,
      estado: estado || null,
      tags: tags || [],
      createdAt: new Date().toISOString(),
    });

    return { id: userId };
  }

  // ---------------------------------------
  // 🟦 LOGIN (PROCURA O EMAIL DENTRO DOS USERS)
  // ---------------------------------------
  async login(email, password) {

    if (!email || !password) {
      throw new Error("Email e Senha são obrigatórios.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const usersRef = ref(realtimeDB, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) throw new Error("Email não cadastrado");

    const users = snapshot.val();

    // encontrar user cujo email bate
    const entries = Object.entries(users);
    const found = entries.find(([id, user]) => user.email === normalizedEmail);

    if (!found) throw new Error("Email não cadastrado");

    const [userId, userData] = found;

    if (userData.password !== password) {
      throw new Error("Senha incorreta");
    }

    const { password: _, ...info } = userData;
    return { id: userId, ...info };
  }

  // ---------------------------------------
  // 🔵 BUSCAR USUÁRIO POR ID
  // ---------------------------------------
  async getUserById(userId) {
    if (!userId) throw new Error("ID inválido");

    const userRef = ref(realtimeDB, `users/${userId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) throw new Error("Usuário não encontrado");

    return snapshot.val();
  }

  // ---------------------------------------
  // 🔍 BUSCA AVANÇADA
  // ---------------------------------------
  async searchUsers(query, selectedTag = null) {
    const dbRef = ref(realtimeDB, "users");
    const snapshot = await get(dbRef);

    if (!snapshot.exists()) return [];

    const usersObj = snapshot.val();
    const users = Object.values(usersObj);

    const q = normalize(query.trim());

    return users.filter((user) => {
      const nome = normalize(user.nome);
      const email = normalize(user.email);
      const tags = user.tags?.map((t) => normalize(t)) || [];

      const nomeMatch = nome.includes(q);
      const emailMatch = email.includes(q);
      const tagMatch = tags.some((t) => t.includes(q));

      const selectedTagMatch =
        selectedTag ? tags.includes(normalize(selectedTag)) : true;

      return (nomeMatch || emailMatch || tagMatch) && selectedTagMatch;
    });
  }
}
