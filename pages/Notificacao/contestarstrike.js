import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Modal, TextInput } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { popupStyles } from '../../components/popup';
import * as ImagePicker from "expo-image-picker";

export default function ContestarStrike() {
    const [exitModalVisible, setExitModalVisible] = useState(false);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [contestText, setContestText] = useState("");
    const [selectedImages, setSelectedImages] = useState([]); // <--- ALTERADO

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });
        if (!result.canceled) {
            setSelectedImages(prev => [...prev, result.assets[0].uri]); // <--- ALTERADO
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <View style={styles.appBar}>
                <Text style={styles.appBarText}>Strike</Text>
            </View>

            {/* POPUP COM CAIXA DE TEXTO */}
            <Modal visible={exitModalVisible} transparent animationType="fade">
                <View style={popupStyles.centeredView}>
                    <View style={popupStyles.modalView}>
                        <Text style={popupStyles.modalText}>Explique o motivo da contestação:</Text>

                        <TextInput
                            style={styles.inputBox}
                            placeholder="Digite aqui..."
                            placeholderTextColor="#777"
                            value={contestText}
                            onChangeText={setContestText}
                            multiline
                        />

                        {/* EXIBIR MÚLTIPLAS IMAGENS */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                            {selectedImages.map((img, index) => (
                                <View key={index} style={{ marginRight: 10, position: "relative" }}>
                                    <Image source={{ uri: img }} style={styles.previewImage} />

                                    {/* BOTÃO REMOVER */}
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() =>
                                            setSelectedImages(prev => prev.filter((_, i) => i !== index))
                                        }
                                    >
                                        <Ionicons name="close-circle" size={24} color="red" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>

                        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                            <Text style={styles.imageButtonText}>Anexar Imagem</Text>
                        </TouchableOpacity>

                        <View style={popupStyles.modalButtons}>
                            <TouchableOpacity
                                style={[popupStyles.modalButton, popupStyles.noButton]}
                                onPress={() => setExitModalVisible(false)}
                            >
                                <Text style={popupStyles.noButtonText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[popupStyles.modalButton, popupStyles.yesButton]}
                                onPress={() => {
                                    console.log("Contestação enviada:", contestText, selectedImages);

                                    // Limpar campos
                                    setContestText("");
                                    setSelectedImages([]); // <--- ALTERADO

                                    setExitModalVisible(false);
                                    setSuccessModalVisible(true);
                                }}
                            >
                                <Text style={popupStyles.yesButtonText}>Enviar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* POPUP DE CONFIRMAÇÃO */}
            <Modal visible={successModalVisible} transparent animationType="fade">
                <View style={popupStyles.centeredView}>
                    <View style={popupStyles.modalView}>
                        <Text style={popupStyles.modalText}>Mensagem enviada com sucesso!</Text>

                        <TouchableOpacity
                            style={[popupStyles.modalButton, popupStyles.yesButton]}
                            onPress={() => setSuccessModalVisible(false)}
                        >
                            <Text style={popupStyles.yesButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                <View style={styles.card}>
                    <Image source={require("../../assets/profile.png")} style={styles.avatar} />
                    <Text style={styles.title}>Denunciante</Text>
                    <Text style={styles.subtitle}>Joana Silva</Text>

                    <Text style={styles.title}>Profissional</Text>
                    <Text style={styles.subtitle}>Carlos Souza</Text>

                    <Text style={styles.title}>Serviço</Text>
                    <Text style={styles.subtitle}>Limpeza Residencial</Text>

                    <Text style={styles.details}>Data: 08/06/2025</Text>
                    <Text style={styles.details}>Hora: 09:00</Text>
                    <Text style={styles.details}>Local: Rua das Flores, 123</Text>

                    <Text style={styles.title}>Motivo</Text>
                    <Text style={styles.justify}>
                        O profissional não compareceu ao serviço agendado sem aviso prévio,
                        causando transtornos ao cliente.
                    </Text>

                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: "red" }]}
                            onPress={() => setExitModalVisible(true)}
                        >
                            <Text style={styles.buttonText}>Contestar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

// ---- Estilos ----
const styles = StyleSheet.create({
    appBar: {
        backgroundColor: "#fff",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    appBarText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "red",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 3 },
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignSelf: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 10,
    },
    subtitle: {
        fontSize: 16,
    },
    details: {
        fontSize: 14,
        marginTop: 4,
    },
    justify: {
        fontSize: 14,
        marginTop: 8,
        textAlign: "justify",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginTop: 20,
    },
    button: {
        padding: 12,
        borderRadius: 8,
        minWidth: 120,
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    inputBox: {
        width: "100%",
        minHeight: 80,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        marginTop: 10,
        marginBottom: 15,
        textAlignVertical: "top",
    },
    imageButton: {
        backgroundColor: "#555",
        padding: 10,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 15,
    },
    imageButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    previewImage: {
        width: 120,
        height: 120,
        borderRadius: 8,
    },
    removeImageButton: {
        position: "absolute",
        top: -8,
        right: -8,
        backgroundColor: "#fff",
        borderRadius: 20,
    },
});
