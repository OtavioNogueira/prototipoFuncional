import React, { useState, useEffect } from "react";
import { View, Text, Image, FlatList, Dimensions, Modal, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "./styles";

type FotoType = { id: string; uri: string; legenda: string; data: string };

export function GaleriaScreen({ route, navigation }: any) {
  const [fotos, setFotos] = useState<FotoType[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState<null | FotoType>(null);
  const [legendaInput, setLegendaInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Carregar fotos do AsyncStorage quando a tela for focada
  useFocusEffect(
    React.useCallback(() => {
      carregarFotos();
    }, [])
  );

  const carregarFotos = async () => {
    setLoading(true);
    try {
      const fotosJson = await AsyncStorage.getItem('@fotos');
      if (fotosJson) {
        const fotosArray = JSON.parse(fotosJson);
        setFotos(fotosArray);
      }
    } catch (err) {
      console.error('Erro ao carregar fotos:', err);
      Alert.alert('Erro', 'Não foi possível carregar as fotos');
    } finally {
      setLoading(false);
    }
  };

  const numColumns = 2;
  const imageSize = Dimensions.get('window').width / numColumns - 16;

  const handleImagePress = (foto: FotoType) => {
    setSelectedFoto(foto);
    setLegendaInput(foto.legenda || "");
    setModalVisible(true);
  };

  const handleSaveLegenda = async () => {
    if (!selectedFoto) return;
    
    try {
      // Atualizar legenda no AsyncStorage
      const fotosAtualizadas = fotos.map(f => 
        f.id === selectedFoto.id ? { ...f, legenda: legendaInput } : f
      );
      await AsyncStorage.setItem('@fotos', JSON.stringify(fotosAtualizadas));
      
      // Atualizar localmente
      setFotos(fotosAtualizadas);
      Alert.alert('Sucesso', 'Legenda atualizada com sucesso!');
      setModalVisible(false);
    } catch (err) {
      console.error('Erro ao salvar legenda:', err);
      Alert.alert('Erro', 'Não foi possível salvar a legenda');
    }
  };

  const handleDeleteLegenda = async () => {
    if (!selectedFoto) return;
    
    try {
      // Remover legenda no AsyncStorage
      const fotosAtualizadas = fotos.map(f => 
        f.id === selectedFoto.id ? { ...f, legenda: "" } : f
      );
      await AsyncStorage.setItem('@fotos', JSON.stringify(fotosAtualizadas));
      
      // Atualizar localmente
      setFotos(fotosAtualizadas);
      setLegendaInput("");
      Alert.alert('Sucesso', 'Legenda removida!');
    } catch (err) {
      console.error('Erro ao remover legenda:', err);
      Alert.alert('Erro', 'Não foi possível remover a legenda');
    }
  };

  const handleDeleteFoto = async () => {
    if (!selectedFoto) return;
    
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta foto? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Remover da lista local
              const fotosAtualizadas = fotos.filter(f => f.id !== selectedFoto.id);
              await AsyncStorage.setItem('@fotos', JSON.stringify(fotosAtualizadas));
              
              setFotos(fotosAtualizadas);
              setModalVisible(false);
              Alert.alert('Sucesso', 'Foto excluída com sucesso!');
            } catch (err) {
              console.error('Erro ao excluir foto:', err);
              Alert.alert('Erro', 'Não foi possível excluir a foto');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#8ED36D" />
        <Text style={{ marginTop: 10, fontSize: 16 }}>Carregando fotos...</Text>
      </View>
    );
  }

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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 20, width: '90%', maxWidth: 400, overflow: 'hidden', position: 'relative' }}>
            {/* Botão X para fechar */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ 
                position: 'absolute', 
                top: 12, 
                right: 12, 
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 20,
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              accessibilityLabel="Fechar"
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>

            {/* Imagem */}
            {selectedFoto && (
              <Image
                source={{ uri: selectedFoto.uri }}
                style={{ width: '100%', height: 300, backgroundColor: '#f0f0f0' }}
                resizeMode="cover"
              />
            )}

            {/* Conteúdo do modal */}
            <View style={{ padding: 20 }}>
              {/* Data */}
              {selectedFoto && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
                  <Ionicons name="calendar-outline" size={18} color="#666" />
                  <Text style={{ color: '#666', fontSize: 14 }}>{selectedFoto.data}</Text>
                </View>
              )}
            <TextInput
              placeholder="Digite a legenda..."
              placeholderTextColor="#999"
              value={legendaInput}
              onChangeText={setLegendaInput}
              multiline
              numberOfLines={3}
              style={{ 
                borderWidth: 1, 
                borderColor: '#ccc', 
                borderRadius: 8, 
                padding: 10, 
                marginBottom: 12, 
                width: '100%', 
                backgroundColor: '#fff',
                textAlignVertical: 'top',
                minHeight: 80
              }}
            />
            
              {/* Botões de ação */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10 }}>
                {/* Botão Salvar Legenda */}
                <TouchableOpacity
                  onPress={handleSaveLegenda}
                  style={{
                    flex: 1,
                    backgroundColor: '#8ED36D',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4
                  }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Salvar</Text>
                </TouchableOpacity>

                {/* Botão Limpar Legenda */}
                <TouchableOpacity
                  onPress={handleDeleteLegenda}
                  style={{
                    flex: 1,
                    backgroundColor: '#f0f0f0',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#666" />
                  <Text style={{ color: '#666', fontWeight: 'bold' }}>Limpar</Text>
                </TouchableOpacity>
              </View>

              {/* Botão Excluir Foto */}
              <TouchableOpacity
                onPress={handleDeleteFoto}
                style={{
                  marginTop: 12,
                  backgroundColor: '#FF6B6B',
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4
                }}
              >
                <Ionicons name="trash" size={20} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Excluir Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}