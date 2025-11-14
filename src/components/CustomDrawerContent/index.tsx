import React from "react";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";

export function CustomDrawerContent(props: any) {
  // 'Menu' é o nome da Drawer.Screen que contém o BottomTabNavigation
  const parentTabRouteName = "Menu";

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.topArea}>
        <Text style={styles.title}>Galeria de Fotos</Text>
      </View>

      {/* Itens do menu - navegam para a tab específica dentro da screen "Menu" */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => props.navigation.navigate(parentTabRouteName, { screen: "Camera" })}
      >
        <Ionicons name="add-circle" size={20} color={colors.white} />
        <Text style={styles.itemText}>Câmera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => props.navigation.navigate(parentTabRouteName, { screen: "Galeria" })}
      >
        <Ionicons name="images" size={20} color={colors.white} />
        <Text style={styles.itemText}>Galeria</Text>
      </TouchableOpacity>

      {/* Espaço flexível */}
      <View style={{ flex: 1 }} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  topArea: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  itemText: {
    color: colors.white,
    fontSize: 18,
    marginLeft: 14,
  },
});
