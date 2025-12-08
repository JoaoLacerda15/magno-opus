import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function MainLayout({ children }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingBottom: 50, 
  },
});
