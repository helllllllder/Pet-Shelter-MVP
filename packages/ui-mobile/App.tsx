import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Platform } from "react-native";
import { AppShell } from "./src/components/AppShell";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppShell />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 28) : 0,
  },
});
