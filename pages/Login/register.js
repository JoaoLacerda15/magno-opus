import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { ref, push } from "firebase/database";
import { db } from "../../firebase/firebaseService";

const MAX_TAG_LENGTH = 40;

export default function Register() {
  const [isWorker, setIsWorker] = useState(false);

  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  
  const defaultTags = [
    "Elétrica",
    "Pintura",
    "Encanamento",
    "Jardinagem",
    "Reformas",
    "Frete",
    "Aulas"
  ];

  function toggleTag(tag) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }
  function handleCustomTagChange(text) {
  if (text.length <= MAX_TAG_LENGTH) {
    setCustomTag(text);
  } else {
    Alert.alert(
      "Limite excedido",
      `A tag pode ter no máximo ${MAX_TAG_LENGTH} caracteres.`
    );
  }
 }


  function handleAddCustomTag() {
    const newTag = customTag.trim();

    if (newTag.length === 0) {
      Alert.alert("Tag vazia", "Digite um nome para a tag.");
      return;
    }

    if (newTag.length > MAX_TAG_LENGTH) {
      Alert.alert(
        "Tag muito longa",
        `A tag pode ter no máximo ${MAX_TAG_LENGTH} caracteres.`
      );
      return;
    }

    // Se já existe na lista padrão ou escolhidas
    if (selectedTags.includes(newTag) || defaultTags.includes(newTag)) {
      Alert.alert("Tag já existe", "Essa tag já está disponível.");
      return;
    }

    // ADICIONA IMEDIATAMENTE NA LISTA VISUAL
    setSelectedTags([...selectedTags, newTag]);

    setCustomTag("");
  }

  async function handleRegister() {
    // Aqui entra toda sua lógica atual de registro
    // Somente exemplo de salvamento no Firebase:
    try {
      const userRef = ref(db, "usuarios/");
      const newUser = push(userRef);

      await push(ref(db, `usuarios/${newUser.key}/tags`), selectedTags);

      Alert.alert("Sucesso", "Usuário registrado!");
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Não foi possível registrar.");
    }
  }

  return (
    <View style={{ padding: 20 }}>

      {/* MARCADOR DE USUÁRIO TRABALHADOR */}
      <TouchableOpacity
        style={{
          padding: 10,
          backgroundColor: isWorker ? "#007AFF" : "#DDD",
          marginBottom: 20,
          borderRadius: 10,
        }}
        onPress={() => setIsWorker(!isWorker)}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {isWorker ? "Sou Trabalhador ✓" : "Marcar como Trabalhador"}
        </Text>
      </TouchableOpacity>

      {/* TAGS SÓ APARECEM SE FOR TRABALHADOR */}
      {isWorker && (
        <View>

          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
            Selecione suas Tags:
          </Text>

          {/* LISTA DE TAGS PADRÃO */}
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {defaultTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                onPress={() => toggleTag(tag)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  margin: 5,
                  backgroundColor: selectedTags.includes(tag)
                    ? "#007AFF"
                    : "#F1F1F1",
                }}
              >
                <Text
                  style={{
                    color: selectedTags.includes(tag) ? "#fff" : "#333",
                    fontWeight: "bold",
                  }}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CAMPO DE NOVA TAG */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 16, marginBottom: 5 }}>
              Criar nova tag:
            </Text>

            <TextInput
                 value={customTag}
                 onChangeText={setCustomTag}
                 placeholder="Digite a nova tag (máx. 40 caracteres)"
                 maxLength={40}
                 style={{
                 borderWidth: 1,
                 borderColor: "#ccc",
                 padding: 10,
                 borderRadius: 10,
              }}
          />
          <Text style={{ color: "#555", fontSize: 12 }}>
            {customTag.length}/{MAX_TAG_LENGTH}
          </Text>

            <TouchableOpacity
              onPress={handleAddCustomTag}
              style={{
                secondOrange: '#F67F07',
                padding: 10,
                marginTop: 10,
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Adicionar Tag
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      )}

      <TouchableOpacity
        onPress={handleRegister}
        style={{
          backgroundColor: "#007AFF",
          padding: 12,
          marginTop: 40,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", textAlign: "center", fontSize: 16 }}>
          Registrar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
