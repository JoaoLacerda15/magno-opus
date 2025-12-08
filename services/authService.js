import { ref, set, get } from "firebase/database";
import { database } from "../firebase/firebaseService";

// Função opcional para remover acentos (normaliza busca)
const normalize = (str) =>
  str
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() || "";

export default class AuthService {

  // ---------------------------------------
  // 🟦 REGISTRO DE USUÁRIO
  // ---------------------------------------
  async register({ nome, email, password, userType, cpf, cep, tags }) {

    if (!email || !password || !nome) {
      throw new Error("Nome, Email e Senha são obrigatórios.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userKey = normalizedEmail.replace(/\./g, "_");
    const userRef = ref(database, `users/${userKey}`);

    const snapshot = await get(userRef);
    if (snapshot.exists()) throw new Error("Email já cadastrado");

    await set(userRef, {
      nome,
      email: normalizedEmail,
      password: password,
      userType,
      cpf: cpf || null,
      cep: cep || null,
      tags: tags || [],
      createdAt: new Date().toISOString(),
    });

    return true;
  }

  // ---------------------------------------
  // 🟦 LOGIN
  // ---------------------------------------
  async login(email, password) {
    try {

      if (!email || !password) {
        throw new Error("Email e Senha são obrigatórios.");
      }

      const normalizedEmail = email.toLowerCase().trim();

      const userKey = normalizedEmail.replace(/\./g, "_");
      const userRef = ref(database, `users/${userKey}`);

      const snapshot = await get(userRef);
      if (!snapshot.exists()) throw new Error("Email não cadastrado");

      const userData = snapshot.val();

      if (userData.password !== password) {
        throw new Error("Senha incorreta");
      }

      // Retorna o ID junto
      const { password: _, ...userInfo } = userData;
      return { id: userKey, ...userInfo }
    } catch(er) {
      console.error("Erro no login:", er.message);
      throw er;
    }
  }

  // ---------------------------------------
  // 🔵 BUSCAR USUÁRIO POR ID
  // ---------------------------------------
  async getUserById(userId) {
    if (!userId) throw new Error("ID inválido");

    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      throw new Error("Usuário não encontrado");
    }

    return snapshot.val();
  }

  // ---------------------------------------
  // 🔍 BUSCA AVANÇADA (nome + email + tags)
  // ---------------------------------------
  async searchUsers(query, selectedTag = null) {
    const dbRef = ref(database, "users");
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
