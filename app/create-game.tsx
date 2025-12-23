import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card } from '@/components/ui';
import { colors } from '@/theme';
import { THEME_SUGGESTIONS } from '@/utils/constants';
import { roomService } from '@/services/roomService';
import { useGameStore } from '@/store/gameStore';

export default function CreateGameScreen() {
  const router = useRouter();
  const [theme, setTheme] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const playerId = useGameStore((state) => state.playerId);
  const setRoom = useGameStore((state) => state.setRoom);
  const setIsHost = useGameStore((state) => state.setIsHost);
  const setPhase = useGameStore((state) => state.setPhase);

  const handleCreateGame = async () => {
    if (!theme.trim()) {
      Alert.alert('Theme Required', 'Please enter a theme for your game.');
      return;
    }

    if (!playerId) {
      Alert.alert('Error', 'Player ID not initialized. Please restart the app.');
      return;
    }

    setIsCreating(true);

    try {
      const room = await roomService.createRoom(theme.trim(), playerId);
      setRoom(room);
      setIsHost(true);
      setPhase('waiting');
      router.replace('/waiting-room');
    } catch (error) {
      console.error('Failed to create room:', error);
      Alert.alert('Error', 'Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setTheme(suggestion);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Game</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Theme Input */}
        <Card variant="elevated" style={styles.inputCard}>
          <Text style={styles.label}>What's the theme?</Text>
          <Input
            placeholder="e.g., Crazy person you would marry"
            value={theme}
            onChangeText={setTheme}
            autoCapitalize="sentences"
            returnKeyType="done"
          />
        </Card>

        {/* Theme Suggestions */}
        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>Or try one of these:</Text>
          <View style={styles.suggestionsList}>
            {THEME_SUGGESTIONS.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.suggestionChip,
                  theme === suggestion && styles.suggestionChipActive,
                ]}
                onPress={() => handleSelectSuggestion(suggestion)}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    theme === suggestion && styles.suggestionTextActive,
                  ]}
                >
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <Button
          title="Create Game"
          onPress={handleCreateGame}
          variant="primary"
          size="lg"
          fullWidth
          loading={isCreating}
          disabled={!theme.trim()}
        />
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
  },
  contentContainer: {
    padding: 24,
    gap: 24,
  },
  inputCard: {
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.dark,
  },
  suggestions: {
    gap: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray,
  },
  suggestionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.pastel.mint,
  },
  suggestionChipActive: {
    backgroundColor: colors.pastel.mint,
    borderColor: colors.primary.DEFAULT,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.neutral.dark,
  },
  suggestionTextActive: {
    fontWeight: '600',
    color: colors.primary.dark,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
});
