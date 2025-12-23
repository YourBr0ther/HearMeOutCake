import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Timer, ProgressBar, Card } from '@/components/ui';
import { colors } from '@/theme';
import { GAME_CONFIG } from '@/utils/constants';
import { imageSearchService } from '@/services/imageSearchService';
import { roomService } from '@/services/roomService';
import { useGameStore } from '@/store/gameStore';
import { useSelectionStore } from '@/store/selectionStore';
import type { ImageSearchResult, GameRoom } from '@/types/game';

type Tab = 'search' | 'camera' | 'library';

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
  const searchQuery = useSelectionStore((state) => state.searchQuery);
  const searchResults = useSelectionStore((state) => state.searchResults);
  const isSearching = useSelectionStore((state) => state.isSearching);
  const activeTab = useSelectionStore((state) => state.activeTab);
  const decrementTime = useSelectionStore((state) => state.decrementTime);
  const addFlag = useSelectionStore((state) => state.addFlag);
  const removeFlag = useSelectionStore((state) => state.removeFlag);
  const setSearchQuery = useSelectionStore((state) => state.setSearchQuery);
  const setSearchResults = useSelectionStore((state) => state.setSearchResults);
  const setIsSearching = useSelectionStore((state) => state.setIsSearching);
  const setActiveTab = useSelectionStore((state) => state.setActiveTab);
  const resetSelection = useSelectionStore((state) => state.reset);

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Search for images with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      const results = await imageSearchService.search(searchQuery);
      setSearchResults(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setSearchResults, setIsSearching]);

  const handleSelectImage = (image: ImageSearchResult) => {
    const added = addFlag({
      id: image.id,
      imageUrl: image.url,
      thumbnailUrl: image.thumbnailUrl,
      source: 'search',
    });

    if (!added && selectedFlags.length >= GAME_CONFIG.MAX_FLAGS) {
      Alert.alert('Limit Reached', `You can only select ${GAME_CONFIG.MAX_FLAGS} images.`);
    }
  };

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const added = addFlag({
        id: `library-${Date.now()}`,
        imageUrl: asset.uri,
        thumbnailUrl: asset.uri,
        source: 'library',
      });

      if (!added && selectedFlags.length >= GAME_CONFIG.MAX_FLAGS) {
        Alert.alert('Limit Reached', `You can only select ${GAME_CONFIG.MAX_FLAGS} images.`);
      }
    }
  };

  const handleTakePhoto = async () => {
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
      const added = addFlag({
        id: `camera-${Date.now()}`,
        imageUrl: asset.uri,
        thumbnailUrl: asset.uri,
        source: 'camera',
      });

      if (!added && selectedFlags.length >= GAME_CONFIG.MAX_FLAGS) {
        Alert.alert('Limit Reached', `You can only select ${GAME_CONFIG.MAX_FLAGS} images.`);
      }
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
    } catch (error) {
      console.error('Failed to submit flags:', error);
      Alert.alert('Error', 'Failed to submit flags. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimerTick = useCallback(() => {
    decrementTime();
    if (timeRemaining <= 1) {
      handleSubmit();
    }
  }, [decrementTime, timeRemaining]);

  const renderImageItem = ({ item }: { item: ImageSearchResult }) => {
    const isSelected = selectedFlags.some((f) => f.id === item.id);

    return (
      <TouchableOpacity
        style={[styles.imageItem, isSelected && styles.imageItemSelected]}
        onPress={() => handleSelectImage(item)}
        disabled={isSelected}
      >
        <Image source={{ uri: item.thumbnailUrl }} style={styles.image} />
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <Ionicons name="checkmark-circle" size={32} color={colors.primary.DEFAULT} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Timer */}
      <View style={styles.header}>
        <View style={styles.themeContainer}>
          <Text style={styles.themeLabel}>Theme:</Text>
          <Text style={styles.themeText} numberOfLines={1}>
            {room?.theme}
          </Text>
        </View>
        <Timer seconds={timeRemaining} onTick={handleTimerTick} size="sm" />
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        <ProgressBar current={selectedFlags.length} total={GAME_CONFIG.MAX_FLAGS} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.tabActive]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons
            name="search"
            size={20}
            color={activeTab === 'search' ? colors.primary.DEFAULT : colors.neutral.gray}
          />
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'camera' && styles.tabActive]}
          onPress={() => {
            setActiveTab('camera');
            handleTakePhoto();
          }}
        >
          <Ionicons
            name="camera"
            size={20}
            color={activeTab === 'camera' ? colors.primary.DEFAULT : colors.neutral.gray}
          />
          <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>
            Camera
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'library' && styles.tabActive]}
          onPress={() => {
            setActiveTab('library');
            handlePickFromLibrary();
          }}
        >
          <Ionicons
            name="images"
            size={20}
            color={activeTab === 'library' ? colors.primary.DEFAULT : colors.neutral.gray}
          />
          <Text style={[styles.tabText, activeTab === 'library' && styles.tabTextActive]}>
            Photos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      {activeTab === 'search' && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.neutral.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for images..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.neutral.gray}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.neutral.gray} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Image Grid */}
      <View style={styles.gridContainer}>
        {isSearching ? (
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={styles.loader} />
        ) : searchResults.length > 0 ? (
          <FlatList
            data={searchResults}
            renderItem={renderImageItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          />
        ) : searchQuery.length > 0 ? (
          <Text style={styles.emptyText}>No images found. Try a different search.</Text>
        ) : (
          <Text style={styles.emptyText}>
            Search for images or use camera/photos to add flags!
          </Text>
        )}
      </View>

      {/* Selected Flags Dock */}
      <View style={styles.dock}>
        <View style={styles.dockFlags}>
          {Array.from({ length: GAME_CONFIG.MAX_FLAGS }).map((_, index) => {
            const flag = selectedFlags[index];
            return (
              <View key={index} style={styles.dockSlot}>
                {flag ? (
                  <TouchableOpacity
                    style={styles.dockFlag}
                    onPress={() => removeFlag(flag.id)}
                  >
                    <Image source={{ uri: flag.thumbnailUrl }} style={styles.dockFlagImage} />
                    <View style={styles.removeButton}>
                      <Ionicons name="close" size={12} color={colors.neutral.white} />
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.dockSlotEmpty}>
                    <Text style={styles.dockSlotNumber}>{index + 1}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
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
            <Ionicons name="checkmark" size={24} color={colors.neutral.white} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  themeContainer: {
    flex: 1,
    marginRight: 12,
  },
  themeLabel: {
    fontSize: 12,
    color: colors.neutral.gray,
  },
  themeText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.dark,
  },
  progress: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.neutral.white,
    gap: 6,
  },
  tabActive: {
    backgroundColor: colors.pastel.mint,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.neutral.gray,
  },
  tabTextActive: {
    color: colors.primary.DEFAULT,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.neutral.dark,
  },
  gridContainer: {
    flex: 1,
    paddingTop: 12,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  imageItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.neutral.white,
  },
  imageItemSelected: {
    opacity: 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.neutral.gray,
    paddingHorizontal: 32,
    marginTop: 40,
    fontSize: 16,
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.pastel.mint,
    gap: 12,
  },
  dockFlags: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  dockSlot: {
    flex: 1,
    aspectRatio: 1,
  },
  dockFlag: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dockFlagImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.pink.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockSlotEmpty: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.pastel.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockSlotNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral.gray,
  },
  submitButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral.gray,
    opacity: 0.5,
  },
});
