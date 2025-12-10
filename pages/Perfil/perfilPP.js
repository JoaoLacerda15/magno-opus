import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AuthService from "../../services/authService";
import BarraNavegacao from "../../components/navbar";
import { useAuth } from "../../context/authContext";
import { criarChat } from "../../services/chatService";
import { enviarNotificacao } from "../../services/notification";

const authService = new AuthService();

export default function PerfilPP() {
  const route = useRoute();
  const navigation = useNavigation();

  const { user: userLogado, logout } = useAuth();

  const targetUserId = route.params?.userId || userLogado?.id || userLogado?.uid;

  const [perfilExibido, setPerfilExibido] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DO FORMULÁRIO DE PROPOSTA ---
  const [modalVisible, setModalVisible] = useState(false);
  const [etapa, setEtapa] = useState(1);
  const [loadingEnvio, setLoadingEnvio] = useState(false);

  // Campos do formulário
  const [valorOferta, setValorOferta] = useState("");
  const [servicosSelecionados, setServicosSelecionados] = useState([]);
  const [descricao, setDescricao] = useState("");
  const [endereco, setEndereco] = useState("");

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja deslogar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Se sua navegação não redirecionar automaticamente pelo Context, 
              // você pode forçar a ida para a tela de Login aqui:
              // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (error) {
              Alert.alert("Erro", "Não foi possível deslogar.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    async function carregarDadosDoPerfil() {
      setLoading(true);

      if (!targetUserId) {
        console.warn("Nenhum ID identificado para exibir o perfil.");
        setLoading(false);
        return;
      }

      if (userLogado && targetUserId === userLogado.id) {
        console.log("✅ Exibindo dados do próprio usuário (via Contexto)");
        setPerfilExibido(userLogado);
        setLoading(false);
        return;
      }

      console.log(`🔍 Buscando dados do usuário ID: ${targetUserId}`);
      try {
        const dados = await authService.getUserById(targetUserId);
        setPerfilExibido(dados);
      } catch (e) {
        console.error("❌ Erro ao buscar perfil:", e.message);
        setPerfilExibido(null);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDoPerfil();
  }, [targetUserId, userLogado]);

  // --- LÓGICA DO MODAL ---

  const abrirModalProposta = () => {
    setEtapa(1);
    setValorOferta("");
    setServicosSelecionados([]);
    setDescricao("");
    setEndereco("");
    setModalVisible(true);
  };

  const toggleServico = (tag) => {
    if (servicosSelecionados.includes(tag)) {
      setServicosSelecionados(prev => prev.filter(item => item !== tag));
    } else {
      if (servicosSelecionados.length >= 3) {
        Alert.alert("Limite", "Você pode selecionar no máximo 3 serviços.");
        return;
      }
      setServicosSelecionados(prev => [...prev, tag]);
    }
  };

  const avancarEtapa = () => {
    if (etapa === 1) {
      if (!valorOferta) return Alert.alert("Atenção", "Informe um valor para a oferta.");
      setEtapa(2);
    } else if (etapa === 2) {
      if (servicosSelecionados.length === 0) return Alert.alert("Atenção", "Selecione pelo menos um serviço.");
      setEtapa(3);
    }
  };

    const finalizarProposta = async () => {
    if (!descricao || !endereco) return Alert.alert("Atenção", "Preencha a descrição e o endereço.");

    setLoadingEnvio(true);

    try {
      const dadosCompletos = {
        valor: valorOferta,
        servicos: servicosSelecionados, // Array de strings
        descricao: descricao,
        endereco: endereco,
        // Dados extras para o contrato do chat
        servico: servicosSelecionados.join(", "), 
        nome_contratante: userLogado.nome,
        nome_contratado: perfilExibido.nome
      };

      const myId = userLogado.id || userLogado.uid;

      // 1. Cria o Chat (para termos onde conversar)
      const chatId = await criarChat(myId, perfilExibido.id, dadosCompletos);

      // 2. Envia a Notificação baseada nas etapas
      await enviarNotificacao(perfilExibido.id, dadosCompletos, userLogado, chatId);

      setModalVisible(false);
      Alert.alert("Sucesso", "Proposta enviada e notificação criada!");
      
      // 3. Vai para o chat
      navigation.navigate('chatScreen', { chatId, targetUserId: perfilExibido.id });

    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar proposta.");
    } finally {
      setLoadingEnvio(false);
    }
  };

  const renderEtapaContent = () => {
    if (etapa === 1) {
      return (
        <View>
          <Text style={styles.labelModal}>💰 Etapa 1: Qual o valor da oferta?</Text>
          <TextInput
            style={styles.inputModal}
            placeholder="Ex: 150,00"
            keyboardType="numeric"
            value={valorOferta}
            onChangeText={setValorOferta}
          />
        </View>
      );
    } 
    
    if (etapa === 2) {
      return (
        <View>
          <Text style={styles.labelModal}>🛠️ Etapa 2: Selecione o serviço (Max 3)</Text>
          <View style={styles.tagsContainer}>
            {perfilExibido.tags && perfilExibido.tags.length > 0 ? (
              perfilExibido.tags.map((tag, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.tagBadge, servicosSelecionados.includes(tag) && styles.tagBadgeSelected]}
                  onPress={() => toggleServico(tag)}
                >
                  <Text style={[styles.tagText, servicosSelecionados.includes(tag) && styles.tagTextSelected]}>{tag}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{color:'#666'}}>Este usuário não possui tags cadastradas.</Text>
            )}
          </View>
        </View>
      );
    }

    if (etapa === 3) {
      return (
        <View>
          <Text style={styles.labelModal}>📝 Etapa 3: Detalhes finais</Text>
          
          <Text style={styles.subLabel}>Descrição do que precisa ser feito:</Text>
          <TextInput
            style={[styles.inputModal, {height: 80, textAlignVertical: 'top'}]}
            placeholder="Ex: Preciso que troque o encanamento da pia..."
            multiline
            value={descricao}
            onChangeText={setDescricao}
          />

          <Text style={styles.subLabel}>Endereço do serviço:</Text>
          <TextInput
            style={styles.inputModal}
            placeholder="Rua, Número, Bairro..."
            value={endereco}
            onChangeText={setEndereco}
          />
        </View>
      );
    }
  };

  // PROFISSÃO = primeira tag marcada
  const profissao =
    perfilExibido?.tags?.length > 0 ? perfilExibido.tags[0] : "Profissão não informada";

  // ----------------------------------------------------
  // 🔍 Tela de Carregamento ou Usuário Não Encontrado
  // ----------------------------------------------------
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1565C0" />
        <Text style={{ marginTop: 10 }}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!perfilExibido) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={40} color="#E53935" />
        <Text style={{ fontSize: 16, color: "#E53935", marginTop: 10 }}>
          Perfil não encontrado.
        </Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // ----------------------------------------------------
  // 🖼️ Renderização Principal do Perfil
  // ----------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {perfilExibido?.avatar ? (
                <Image 
                  source={{ uri: perfilExibido.avatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                // Usando a primeira letra do nome como fallback (opcional)
                <Text style={styles.avatarText}>
                  {perfilExibido.nome ? perfilExibido.nome[0].toUpperCase() : '?'}
                </Text>
              )}
            </View>

            {/* Nome */}
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#222" }}>
              {perfilExibido?.nome || "Usuário"}
            </Text>

            {/* Profissão via TAG */}
            <Text style={styles.jobTitle}>
              {profissao}
            </Text>

            {/* Localização */}
            <Text style={styles.location}>
              {perfilExibido?.cidade && perfilExibido?.estado
                ? `${perfilExibido.cidade} - ${perfilExibido.estado}`
                : `CEP: '${perfilExibido?.cep}'`|| "Localização não informada"}
            </Text>

            {/* Sobre mim */}
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Sobre mim:</Text>

              <Text style={styles.aboutText}>
                {perfilExibido?.bio || "Nenhuma descrição informada"}
              </Text>
            </View>

            {/* Botões */}
            <View style={styles.buttonGrid}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>Portfólio</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>Comentários</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.buttonText}>Agenda</Text>
              </TouchableOpacity>

              {/* SÓ MOSTRA O BOTÃO CONVERSAR SE NÃO FOR EU MESMO */}
              {/* LÓGICA DOS BOTÕES DE AÇÃO */}
              
              {/* CASO 1: É OUTRA PESSOA -> MOSTRA "CONVERSAR" */}
              {userLogado && (userLogado.id !== perfilExibido.id && userLogado.uid !== perfilExibido.id) && (
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={abrirModalProposta}
                >
                    <Text style={styles.buttonText}>Conversar</Text>
                </TouchableOpacity>
              )}

              {/* CASO 2: SOU EU MESMO -> MOSTRA "DESLOGAR" EM VERMELHO */}
              {userLogado && (userLogado.id === perfilExibido.id || userLogado.uid === perfilExibido.id) && (
                <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#D32F2F' }]} // Vermelho
                    onPress={handleLogout}
                >
                    <Text style={styles.buttonText}>Deslogar</Text>
                </TouchableOpacity>
              )}

            </View>
          </View>

          {/* --- MODAL DE PROPOSTA --- */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                
                {/* Cabeçalho do Modal */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Nova Proposta ({etapa}/3)</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {/* Corpo Dinâmico */}
                <View style={styles.modalBody}>
                  {renderEtapaContent()}
                </View>

                {/* Rodapé com Botões */}
                <View style={styles.modalFooter}>
                  {etapa > 1 && (
                    <TouchableOpacity style={styles.btnSecondary} onPress={() => setEtapa(etapa - 1)}>
                      <Text style={styles.btnTextSecondary}>Voltar</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={styles.btnPrimary} 
                    onPress={etapa === 3 ? finalizarProposta : avancarEtapa}
                    disabled={loadingEnvio}
                  >
                    {loadingEnvio ? (
                      <ActivityIndicator color="#fff" size="small"/>
                    ) : (
                      <Text style={styles.btnTextPrimary}>
                        {etapa === 3 ? "Enviar Proposta" : "Próximo"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>

          {/* Analytics Section (mantida como estava) */}
          <View style={styles.analyticsSection}>
            <View style={styles.analyticsTitleContainer}>
              <Text style={styles.analyticsTitle}>Análise</Text>
              <MaterialCommunityIcons name="chart-bar" size={20} color="#333" />
            </View>
            {/* ... Itens de Análise ... */}
          </View>
        </ScrollView>
      </SafeAreaView>

      <BarraNavegacao />
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  scrollView: { flex: 1 },

  // Estilo para o estado de carregamento/erro
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  goBackButton: {
    marginTop: 20,
    backgroundColor: '#1565C0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  header: {
    backgroundColor: "#1565C0",
    height: 60,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },

  backButton: { width: 40, height: 40, justifyContent: "center" },

  profileSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 3,
  },

  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ddd", // Cor de fundo para o fallback
    marginBottom: 12,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
  },
  // Estilo para a letra inicial do nome
  avatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },

  jobTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 4,
  },

  location: { fontSize: 14, color: "#666", marginBottom: 16 },

  aboutSection: { width: "100%", marginBottom: 20 },
  aboutTitle: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 4 },
  aboutText: { fontSize: 14, color: "#333", lineHeight: 20 },

  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },

  actionButton: {
    backgroundColor: "#1565C0",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },

  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  analyticsSection: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },

  analyticsTitleContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 8 },
  analyticsTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },

  statItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 20, gap: 12 },
  statTextContainer: { flex: 1 },
  statNumber: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 4 },
  statDescription: { fontSize: 12, color: "#666", lineHeight: 16 },

  // -- Estilos do MODAL --
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', width: '100%', borderRadius: 12, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1565C0' },
  modalBody: { marginBottom: 20 },
  
  labelModal: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subLabel: { fontSize: 14, marginTop: 10, marginBottom: 5, color: '#666' },
  inputModal: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: { backgroundColor: '#eee', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  tagBadgeSelected: { backgroundColor: '#1565C0', borderColor: '#1565C0' },
  tagText: { color: '#555' },
  tagTextSelected: { color: '#fff', fontWeight: 'bold' },

  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btnPrimary: { backgroundColor: '#1565C0', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  btnTextPrimary: { color: '#fff', fontWeight: 'bold' },
  btnSecondary: { paddingHorizontal: 20, paddingVertical: 10 },
  btnTextSecondary: { color: '#666' }
});