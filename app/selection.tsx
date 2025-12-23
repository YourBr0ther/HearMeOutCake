import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Timer, ProgressBar } from '@/components/ui';
import { colors } from '@/theme';
import { GAME_CONFIG } from '@/utils/constants';
import { roomService } from '@/services/roomService';
import { useGameStore } from '@/store/gameStore';
import { useSelectionStore } from '@/store/selectionStore';
import type { GameRoom } from '@/types/game';

export default function SelectionScreen() {
  const router = useRouter();
  const room = useGameStore((state) => state.room);
  const isHost = useGameStore((state) => state.isHost);
  const playerId = useGameStore((state) => state.playerId);
  const setRoom = useGameStore((state) => state.setRoom);
  const setPhase = useGameStore((state) => state.setPhase);
  const setHasSubmitted = useGameStore((state) => state.setHasSubmitted);
  const setOpponentSubmitted = useGameStore((state) => state.setOpponentSubmitted);

  const timeRemaining = useSelectionStore((state) => state.timeRemaining);
  const selectedFlags = useSelectionStore((state) => state.selectedFlags);
  const decrementTime = useSelectionStore((state) => state.decrementTime);
  const addFlag = useSelectionStore((state) => state.addFlag);
  const removeFlag = useSelectionStore((state) => state.removeFlag);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedLocal, setHasSubmittedLocal] = useState(false);

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const subscription = roomService.subscribeToRoom(room.id, (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);

      const opponentSubmitted = isHost
        ? updatedRoom.guest_submitted
        : updatedRoom.host_submitted;
      setOpponentSubmitted(opponentSubmitted);

      // Check if both players have submitted
      if (updatedRoom.host_submitted && updatedRoom.guest_submitted) {
        setPhase('revealing');
        router.replace('/reveal');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [room?.id, isHost, setRoom, setOpponentSubmitted, setPhase, router]);

  const handlePickFromLibrary = async () => {
    if (selectedFlags.length >= GAME_CONFIG.MAX_FLAGS) {
      Alert.alert('Limit Reached', `You can only select ${GAME_CONFIG.MAX_FLAGS} images.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      addFlag({
        id: `library-${Date.now()}`,
        imageUrl: asset.uri,
        thumbnailUrl: asset.uri,
        source: 'library',
      });
    }
  };

  const handleTakePhoto = async () => {
    if (selectedFlags.length >= GAME_CONFIG.MAX_FLAGS) {
      Alert.alert('Limit Reached', `You can only select ${GAME_CONFIG.MAX_FLAGS} images.`);
      return;
    }

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Camera access is needed to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      addFlag({
        id: `camera-${Date.now()}`,
        imageUrl: asset.uri,
        thumbnailUrl: asset.uri,
        source: 'camera',
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedFlags.length === 0) {
      Alert.alert('No Flags', 'Please select at least one image.');
      return;
    }

    if (!room?.id || !playerId) {
      Alert.alert('Error', 'Room or player not found.');
      return;
    }

    setIsSubmitting(true);

    try {
      const flagsToSubmit = selectedFlags.map((flag) => ({
        imageUrl: flag.imageUrl,
        thumbnailUrl: flag.thumbnailUrl,
        source: flag.source,
      }));

      await roomService.submitFlags(room.id, playerId, isHost, flagsToSubmit);
      setHasSubmitted(true);
      setHasSubmittedLocal(true);
    } catch (error) {
      console.error('Failed to submit flags:', error);
      Alert.alert('Error', 'Failed to submit flags. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimerTick = () => {
    decrementTime();
    if (timeRemaining <= 1 && !hasSubmittedLocal) {
      handleSubmit();
    }
  };

  const renderSelectedFlag = ({ item, index }: { item: typeof selectedFlags[0]; index: number }) => (
    <View style={styles.selectedFlagContainer}>
      <Image source={{ uri: item.thumbnailUrl }} style={styles.selectedFlagImage} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFlag(item.id)}
      >
        <Ionicons name="close" size={16} color={colors.neutral.white} />
      </TouchableOpacity>
      <View style={styles.flagNumber}>
        <Text style={styles.flagNumberText}>{index + 1}</Text>
      </View>
    </View>
  );

  if (hasSubmittedLocal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.waitingContainer}>
          <Text style={styles.waitingEmoji}>⏳</Text>
          <Text style={styles.waitingTitle}>Flags Submitted!</Text>
          <Text style={styles.waitingText}>
            Waiting for the other player to finish...
          </Text>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Timer */}
      <View style={styles.header}>
        <View style={styles.themeContainer}>
          <Text style={styles.themeLabel}>Theme:</Text>
          <Text style={styles.themeText} numberOfLines={2}>
            {room?.theme}
          </Text>
        </View>
        <Timer seconds={timeRemaining} onTick={handleTimerTick} size="md" />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <Text style={styles.progressLabel}>Select {GAME_CONFIG.MAX_FLAGS} images for your flags</Text>
        <ProgressBar current={selectedFlags.length} total={GAME_CONFIG.MAX_FLAGS} />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
          <View style={[styles.actionIcon, { backgroundColor: colors.pastel.peach }]}>
            <Ionicons name="camera" size={32} color={colors.orange.DEFAULT} />
          </View>
          <Text style={styles.actionText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handlePickFromLibrary}>
          <View style={[styles.actionIcon, { backgroundColor: colors.pastel.lavender }]}>
            <Ionicons name="images" size={32} color={colors.purple.DEFAULT} />
          </View>
          <Text style={styles.actionText}>Photo Library</Text>
        </TouchableOpacity>
      </View>

      {/* Selected Flags Grid */}
      <View style={styles.selectedSection}>
        <Text style={styles.selectedTitle}>Your Flags</Text>
        {selectedFlags.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={48} color={colors.neutral.gray} />
            <Text style={styles.emptyText}>
              Take photos or pick from your library{'\n'}to add flags to the cake!
            </Text>
          </View>
        ) : (
          <FlatList
            data={selectedFlags}
            renderItem={renderSelectedFlag}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.selectedGrid}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            selectedFlags.length === 0 && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={selectedFlags.length === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={colors.neutral.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.neutral.white} />
              <Text style={styles.submitButtonText}>
                Done ({selectedFlags.length}/{GAME_CONFIG.MAX_FLAGS})
              </Text>
            </>
          )}
        </TouchableOpacity>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  themeContainer: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 12,
    color: colors.neutral.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.dark,
    marginTop: 4,
  },
  progress: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.neutral.gray,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.neutral.white,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.dark,
  },
  selectedSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.dark,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.neutral.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  selectedGrid: {
    gap: 12,
  },
  selectedFlagContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
  },
  selectedFlagImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.pink.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagNumber: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderBottomWidth: 4,
    borderBottomColor: colors.primary.dark,
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral.gray,
    borderBottomColor: '#666',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.white,
    textTransform: 'uppercase',
  },
  waitingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  waitingEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral.dark,
    marginBottom: 8,
  },
  waitingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
});
