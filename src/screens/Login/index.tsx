import React from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { styles } from "./styles";
import { ComponentButtonInterface } from "../../components";
import { LoginTypes } from "../../navigations/LoginStackNavigation";
import { useAuth } from "../../context/auth";
import { signIn, getUser } from '../../services/supabaseAuth';

export function LoginScreen({ navigation }: LoginTypes) {
  const { setLogin } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    try {
      setLoading(true);
      const { error, data } = await signIn(email, password);
      if (error || !data?.user) {
        setError(error?.message || "Usuário ou senha inválidos.");
        setLoading(false);
        return;
      }
      setLoading(false);
      setLogin(true);
    } catch (e: any) {
      setError(e.message || "Erro ao fazer login.");
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.container}>
        {/* Header Verde */}
        <View style={styles.header}>
          <Image
            source={require("../../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>
            <Text style={styles.logoBold}>VIVI</Text>MAP{"\n"}
            <Text style={styles.subTitle}>DIÁRIO DIGITAL</Text>
          </Text>
        </View>

        {/* Área Branca com Formulário */}
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Email"
            style={styles.input}
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Senha"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
          ) : null}

          {/* Botão Entrar */}
          <ComponentButtonInterface
            title={loading ? "Entrando..." : "Entrar"}
            type="primary"
            onPress={handleLogin}
            disabled={loading}
          />

          {/* Botão Google */}
          <TouchableOpacity style={styles.googleButton} disabled={loading}>
            <Text style={styles.googleText}>Entrar com Google</Text>
          </TouchableOpacity>

          {/* Links */}
          <TouchableOpacity disabled={loading}>
            <Text style={styles.link}>Esqueceu a senha?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
            <Text style={styles.link}>Primeiro acesso</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
