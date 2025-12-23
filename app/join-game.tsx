import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card } from '@/components/ui';
import { colors } from '@/theme';
import { GAME_CONFIG } from '@/utils/constants';
import { validateRoomCode } from '@/utils/roomCode';
import { roomService } from '@/services/roomService';
import { useGameStore } from '@/store/gameStore';

export default function JoinGameScreen() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(GAME_CONFIG.ROOM_CODE_LENGTH).fill(''));
  const [isJoining, setIsJoining] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const playerId = useGameStore((state) => state.playerId);
  const setRoom = useGameStore((state) => state.setRoom);
  const setIsHost = useGameStore((state) => state.setIsHost);
  const setPhase = useGameStore((state) => state.setPhase);

  const fullCode = code.join('');

  const handleCodeChange = (text: string, index: number) => {
    const char = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1);
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    // Move to next input
    if (char && index < GAME_CONFIG.ROOM_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleJoinGame = async () => {
    if (!validateRoomCode(fullCode)) {
      Alert.alert('Invalid Code', 'Please enter a valid 6-character room code.');
      return;
    }

    if (!playerId) {
      Alert.alert('Error', 'Player ID not initialized. Please restart the app.');
      return;
    }

    setIsJoining(true);

    try {
      const room = await roomService.joinRoom(fullCode, playerId);
      setRoom(room);
      setIsHost(false);
      setPhase('ready');
      router.replace('/waiting-room');
    } catch (error) {
      console.error('Failed to join room:', error);
      const message = error instanceof Error ? error.message : 'Failed to join game';
      Alert.alert('Error', message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Join Game</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.label}>Enter Room Code</Text>
          <Text style={styles.hint}>
            Ask your friend for the 6-character code
          </Text>

          {/* Code Input */}
          <View style={styles.codeInputContainer}>
            {code.map((char, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  char && styles.codeInputFilled,
                ]}
                value={char}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                maxLength={1}
                autoCapitalize="characters"
                keyboardType="default"
                textContentType="oneTimeCode"
              />
            ))}
          </View>
        </Card>

        <View style={styles.footer}>
          <Button
            title="Join Game"
            onPress={handleJoinGame}
            variant="secondary"
            size="lg"
            fullWidth
            loading={isJoining}
            disabled={fullCode.length !== GAME_CONFIG.ROOM_CODE_LENGTH}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.dark,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral.dark,
  },
  hint: {
    fontSize: 14,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
  codeInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  codeInput: {
    width: 48,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.pastel.lavender,
    backgroundColor: colors.neutral.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.neutral.dark,
  },
  codeInputFilled: {
    borderColor: colors.purple.DEFAULT,
    backgroundColor: colors.pastel.lavender,
  },
  footer: {
    marginTop: 32,
  },
});
