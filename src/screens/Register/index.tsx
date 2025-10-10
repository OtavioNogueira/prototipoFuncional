import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  Platform
} from "react-native";
import { MockUserRepository } from '../../core/infra/repositories/MockUserRepository';
import { Name } from '../../core/domain/value-objects/Name';
import { Email } from '../../core/domain/value-objects/Email';
import { Password } from '../../core/domain/value-objects/Password';
import { User } from '../../core/domain/entities/User';
import { styles } from "./styles";
import { ComponentButtonInterface } from "../../components";
import { LoginTypes } from "../../navigations/LoginStackNavigation";

export function RegisterScreen({ navigation }: LoginTypes) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!name || !email || !username || !password || !confirmPassword) {
      setError("Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    try {
      setLoading(true);
      const nameVO = new Name(name);
      const emailVO = new Email(email);
      const passwordVO = new Password(password);
      const id = Date.now().toString();
      const user = User.create(id, nameVO, emailVO, passwordVO);
      const repo = MockUserRepository.getInstance();
      const exists = await repo.findByEmail(email);
      if (exists) {
        setError("Usuário já cadastrado com este email.");
        setLoading(false);
        return;
      }
      await repo.save(user);
      setLoading(false);
      navigation.navigate("Login");
    } catch (e: any) {
      setError(e.message || "Erro ao cadastrar usuário.");
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
            placeholder="Nome completo"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Nome de usuário"
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Criar senha"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            placeholder="Confirmar senha"
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? (
            <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
          ) : null}

          {/* Botão Cadastrar */}
          <ComponentButtonInterface
            title={loading ? "Cadastrando..." : "Cadastrar"}
            type="primary"
            onPress={handleRegister}
            disabled={loading}
          />

          {/* Link Voltar */}
          <TouchableOpacity onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Text style={styles.link}>Possuo cadastro &gt;</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
