import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getDeviceId } from '@/utils/deviceId';
import { useGameStore } from '@/store/gameStore';
import { colors } from '@/theme';
import '../global.css';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const setPlayerId = useGameStore((state) => state.setPlayerId);

  useEffect(() => {
    // Initialize device ID on app start
    const initDeviceId = async () => {
      const deviceId = await getDeviceId();
      setPlayerId(deviceId);
      setIsLoading(false);
    };
    initDeviceId();
  }, [setPlayerId]);

  if (isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.pastel.mint }}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FAFAFA' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="create-game" />
          <Stack.Screen name="join-game" />
          <Stack.Screen name="waiting-room" />
          <Stack.Screen name="selection" />
          <Stack.Screen name="reveal" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
