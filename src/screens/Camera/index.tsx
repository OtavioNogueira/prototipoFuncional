import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Image, Text, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from "../../styles/colors";
import { styles } from "./styles";

export function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [caption, setCaption] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [zoom, setZoom] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  // Solicitar permissão da câmera automaticamente quando a tela carregar
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  };

  const handleZoomIn = () => {
    setZoom(current => Math.min(current + 0.1, 1));
  };

  const handleZoomOut = () => {
    setZoom(current => Math.max(current - 0.1, 0));
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert('Erro', 'Câmera não pronta. Tente novamente.');
        return;
      }
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (!photo?.uri) {
        Alert.alert('Erro', 'Não foi possível obter a foto capturada.');
        return;
      }
      setPhotoUri(photo.uri);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const savePhoto = async () => {
    if (!photoUri) return;
    try {
      // Criar objeto da foto com dados
      const novaFoto = {
        id: Date.now().toString(),
        uri: photoUri, // Salva a URI temporária da câmera
        legenda: caption,
        data: new Date().toLocaleDateString('pt-BR')
      };

      // Salvar no AsyncStorage
      const fotosJson = await AsyncStorage.getItem('@fotos');
      const fotos = fotosJson ? JSON.parse(fotosJson) : [];
      fotos.push(novaFoto);
      await AsyncStorage.setItem('@fotos', JSON.stringify(fotos));

      // Navegar para Galeria
      navigation.navigate('Galeria');
      setPhotoUri(null);
      setCaption('');
      Alert.alert('Sucesso', 'Foto salva com sucesso!');
    } catch (e: any) {
      console.error('Erro ao salvar foto:', e);
      Alert.alert('Erro', e.message || 'Falha ao salvar foto.');
    }
  };

  const retakePhoto = () => {
    setPhotoUri(null);
    setCaption('');
  };

  if (!permission) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="camera-outline" size={80} color={colors.primary} style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 18, textAlign: 'center' }}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }
  
  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="camera-outline" size={80} color={colors.primary} style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' }}>
          Acesso à câmera necessário
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 30, textAlign: 'center', color: '#666' }}>
          Precisamos de permissão para acessar sua câmera e tirar fotos
        </Text>
        <TouchableOpacity 
          onPress={requestPermission}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 10,
            elevation: 3
          }}
        >
          <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraArea}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
        ) : (
          <>
            <CameraView
              style={{ flex: 1, width: '100%', borderRadius: 12 }}
              facing={facing}
              flash={flash}
              zoom={zoom}
              ref={cameraRef}
            />
            
            {/* Controles de Zoom (lado direito) */}
            <View style={{
              position: 'absolute',
              right: 20,
              top: '40%',
              flexDirection: 'column',
              gap: 12,
            }}>
              {/* Zoom In */}
              <TouchableOpacity
                onPress={handleZoomIn}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: 10,
                  borderRadius: 25,
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Ionicons name="add" size={24} color={colors.white} />
              </TouchableOpacity>

              {/* Indicador de Zoom */}
              <View style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 15,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                minWidth: 50,
                alignItems: 'center',
              }}>
                <Text style={{ 
                  color: colors.white, 
                  fontSize: 13, 
                  fontWeight: 'bold',
                }}>
                  {(zoom * 10).toFixed(1)}x
                </Text>
              </View>

              {/* Zoom Out */}
              <TouchableOpacity
                onPress={handleZoomOut}
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  padding: 10,
                  borderRadius: 25,
                  width: 44,
                  height: 44,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 5,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                }}
              >
                <Ionicons name="remove" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          </>
        )}
        {photoUri && (
          <View style={{
            position: 'absolute',
            bottom: 120,
            left: 20,
            right: 20,
          }}>
            <TextInput
              placeholder="Adicione uma legenda..."
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: '#333',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                borderWidth: 1,
                borderColor: colors.primary,
              }}
              placeholderTextColor="#999"
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={2}
            />
          </View>
        )}
      </View>
      <View style={[styles.controls, photoUri ? { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 20 } : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
        {photoUri ? (
          <>
            {/* Botão Tirar Outra */}
            <TouchableOpacity 
              onPress={retakePhoto} 
              style={{ 
                backgroundColor: 'rgba(255,255,255,0.9)',
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 25,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                borderWidth: 2,
                borderColor: colors.primary,
                minWidth: 150,
              }}
            >
              <Ionicons name="camera-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 16 }}>Tirar Outra</Text>
            </TouchableOpacity>

            {/* Botão Salvar */}
            <TouchableOpacity
              onPress={savePhoto}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 25,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                minWidth: 150,
              }}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Salvar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Botão Flash (esquerda) */}
            <TouchableOpacity
              onPress={toggleFlash}
              style={{
                backgroundColor: flash === 'on' ? colors.primary : 'rgba(0,0,0,0.6)',
                padding: 12,
                borderRadius: 30,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                marginRight: 20,
              }}
            >
              <Ionicons 
                name={flash === 'on' ? 'flash' : 'flash-off'} 
                size={26} 
                color={colors.white} 
              />
            </TouchableOpacity>

            {/* Botão de Capturar (centro) */}
            <TouchableOpacity
              style={[
                styles.shutterButton,
                {
                  backgroundColor: colors.primary,
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 3,
                },
              ]}
              onPress={takePicture}
            />

            {/* Botão Inverter Câmera (direita) */}
            <TouchableOpacity
              onPress={toggleCameraFacing}
              style={{
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: 12,
                borderRadius: 30,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                marginLeft: 20,
              }}
            >
              <Ionicons name="camera-reverse" size={26} color={colors.white} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}
