# Prova - Aplicativo de Galeria de Fotos

Aplicativo mobile simples para capturar e gerenciar fotos localmente.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** (vem junto com Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Expo Go** instalado no celular:
  - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Verificar instalações:
```bash
node --version
npm --version
git --version
```

## 🚀 Como executar o projeto

### 1. Clone o repositório
```bash
git clone https://github.com/Alanakcb/MobileVivi.git
cd MobileVivi
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Instale o AsyncStorage (necessário)
```bash
npm install @react-native-async-storage/async-storage
```

### 4. Inicie o servidor de desenvolvimento
```bash
npx expo start
```

### 5. Abra no seu celular
- **Android**: Abra o app **Expo Go** e escaneie o QR code que aparece no terminal
- **iOS**: Abra a **Câmera** nativa do iPhone e aponte para o QR code

**⚠️ Importante:** Seu celular precisa estar na **mesma rede Wi-Fi** que o computador!

## 📱 Funcionalidades

- 📷 **Câmera**: Capture fotos com zoom, flash e troca de câmera
- 🖼️ **Galeria**: Visualize todas as fotos salvas localmente
- ✏️ **Legendas**: Adicione e edite legendas nas fotos
- 🗑️ **Exclusão**: Remova fotos indesejadas
- 💾 **Armazenamento Local**: Todas as fotos ficam salvas no dispositivo (AsyncStorage)

## 🎨 Tecnologias Utilizadas

- **React Native** com Expo
- **TypeScript**
- **React Navigation** (Drawer + Bottom Tabs)
- **Expo Camera**
- **AsyncStorage** (armazenamento local)
- **Expo Vector Icons**

## 📂 Estrutura do Projeto

```
MobileVivi/
├── src/
│   ├── screens/
│   │   ├── Camera/      # Tela de captura de fotos
│   │   └── Galeria/     # Tela de galeria
│   ├── navigations/     # Configuração de navegação
│   ├── components/      # Componentes reutilizáveis
│   └── styles/          # Cores e estilos globais
├── app.json             # Configuração do Expo
├── package.json         # Dependências do projeto
└── tsconfig.json        # Configuração TypeScript
```

## 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run android    # Abre no emulador Android
npm run ios        # Abre no simulador iOS (apenas Mac)
npm run web        # Abre no navegador
```

## 📝 Notas Importantes

- O app funciona **100% offline** após instalado
- As fotos são armazenadas localmente no dispositivo
- Não requer cadastro ou login
- Não necessita de backend ou banco de dados externo

## 🐛 Problemas Comuns

### O QR code não funciona
- Verifique se o celular está na mesma rede Wi-Fi
- Tente fechar e reabrir o Expo Go
- Execute: `npx expo start -c` (limpa o cache)

### Erro de módulo não encontrado
```bash
npm install
npx expo start -c
```

### Erro de permissão da câmera
- Certifique-se de permitir o acesso à câmera quando o app solicitar

## 👤 Autor

Desenvolvido por Otávio

## 📄 Licença

Este projeto é privado.
