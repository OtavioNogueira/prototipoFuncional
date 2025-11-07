import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, TouchableOpacity, Image, Text, Alert } from "react-native";
import * as ExpoCamera from "expo-camera";
// also try named import — some bundlers expose the Camera as a named export
import { Camera as NamedCamera } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { styles } from "./styles";

export function CameraScreen({ navigation }: any) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [caption, setCaption] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const [devices, setDevices] = useState<any[] | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [showDebug, setShowDebug] = useState(false);


  useEffect(() => {
    (async () => {
      // Request camera permission then enumerate devices
      const requestFn = (ExpoCamera as any).requestCameraPermissionsAsync || (ExpoCamera as any).requestPermissionsAsync || ((ExpoCamera as any).Camera && (ExpoCamera as any).Camera.requestCameraPermissionsAsync);
      let granted = false;
      try {
        if (typeof requestFn === 'function') {
          const { status } = await requestFn.call(ExpoCamera);
          granted = status === 'granted';
          setHasPermission(granted);
        } else {
          // fallback: try Camera.requestCameraPermissionsAsync
          const CameraModule = (ExpoCamera as any).Camera || ExpoCamera;
          if (CameraModule && typeof CameraModule.requestCameraPermissionsAsync === 'function') {
            const { status } = await CameraModule.requestCameraPermissionsAsync();
            granted = status === 'granted';
            setHasPermission(granted);
          } else {
            // assume granted
            granted = true;
            setHasPermission(true);
          }
        }
      } catch (err) {
        // if permission request failed, assume not granted
        granted = false;
        setHasPermission(false);
      }

      if (!granted) return;

      // Now that permission is granted, try to enumerate available camera devices (newer expo-camera API)
      try {
        const tryFns = [
          (ExpoCamera as any).getAvailableCameraDevicesAsync,
          (ExpoCamera as any).Camera && (ExpoCamera as any).Camera.getAvailableCameraDevicesAsync,
          (ExpoCamera as any).getAvailableCameraTypesAsync,
          (ExpoCamera as any).Camera && (ExpoCamera as any).Camera.getAvailableCameraTypesAsync,
        ];

        for (const fn of tryFns) {
          if (typeof fn === 'function') {
            const res = await fn.call(ExpoCamera);
            // normalize types: if res is an array of strings (types), convert to objects
            if (Array.isArray(res) && res.length > 0 && typeof res[0] === 'string') {
              const normalized = res.map((t: string, idx: number) => ({ id: String(idx), position: t }));
              setDevices(normalized);
              return;
            }
            if (Array.isArray(res)) {
              setDevices(res);
              return;
            }
          }
        }
      } catch (err) {
        // ignore enumeration errors
      }
    })();
  }, []);

  const enumerateDevices = async () => {
    try {
      const tryFns = [
        (ExpoCamera as any).getAvailableCameraDevicesAsync,
        (ExpoCamera as any).Camera && (ExpoCamera as any).Camera.getAvailableCameraDevicesAsync,
        (ExpoCamera as any).getAvailableCameraTypesAsync,
        (ExpoCamera as any).Camera && (ExpoCamera as any).Camera.getAvailableCameraTypesAsync,
      ];

      for (const fn of tryFns) {
        if (typeof fn === 'function') {
          const res = await fn.call(ExpoCamera);
          if (Array.isArray(res) && res.length > 0 && typeof res[0] === 'string') {
            const normalized = res.map((t: string, idx: number) => ({ id: String(idx), position: t }));
            setDevices(normalized);
            return;
          }
          if (Array.isArray(res)) {
            setDevices(res);
            return;
          }
        }
      }
      setDevices(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('enumerateDevices failed', err);
      setDevices(null);
    }
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) {
        // eslint-disable-next-line no-console
        console.log('takePicture: cameraRef.current is null or undefined');
        Alert.alert('Erro', 'Câmera não pronta. Tente novamente.');
        return;
      }

      if (!cameraReady) {
        Alert.alert('Atenção', 'A câmera ainda não está pronta. Aguarde alguns instantes e tente novamente.');
        return;
      }

      // diagnostic: list available methods on the ref
      // eslint-disable-next-line no-console
      console.log('takePicture: cameraRef.current methods:', Object.keys(cameraRef.current));

      const tryMethods = ['takePictureAsync', 'takePhotoAsync', 'takePhoto', 'takePicture', 'capture'];
      const candidateRefs: any[] = [cameraRef.current, cameraRef.current._cameraRef, cameraRef.current._cameraRef && cameraRef.current._cameraRef.current, cameraRef.current._cameraRef && cameraRef.current._cameraRef._cameraRef, cameraRef.current._cameraRef && cameraRef.current._cameraRef._lastEvents];

      let photo: any = null;
      for (const ref of candidateRefs) {
        if (!ref) continue;
        for (const m of tryMethods) {
          if (typeof ref[m] === 'function') {
            try {
              const result = await ref[m]({ quality: 0.7 } as any);
              photo = result;
              break;
            } catch (err) {
              try {
                const result = await ref[m]();
                photo = result;
                break;
              } catch (err2) {
                // eslint-disable-next-line no-console
                console.log(`method ${m} on nested ref failed:`, err2);
              }
            }
          }
        }
        if (photo) break;
      }

      if (!photo) {
        // eslint-disable-next-line no-console
        console.log('takePicture: no capture method succeeded on any nested ref');
        Alert.alert('Erro', 'Não foi possível tirar a foto.');
        return;
      }

      // result may be an object with uri/path or a string
      const uri = photo.uri || photo.path || (typeof photo === 'string' ? photo : undefined);
      if (!uri) {
        // eslint-disable-next-line no-console
        console.log('takePicture: capture result missing uri:', photo);
        Alert.alert('Erro', 'Não foi possível obter a foto capturada.');
        return;
      }

      setPhotoUri(uri);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('takePicture: unexpected error', e);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    }
  };

  const savePhoto = () => {
    if (!photoUri) return;
    const newPhoto = {
      id: Date.now().toString(),
      uri: photoUri,
      legenda: caption,
      data: new Date().toLocaleDateString(),
      local: ''
    };
    // navigate to Galeria and pass the new photo
    navigation.navigate('Galeria', { newPhoto });
  };

  const retakePhoto = () => {
    // clear current photo and caption so user can take a new one
    setPhotoUri(null);
    setCaption('');
  };

  const handleToggleCamera = () => {
    setType((t: any) => {
      const next = t === 'back' ? 'front' : 'back';
      // eslint-disable-next-line no-console
      console.log('Switching camera to', next);
      return next;
    });
    // force camera preview reset if there was a photo
    setPhotoUri(null);
    setCameraReady(false);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permissão...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>Sem acesso à câmera. Ative nas configurações.</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Camera area or preview */}
      <View style={styles.cameraArea}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', height: '100%', borderRadius: 12 }} />
        ) : (
          (() => {
            // Resolve runtime Camera component whether expo-camera exports a namespace or a direct component
            // Prefer ExpoCamera.CameraView first (observed as a function), then named Camera, then other fallbacks
            const CameraModule: any = (ExpoCamera as any).CameraView || NamedCamera || (ExpoCamera as any).Camera || (ExpoCamera as any).default || ExpoCamera;

            const ResolvedCamera: any = CameraModule;

            // Map local string states to expo enums when available
            const CameraTypeEnum = (ExpoCamera as any).CameraType || (CameraModule && CameraModule.Constants && CameraModule.Constants.Type) || undefined;
            const FlashModeEnum = (ExpoCamera as any).FlashMode || (CameraModule && CameraModule.Constants && CameraModule.Constants.FlashMode) || undefined;

            const cameraTypeProp = CameraTypeEnum ? (type === 'back' ? CameraTypeEnum.back : CameraTypeEnum.front) : (type as any);
            const flashModeProp = FlashModeEnum ? (flash === 'off' ? FlashModeEnum.off : flash === 'on' ? FlashModeEnum.on : FlashModeEnum.auto) : (flash as any);

            // If the resolved camera is CameraView (newer API), it expects a `device` prop rather than `type`.
            const isCameraView = (ExpoCamera as any).CameraView && ResolvedCamera === (ExpoCamera as any).CameraView;
            let deviceToUse: any = null;
            if (isCameraView && devices && devices.length > 0) {
              // try to find a device matching requested position
              deviceToUse = devices.find(d => (d.position || d.cameraPosition || d.deviceType) === (type === 'back' ? 'back' : 'front')) || devices[0];
            }

            const cameraProps: any = { style: { flex: 1, width: '100%', borderRadius: 12 }, type: cameraTypeProp, flashMode: flashModeProp, ref: cameraRef, onCameraReady: () => setCameraReady(true), onMountError: (e: any) => { console.log('Camera mount error', e); } };

            // Only render if the resolved value is a function (component/class). If it's an object module, show fallback.
            if (typeof ResolvedCamera === 'function') {
              if (isCameraView) {
                // CameraView prefers a `device` prop (newer API). If we found a device, use it.
                if (deviceToUse) {
                  return <ResolvedCamera key={String(deviceToUse.id || cameraTypeProp)} device={deviceToUse} style={cameraProps.style} ref={cameraRef} onCameraReady={cameraProps.onCameraReady} onMountError={cameraProps.onMountError} />;
                }

                // If we couldn't enumerate devices, try a pragmatic fallback: render CameraView with `type`/`flashMode` props
                // Some versions of CameraView accept `type` as a compatibility prop.
                try {
                  // eslint-disable-next-line no-console
                  console.log('CameraView: no devices enumerated, attempting fallback render with type/flashMode');
                  return <ResolvedCamera key={String(cameraTypeProp)} {...cameraProps} type={cameraTypeProp} flashMode={flashModeProp} ref={cameraRef} />;
                } catch (err) {
                  // eslint-disable-next-line no-console
                  console.log('CameraView fallback failed:', err);
                  // no device info available and fallback failed: show friendly message
                  return (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                      <Text style={{ color: colors.primary, textAlign: 'center' }}>Dispositivo de câmera não detectado.</Text>
                      <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Tente reiniciar o app ou testar em um dispositivo real.</Text>
                    </View>
                  );
                }
              }

              // Force remount when camera type changes by using key
              return <ResolvedCamera key={String(cameraTypeProp)} {...cameraProps} />;
            }

            return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <Text style={{ color: colors.primary, textAlign: 'center' }}>Componente Camera não disponível neste ambiente.</Text>
                <Text style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Verifique a versão do `expo-camera` e reinicie o bundler.</Text>
              </View>
            );
          })()
        )}

        <TextInput
          placeholder="Sua legenda..."
          style={styles.captionInput}
          placeholderTextColor={colors.primary}
          value={caption}
          onChangeText={setCaption}
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Disable flash toggle for front camera (many devices don't support hardware flash on front) */}
        {type === 'front' ? (
          <View style={{ opacity: 0.4 }}>
            <Ionicons name={flash === 'off' ? 'flash-off' : 'flash'} size={28} color={colors.primary} />
          </View>
        ) : (
          <TouchableOpacity onPress={() => setFlash((f: any) => f === 'off' ? 'on' : 'off')}>
            <Ionicons name={flash === 'off' ? 'flash-off' : 'flash'} size={28} color={colors.primary} />
          </TouchableOpacity>
        )}

        {photoUri ? (
          <>
            <TouchableOpacity style={styles.shutterButton} onPress={savePhoto}>
              <Text style={{ color: colors.white }}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={retakePhoto} style={{ marginLeft: 12, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#fff' }}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Tirar outra</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.shutterButton} onPress={takePicture} />
        )}

        <TouchableOpacity onPress={handleToggleCamera}>
          <Ionicons name="camera-reverse" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}