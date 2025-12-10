import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { atualizarContratoChat, recusarContratoChat, concluirContratoChat, confirmarAgendamento } from "../../services/chatService";
import { useAuth } from "../../context/authContext";
import { ref, onValue, set } from "firebase/database";
import { realtimeDB } from "../../firebase/firebaseService";

// Tamanho da tela (para animação)
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function MenuChat({
  visible,
  onClose,
  chatId,
  outroUsuario
}) {

  
  const [slideAnim] = useState(new Animated.Value(-SCREEN_WIDTH));

  const [chatData, setChatData] = useState(null);
  const [contrato, setContrato] = useState(null);

  
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const myId = user?.id || user?.uid;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      slideAnim.setValue(-SCREEN_WIDTH);
    }
  }, [visible]);



  useEffect(() => {
    if (!visible || !chatId) {
      slideAnim.setValue(-SCREEN_WIDTH);
      return;
    }

    setLoading(true);
    
    // MUDANÇA: Ouvimos o chat inteiro, não só o contrato
    // Isso é necessário para acessar o nó 'conclusoes' e 'contrato' simultaneamente
    const chatRef = ref(realtimeDB, `chats/${chatId}`);
    
    const unsubscribe = onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const dados = snapshot.val();
        setChatData(dados);
        setContrato(dados.contrato);
      } else {
        // Se o snapshot não existe, significa que o chat foi EXCLUÍDO (ambos aceitaram)
        // Então fechamos o menu
        setChatData(null);
        setContrato(null);
        onClose(); 
        // Idealmente aqui você navegaria para fora da tela de chat também no componente pai
      }
      setLoading(false);
    });

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    return () => unsubscribe();
  }, [visible, chatId]);

  const handleAceitar = async () => {
    try {
        if (!chatId || !contrato) return;

        await atualizarContratoChat(chatId, contrato); 
        
        if (contrato.dataServico) {
            await confirmarAgendamento(myId, contrato.dataServico);
        }

        Alert.alert("Sucesso", "Contrato aceito e data validada na agenda!");
    } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Falha ao aceitar.");
    }
  };

  const handleRecusar = async () => {
    try {
      Alert.alert(
        "Recusar Proposta",
        "Tem certeza? Isso irá excluir este chat e o contrato.",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Recusar", 
            style: "destructive", 
            onPress: async () => {
                await recusarContratoChat(chatId);
                
                // Notify the other user
                if (outroUsuario?.id || outroUsuario?.uid) {
                    const servicoNome = contrato?.servicos ? (Array.isArray(contrato.servicos) ? contrato.servicos[0] : contrato.servicos) : "serviço";
                    await notificarRecusa(outroUsuario.id || outroUsuario.uid, user.nome, servicoNome);
                }
                
                onClose(); // Close menu (and likely nav back since chat is gone)
            } 
          }
        ]
      );
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao recusar.");
    }
  };

  const handleConcluir = async () => {
    try {
        Alert.alert(
            "Finalizar Serviço",
            "Ao confirmar, você indica que o serviço foi realizado. O chat será apagado somente quando AMBOS confirmarem.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Confirmar Conclusão", 
                    onPress: async () => {
                        // Passamos o chatId E o ID do usuário atual
                        const result = await concluirContratoChat(chatId, myId);
                        
                        if (result === "DELETED") {
                            Alert.alert("Finalizado", "Ambos confirmaram. O chat foi encerrado.");
                            onClose();
                        } else {
                            Alert.alert("Aguardando", "Sua confirmação foi enviada. Aguardando o outro usuário.");
                        }
                    }
                }
            ]
        );
    } catch (error) {
        Alert.alert("Erro", "Falha ao concluir.");
    }
  };

  if (!visible) return null;

  const isAtivo = contrato?.status_contrato === "ativo";
  const isPendente = contrato?.status_contrato === "aguardando_aceite" || contrato?.status_contrato === "pendente";

  const euConclui = chatData?.conclusoes && chatData.conclusoes[myId] === true;

  const dataFormatada = contrato?.dataServico 
      ? contrato.dataServico.split('-').reverse().join('/') 
      : "--/--/----";
  
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />

      <Animated.View style={[styles.menuContainer, { left: slideAnim }]}>
        <ScrollView showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>

          {/* PERFIL */}
          <View style={styles.profileSection}>
            <Image 
                source={{ uri: outroUsuario?.photoURL || "https://via.placeholder.com/150" }} 
                style={styles.avatar} 
            />
            <Text style={styles.profileName}>{outroUsuario?.nome || "Usuário"}</Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.sectionTitle}>Detalhes do Contrato</Text>

          {loading ? (
            <ActivityIndicator color="#007BFF" />
          ) : (
            <View style={styles.descriptionBox}>
              
              {/* --- CENÁRIO 1: PENDENTE (Mostra Aviso e Esconde Dados) --- */}
              {isPendente && (
                  <View style={styles.pendingBox}>
                      <Ionicons name="notifications-outline" size={32} color="#F77C00" style={{marginBottom: 8}} />
                      <Text style={styles.pendingTitle}>Proposta Pendente</Text>
                      <Text style={styles.pendingText}>
                          Para visualizar os detalhes (Valor, Data, Endereço) e aceitar ou recusar este serviço, por favor acesse suas <Text style={{fontWeight:'bold'}}>Notificações</Text>.
                      </Text>
                  </View>
              )}

              {/* --- CENÁRIO 2: ATIVO (Mostra Tudo) --- */}
              {isAtivo && contrato && (
                  <>
                    <Text style={styles.descItem}>
                      {contrato.descricao || "Sem descrição"}
                    </Text>

                    {/* Aqui usamos a variável corrigida */}
                    <Text style={styles.descSmall}>
                        📅 Data: <Text style={{fontWeight: 'bold', color: '#333'}}>{dataFormatada}</Text>
                    </Text>
                    <Text style={styles.descSmall}>💰 Valor: R$ {contrato.valor}</Text>
                    <Text style={styles.descSmall}>📍 Local: {contrato.endereco}</Text>
                    <Text style={styles.descSmall}>🛠️ Serviço: {contrato.servico || contrato.servicos}</Text>
                    
                    <Text style={[styles.descSmall, {marginTop: 5, fontWeight:'bold', color: 'green'}]}>
                      Status: ATIVO
                    </Text>

                    {chatData?.conclusoes && (
                        <View style={{marginTop: 8, padding: 8, backgroundColor: '#f0f8ff', borderRadius: 4}}>
                            <Text style={{fontSize: 12, color: '#0056b3'}}>
                                {Object.keys(chatData.conclusoes).length}/2 confirmações de conclusão.
                            </Text>
                        </View>
                    )}
                  </>
              )}
            </View>
          )}

          <View style={styles.separator} />

          {/* BOTÕES DE AÇÃO */}
          <View style={{ marginTop: 20 }}>
            
            {/* Se estiver PENDENTE: Botão apenas para fechar ou redirecionar (opcional) */}
            {isPendente && (
              <TouchableOpacity style={[styles.btn, styles.btnCinza]} onPress={onClose}>
                  <Text style={styles.btnText}>Fechar Menu</Text>
              </TouchableOpacity>
            )}

            {/* Se estiver ATIVO: Botão Concluir */}
            {isAtivo && (
                <>
                    {!euConclui ? (
                        <TouchableOpacity style={[styles.btn, styles.btnVerde]} onPress={handleConcluir}>
                            <Text style={styles.btnText}>Concluir Serviço</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={[styles.btn, { backgroundColor: '#ccc' }]}>
                            <Text style={[styles.btnText, { color: '#555' }]}>
                                Aguardando {outroUsuario?.nome || "o outro"}...
                            </Text>
                        </View>
                    )}
                </>
            )}

          </View>

        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
  },

  menuContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.78,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 45,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },

  closeBtn: {
    position: "absolute",
    top: 15,
    right: 15,
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  profileName: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
  },

  separator: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginVertical: 18,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 10,
    color: "#222",
  },

  descriptionBox: {
    paddingLeft: 5,
    gap: 4,
  },

  descItem: {
    fontSize: 15,
    fontWeight: "500",
    color: "#444",
  },

  descSmall: {
    fontSize: 14,
    color: "#666",
  },

  btn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },

  btnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

  btnAzul: {
        blue: '#3F59BF',
  },

  btnLaranja: {
    orange: '#F77C00',
  },

  btnCinza: {
    thirdGray: '#b6b6b6ff',
  },
  btnVerde: {
    backgroundColor: "#4CAF50",
  }
});
