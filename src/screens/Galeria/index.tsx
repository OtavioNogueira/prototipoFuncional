import React, { useState } from "react";
import { View, Text, Image, FlatList, Dimensions, Modal, TouchableOpacity, TextInput } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { styles } from "./styles";
export function GaleriaScreen() {
  const [fotos, setFotos] = useState([
    { id: '1', uri: 'https://picsum.photos/id/1015/200/200', legenda: 'Esse dia foi realmente mágico de um jeito inexplicável! Estou ansioso para a próxima viagem. Não tenho o que dizer, são só elogios.', data: '08/09/2025', local: 'Praia Grande, SP' },
    { id: '2', uri: 'https://picsum.photos/id/1016/200/200', legenda: '', data: '10/09/2025', local: 'Rio de Janeiro, RJ' },
    { id: '3', uri: 'https://picsum.photos/id/1018/200/200', legenda: '', data: '12/09/2025', local: 'Florianópolis, SC' },
    { id: '4', uri: 'https://picsum.photos/id/1020/200/200', legenda: '', data: '15/09/2025', local: 'Salvador, BA' },
    { id: '5', uri: 'https://picsum.photos/id/1024/200/200', legenda: '', data: '18/09/2025', local: 'Manaus, AM' },
    { id: '6', uri: 'https://picsum.photos/id/1025/200/200', legenda: '', data: '20/09/2025', local: 'Curitiba, PR' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  type FotoType = { id: string; uri: string; legenda: string; data: string; local: string };
  const [selectedFoto, setSelectedFoto] = useState<null | FotoType>(null);
  const [legendaInput, setLegendaInput] = useState("");

  const numColumns = 2;
  const imageSize = Dimensions.get('window').width / numColumns - 16;

  const handleImagePress = (foto: FotoType) => {
    setSelectedFoto(foto);
    setLegendaInput(foto.legenda || "");
    setModalVisible(true);
  };

  const handleSaveLegenda = () => {
    if (!selectedFoto) return;
    setFotos(fotos.map(f => f.id === selectedFoto.id ? { ...f, legenda: legendaInput } : f));
    setModalVisible(false);
  };

  const handleDeleteLegenda = (id?: string) => {
    if (id) {
      setFotos(fotos.map(f => f.id === id ? { ...f, legenda: "" } : f));
    } else if (selectedFoto) {
      setFotos(fotos.map(f => f.id === selectedFoto.id ? { ...f, legenda: "" } : f));
      setLegendaInput("");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={fotos}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleImagePress(item)}>
            <Image
              source={{ uri: item.uri }}
              style={{ width: imageSize, height: imageSize, borderRadius: 12, margin: 8 }}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ alignItems: 'center' }}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: '#8ED36D', padding: 20, borderRadius: 20, width: '85%', alignItems: 'center', position: 'relative' }}>
            {/* Botão X para fechar */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
              accessibilityLabel="Fechar"
            >
              <Text style={{ fontSize: 22, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
            {selectedFoto && (
              <Image
                source={{ uri: selectedFoto.uri }}
                style={{ width: 220, height: 220, alignSelf: 'center', borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 10 }}
              />
            )}
            {selectedFoto && (
              <View style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Data: <Text style={{ fontWeight: 'normal' }}>{selectedFoto.data}</Text></Text>
                <Text style={{ fontWeight: 'bold' }}>Local: <Text style={{ fontWeight: 'normal' }}>{selectedFoto.local}</Text></Text>
              </View>
            )}
            <TextInput
              placeholder="Digite a legenda..."
              value={legendaInput}
              onChangeText={setLegendaInput}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10, width: '100%', backgroundColor: '#fff' }}
            />
            <TouchableOpacity
              onPress={handleSaveLegenda}
              style={{ backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, marginBottom: 8, width: '100%' }}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Salvar</Text>
            </TouchableOpacity>
            {selectedFoto && selectedFoto.legenda && (
              <TouchableOpacity
                onPress={() => handleDeleteLegenda(selectedFoto.id)}
                style={{ backgroundColor: '#e53935', padding: 10, borderRadius: 8, marginBottom: 8, width: '100%' }}
              >
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Apagar legenda</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}