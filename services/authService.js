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

    const userKey = email.replace(/\./g, "_");
    const userRef = ref(database, `users/${userKey}`);

    const snapshot = await get(userRef);
    if (snapshot.exists()) throw new Error("Email já cadastrado");

    await set(userRef, {
      nome,
      email,
      password, // ⚠️ sem hash (apenas protótipo)
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
      const userKey = email.replace(/\./g, "_");
      console.log(userKey);
      const userRef = ref(database, `users/${userKey}`);

      userRef ? console.log("Existe") : console.log("Não existe");

      const snapshot = await get(userRef);
      if (!snapshot.exists()) throw new Error("Email não cadastrado");

      const userData = snapshot.val();

      if (userData.password !== password) {
        throw new Error("Senha incorreta");
      }

      // Retorna o ID junto
      return { id: userKey, ...userData, };
    } catch(er) {
      console.error(er);
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
