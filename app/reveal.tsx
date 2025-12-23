import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui';
import { colors } from '@/theme';
import { GAME_CONFIG } from '@/utils/constants';
import { roomService } from '@/services/roomService';
import { useGameStore } from '@/store/gameStore';
import { useSelectionStore } from '@/store/selectionStore';
import type { Flag } from '@/types/game';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RevealScreen() {
  const router = useRouter();
  const room = useGameStore((state) => state.room);
  const isHost = useGameStore((state) => state.isHost);
  const myFlags = useGameStore((state) => state.myFlags);
  const opponentFlags = useGameStore((state) => state.opponentFlags);
  const currentRevealTurn = useGameStore((state) => state.currentRevealTurn);
  const revealedHostFlags = useGameStore((state) => state.revealedHostFlags);
  const revealedGuestFlags = useGameStore((state) => state.revealedGuestFlags);
  const setMyFlags = useGameStore((state) => state.setMyFlags);
  const setOpponentFlags = useGameStore((state) => state.setOpponentFlags);
  const setCurrentRevealTurn = useGameStore((state) => state.setCurrentRevealTurn);
  const revealFlag = useGameStore((state) => state.revealFlag);
  const reset = useGameStore((state) => state.reset);
  const resetSelection = useSelectionStore((state) => state.reset);

  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  // Load flags on mount
  useEffect(() => {
    if (!room?.id) return;

    const loadFlags = async () => {
      const flags = await roomService.getFlags(room.id);
      const hostFlags = flags.filter((f) => f.is_host);
      const guestFlags = flags.filter((f) => !f.is_host);

      if (isHost) {
        setMyFlags(hostFlags);
        setOpponentFlags(guestFlags);
      } else {
        setMyFlags(guestFlags);
        setOpponentFlags(hostFlags);
      }
    };

    loadFlags();

    // Subscribe to flag changes
    const subscription = roomService.subscribeToFlags(room.id, (flags) => {
      const hostFlags = flags.filter((f) => f.is_host);
      const guestFlags = flags.filter((f) => !f.is_host);

      if (isHost) {
        setMyFlags(hostFlags);
        setOpponentFlags(guestFlags);
      } else {
        setMyFlags(guestFlags);
        setOpponentFlags(hostFlags);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [room?.id, isHost, setMyFlags, setOpponentFlags]);

  const isMyTurn = (isHost && currentRevealTurn === 'host') ||
    (!isHost && currentRevealTurn === 'guest');

  const getNextUnrevealedIndex = (flags: Flag[], revealedIndices: number[]) => {
    for (let i = 0; i < flags.length; i++) {
      if (!revealedIndices.includes(i)) {
        return i;
      }
    }
    return -1;
  };

  const gameComplete =
    revealedHostFlags.length >= (isHost ? myFlags : opponentFlags).length &&
    revealedGuestFlags.length >= (isHost ? opponentFlags : myFlags).length;

  const handleRevealNext = async () => {
    if (!isMyTurn || !room?.id) return;

    const nextIndex = getNextUnrevealedIndex(myFlags, isHost ? revealedHostFlags : revealedGuestFlags);

    if (nextIndex === -1) return;

    const flagToReveal = myFlags[nextIndex];

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate modal
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Update local state
    revealFlag(isHost, nextIndex);

    // Update server
    if (flagToReveal) {
      await roomService.revealFlag(flagToReveal.id);
    }

    // Switch turns
    const nextTurn = currentRevealTurn === 'host' ? 'guest' : 'host';
    setCurrentRevealTurn(nextTurn);
    if (room?.id) {
      await roomService.updateRevealTurn(room.id, nextTurn);
    }

    // Show the flag in modal
    setSelectedFlag(flagToReveal);
    setShowModal(true);
  };

  const handlePlayAgain = async () => {
    reset();
    resetSelection();
    router.replace('/');
  };

  const handleExit = () => {
    reset();
    resetSelection();
    router.replace('/');
  };

  const renderFlag = (flag: Flag | undefined, index: number, isHostFlag: boolean) => {
    const revealedFlags = isHostFlag ? revealedHostFlags : revealedGuestFlags;
    const isRevealed = revealedFlags.includes(index);

    return (
      <View key={index} style={styles.flagSlot}>
        <View style={[styles.flagPole, { backgroundColor: isHostFlag ? colors.player.host : colors.player.guest }]} />
        {flag && isRevealed ? (
          <TouchableOpacity
            style={styles.flagContent}
            onPress={() => {
              setSelectedFlag(flag);
              setShowModal(true);
            }}
          >
            <Image source={{ uri: flag.thumbnail_url || flag.image_url }} style={styles.flagImage} />
          </TouchableOpacity>
        ) : (
          <View style={styles.flagHidden}>
            <Text style={styles.flagNumber}>{index + 1}</Text>
          </View>
        )}
      </View>
    );
  };

  const hostFlags = isHost ? myFlags : opponentFlags;
  const guestFlags = isHost ? opponentFlags : myFlags;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>The Cake Reveal</Text>
        <Text style={styles.themeText}>{room?.theme}</Text>
      </View>

      <View style={styles.cakeContainer}>
        {/* Cake Visual */}
        <View style={styles.cake}>
          <View style={styles.cakeFrosting} />
          <View style={styles.cakeBase} />
          <View style={styles.cakePlate} />
        </View>

        {/* Host Flags (Left Side) */}
        <View style={[styles.flagsRow, styles.flagsLeft]}>
          {Array.from({ length: GAME_CONFIG.MAX_FLAGS }).map((_, index) =>
            renderFlag(hostFlags[index], index, true)
          )}
        </View>

        {/* Guest Flags (Right Side) */}
        <View style={[styles.flagsRow, styles.flagsRight]}>
          {Array.from({ length: GAME_CONFIG.MAX_FLAGS }).map((_, index) =>
            renderFlag(guestFlags[index], index, false)
          )}
        </View>
      </View>

      {/* Turn Indicator */}
      <View style={styles.turnContainer}>
        {gameComplete ? (
          <Text style={styles.completeText}>All flags revealed!</Text>
        ) : (
          <Text style={styles.turnText}>
            {isMyTurn ? "Your turn! Reveal a flag" : "Waiting for opponent..."}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        {gameComplete ? (
          <View style={styles.footerButtons}>
            <Button
              title="Play Again"
              onPress={handlePlayAgain}
              variant="primary"
              size="lg"
              fullWidth
            />
            <Button
              title="Exit"
              onPress={handleExit}
              variant="outline"
              size="md"
              fullWidth
            />
          </View>
        ) : isMyTurn ? (
          <Button
            title="Reveal My Flag"
            onPress={handleRevealNext}
            variant="primary"
            size="lg"
            fullWidth
          />
        ) : null}
      </View>

      {/* Flag Detail Modal */}
      <Modal
        visible={showModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            {selectedFlag && (
              <>
                <Image
                  source={{ uri: selectedFlag.image_url }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                <Text style={styles.modalHint}>Tap anywhere to close</Text>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.pastel.cream,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.neutral.dark,
  },
  themeText: {
    fontSize: 14,
    color: colors.neutral.gray,
    marginTop: 4,
  },
  cakeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  cake: {
    alignItems: 'center',
    marginTop: 40,
  },
  cakeFrosting: {
    width: 200,
    height: 60,
    backgroundColor: colors.cake.frosting,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  cakeBase: {
    width: 200,
    height: 80,
    backgroundColor: colors.cake.base,
    marginTop: -10,
  },
  cakePlate: {
    width: 240,
    height: 20,
    backgroundColor: colors.neutral.white,
    borderRadius: 10,
    marginTop: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  flagsRow: {
    position: 'absolute',
    flexDirection: 'column',
    gap: 8,
  },
  flagsLeft: {
    left: 20,
    top: 60,
  },
  flagsRight: {
    right: 20,
    top: 60,
  },
  flagSlot: {
    alignItems: 'center',
  },
  flagPole: {
    width: 4,
    height: 30,
    borderRadius: 2,
  },
  flagContent: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: -5,
    borderWidth: 2,
    borderColor: colors.neutral.white,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  flagHidden: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
    borderWidth: 2,
    borderColor: colors.pastel.mint,
  },
  flagNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral.gray,
  },
  turnContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  turnText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.dark,
  },
  completeText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary.DEFAULT,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  footerButtons: {
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    alignItems: 'center',
    padding: 20,
  },
  modalImage: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    borderRadius: 16,
    backgroundColor: colors.neutral.white,
  },
  modalHint: {
    fontSize: 14,
    color: colors.neutral.white,
    marginTop: 16,
    opacity: 0.7,
  },
});
