import React, { useEffect } from 'react';
import { StatusBar, LogBox, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Routes from './navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Provider as PaperProvider } from 'react-native-paper'; // 👈 IMPORTANTE

import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

import { AuthProvider } from './context/authContext';

export default function App() {
  useEffect(() => {
    LogBox.ignoreLogs([
      'Text strings must be rendered within a <Text> component.',
      'VirtualizedLists should never be nested inside plain ScrollViews with the same orientation',
      'Erro ao finalizar cadastro',
      'Erro ao salvar dados',
      'Erro ao verificar username',
      'Nenhum comentário encontrado no banco para esse usuário.',
      '[expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.'
    ]);

    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setButtonStyleAsync('light');
        await SystemUI.setBackgroundColorAsync('#1a94f8ff');
      } catch (error) {
        console.warn('Erro ao configurar NavigationBar:', error);
      }
    };

    configureNavigationBar();
  }, []);

  return (
    <AuthProvider> {/* Literalmente o essencial para n ficar que nem um jamanta sem context */}
      <PaperProvider> {/* 👈 OBRIGATÓRIO PARA O MODAL FUNCIONAR */}
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar
              backgroundColor="transparent"
              translucent={true}
              barStyle="dark-content"
            />
            <Routes />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
