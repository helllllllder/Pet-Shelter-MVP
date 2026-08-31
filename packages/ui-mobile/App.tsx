import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { AppShell } from "./src/components/AppShell";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <AppShell />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
