import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Badge } from '@/components/ui';
import { colors } from '@/theme';
import { roomService } from '@/services/roomService';
import { useGameStore } from '@/store/gameStore';
import type { GameRoom } from '@/types/game';

export default function WaitingRoomScreen() {
  const router = useRouter();
  const room = useGameStore((state) => state.room);
  const isHost = useGameStore((state) => state.isHost);
  const isReady = useGameStore((state) => state.isReady);
  const opponentReady = useGameStore((state) => state.opponentReady);
  const setRoom = useGameStore((state) => state.setRoom);
  const setReady = useGameStore((state) => state.setReady);
  const setOpponentReady = useGameStore((state) => state.setOpponentReady);
  const setPhase = useGameStore((state) => state.setPhase);
  const reset = useGameStore((state) => state.reset);

  const hasOpponent = room?.guest_id !== null;
  const bothReady = isReady && opponentReady;

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const subscription = roomService.subscribeToRoom(room.id, (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);

      // Update opponent ready state
      const opponentReadyState = isHost ? updatedRoom.guest_ready : updatedRoom.host_ready;
      setOpponentReady(opponentReadyState);

      // Check if both players are ready to start
      if (updatedRoom.host_ready && updatedRoom.guest_ready) {
        setPhase('selecting');
        router.replace('/selection');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [room?.id, isHost, setRoom, setOpponentReady, setPhase, router]);

  const handleToggleReady = async () => {
    if (!room?.id) return;

    try {
      if (isReady) {
        await roomService.setPlayerUnready(room.id, isHost);
        setReady(false);
      } else {
        await roomService.setPlayerReady(room.id, isHost);
        setReady(true);
      }
    } catch (error) {
      console.error('Failed to toggle ready:', error);
      Alert.alert('Error', 'Failed to update ready status');
    }
  };

  const handleLeaveRoom = async () => {
    Alert.alert(
      'Leave Game',
      isHost ? 'This will end the game for everyone.' : 'Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            if (room?.id) {
              await roomService.leaveRoom(room.id, isHost);
            }
            reset();
            router.replace('/');
          },
        },
      ]
    );
  };

  if (!room) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.neutral.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Waiting Room</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Room Code */}
        <Card variant="elevated" style={styles.codeCard}>
          <Text style={styles.codeLabel}>Room Code</Text>
          <Badge code={room.code} copyable />
          <Text style={styles.codeHint}>Share this code with your friend</Text>
        </Card>

        {/* Theme */}
        <Card style={styles.themeCard}>
          <Text style={styles.themeLabel}>Theme</Text>
          <Text style={styles.themeText}>{room.theme}</Text>
        </Card>

        {/* Players */}
        <View style={styles.playersSection}>
          <Text style={styles.sectionTitle}>Players</Text>

          {/* Player 1 (Host) */}
          <View style={styles.playerRow}>
            <View style={[styles.playerAvatar, { backgroundColor: colors.player.host }]}>
              <Text style={styles.playerAvatarText}>P1</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                Player 1 {isHost && '(You)'}
              </Text>
              <Text style={styles.playerRole}>Host</Text>
            </View>
            {(isHost ? isReady : room.host_ready) && (
              <View style={styles.readyBadge}>
                <Ionicons name="checkmark" size={16} color={colors.neutral.white} />
                <Text style={styles.readyText}>Ready</Text>
              </View>
            )}
          </View>

          {/* Player 2 (Guest) */}
          <View style={styles.playerRow}>
            <View style={[styles.playerAvatar, { backgroundColor: hasOpponent ? colors.player.guest : colors.neutral.gray }]}>
              <Text style={styles.playerAvatarText}>{hasOpponent ? 'P2' : '?'}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {hasOpponent ? `Player 2 ${!isHost ? '(You)' : ''}` : 'Waiting for player...'}
              </Text>
              {hasOpponent && <Text style={styles.playerRole}>Guest</Text>}
            </View>
            {hasOpponent && (!isHost ? isReady : room.guest_ready) && (
              <View style={[styles.readyBadge, { backgroundColor: colors.purple.DEFAULT }]}>
                <Ionicons name="checkmark" size={16} color={colors.neutral.white} />
                <Text style={styles.readyText}>Ready</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Ready Button */}
      <View style={styles.footer}>
        {hasOpponent ? (
          <Button
            title={isReady ? 'Not Ready' : "I'm Ready!"}
            onPress={handleToggleReady}
            variant={isReady ? 'outline' : 'primary'}
            size="lg"
            fullWidth
          />
        ) : (
          <Text style={styles.waitingText}>
            Waiting for another player to join...
          </Text>
        )}
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
    gap: 20,
  },
  codeCard: {
    alignItems: 'center',
    gap: 12,
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeHint: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  themeCard: {
    gap: 8,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.dark,
  },
  playersSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  playerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral.white,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.dark,
  },
  playerRole: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  readyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
  },
  waitingText: {
    fontSize: 16,
    color: colors.neutral.gray,
    textAlign: 'center',
  },
});
