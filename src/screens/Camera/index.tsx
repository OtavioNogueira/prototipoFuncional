import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Image, Text, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { styles } from "./styles";
import { supabase } from '../../services/supabaseClient';
import { getUser } from '../../services/supabaseAuth';
import { salvarFoto } from '../../services/supabaseFotos';

export function CameraScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [caption, setCaption] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Solicitar permissão da câmera automaticamente quando a tela carregar
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

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
      // 1. Obter usuário autenticado
      const { data: userData } = await getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        Alert.alert('Erro', 'Usuário não autenticado.');
        return;
      }

      // 2. Preparar upload com FormData
      const fileExt = 'jpg';
      const fileName = `${userId}_${Date.now()}.${fileExt}`;

      const formData = new FormData();
      formData.append('file', {
        uri: photoUri,
        name: `photo_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as unknown as Blob);

      // 3. Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(fileName, formData, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        Alert.alert('Erro ao enviar foto', uploadError.message);
        return;
      }

      // 4. Obter URL pública
      const { data: publicUrlData } = supabase.storage
        .from('fotos')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;
      if (!publicUrl) {
        Alert.alert('Erro', 'Não foi possível obter a URL da imagem.');
        return;
      }

      // 5. Salvar a foto e legenda na tabela 'fotos'
      const { error: dbError } = await salvarFoto({
        image_url: publicUrl,
        legenda: caption,
        user_id: userId
      });

      if (dbError) {
        console.error('Erro ao salvar foto no banco:', dbError);
        Alert.alert('Erro', 'Não foi possível salvar a foto no banco de dados');
        return;
      }

      // 6. Navegar para Galeria (ela vai recarregar automaticamente)
      navigation.navigate('Galeria');
      setPhotoUri(null);
      setCaption('');
      Alert.alert('Sucesso', 'Foto salva com sucesso!');
    } catch (e: any) {
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
          <CameraView
            style={{ flex: 1, width: '100%', borderRadius: 12 }}
            facing="back"
            ref={cameraRef}
          />
        )}
        <TextInput
          placeholder="Sua legenda..."
          style={styles.captionInput}
          placeholderTextColor={colors.primary}
          value={caption}
          onChangeText={setCaption}
        />
      </View>
      <View style={[styles.controls, photoUri ? { flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } : {}]}>
        {photoUri ? (
          <View>
            <TouchableOpacity
              style={[
                styles.shutterButton,
                {
                  backgroundColor: colors.primary,
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  alignSelf: 'center',
                  marginBottom: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 3,
                },
              ]}
              onPress={savePhoto}
            >
              <Text style={{ color: colors.white, textAlign: 'center', fontWeight: 'bold' }}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={retakePhoto} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff', alignSelf: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: '600', textAlign: 'center' }}>Tirar outra</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.shutterButton,
              {
                backgroundColor: colors.primary,
                width: 70,
                height: 70,
                borderRadius: 35,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 3,
              },
            ]}
            onPress={takePicture}
          />
        )}
      </View>
    </View>
  );
}
