import { supabase } from './supabase';
import { generateRoomCode } from '@/utils/roomCode';
import type { GameRoom, Flag, GamePhase } from '@/types/game';

export const roomService = {
  async createRoom(theme: string, hostId: string): Promise<GameRoom> {
    const code = generateRoomCode();

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        theme,
        host_id: hostId,
        phase: 'waiting',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      throw new Error('Failed to create room');
    }

    return data as GameRoom;
  },

  async joinRoom(code: string, guestId: string): Promise<GameRoom> {
    // First check if room exists and has space
    const { data: room, error: fetchError } = await supabase
      .from('rooms')
      .select()
      .eq('code', code.toUpperCase())
      .single();

    if (fetchError || !room) {
      throw new Error('Room not found');
    }

    if (room.guest_id) {
      throw new Error('Room is full');
    }

    if (room.host_id === guestId) {
      throw new Error('You cannot join your own room');
    }

    // Join the room
    const { data, error } = await supabase
      .from('rooms')
      .update({ guest_id: guestId, phase: 'ready' })
      .eq('id', room.id)
      .select()
      .single();

    if (error) {
      console.error('Error joining room:', error);
      throw new Error('Failed to join room');
    }

    return data as GameRoom;
  },

  async getRoom(roomId: string): Promise<GameRoom | null> {
    const { data, error } = await supabase
      .from('rooms')
      .select()
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    return data as GameRoom;
  },

  async setPlayerReady(roomId: string, isHost: boolean): Promise<void> {
    const field = isHost ? 'host_ready' : 'guest_ready';

    const { error } = await supabase
      .from('rooms')
      .update({ [field]: true })
      .eq('id', roomId);

    if (error) {
      console.error('Error setting player ready:', error);
      throw new Error('Failed to set ready status');
    }
  },

  async setPlayerUnready(roomId: string, isHost: boolean): Promise<void> {
    const field = isHost ? 'host_ready' : 'guest_ready';

    const { error } = await supabase
      .from('rooms')
      .update({ [field]: false })
      .eq('id', roomId);

    if (error) {
      console.error('Error setting player unready:', error);
      throw new Error('Failed to set unready status');
    }
  },

  async updateRoomPhase(roomId: string, phase: GamePhase): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update({ phase })
      .eq('id', roomId);

    if (error) {
      console.error('Error updating room phase:', error);
      throw new Error('Failed to update room phase');
    }
  },

  async submitFlags(
    roomId: string,
    playerId: string,
    isHost: boolean,
    flags: Array<{ imageUrl: string; thumbnailUrl?: string; source: 'search' | 'camera' | 'library' }>
  ): Promise<void> {
    // Insert flags
    const flagsToInsert = flags.map((flag, index) => ({
      room_id: roomId,
      player_id: playerId,
      is_host: isHost,
      image_url: flag.imageUrl,
      thumbnail_url: flag.thumbnailUrl || null,
      source: flag.source,
      reveal_order: index + 1,
    }));

    const { error: flagsError } = await supabase
      .from('flags')
      .insert(flagsToInsert);

    if (flagsError) {
      console.error('Error inserting flags:', flagsError);
      throw new Error('Failed to submit flags');
    }

    // Mark player as submitted
    const field = isHost ? 'host_submitted' : 'guest_submitted';
    const { error: roomError } = await supabase
      .from('rooms')
      .update({ [field]: true })
      .eq('id', roomId);

    if (roomError) {
      console.error('Error marking submitted:', roomError);
      throw new Error('Failed to mark as submitted');
    }
  },

  async getFlags(roomId: string): Promise<Flag[]> {
    const { data, error } = await supabase
      .from('flags')
      .select()
      .eq('room_id', roomId)
      .order('reveal_order', { ascending: true });

    if (error) {
      console.error('Error fetching flags:', error);
      return [];
    }

    return data as Flag[];
  },

  async revealFlag(flagId: string): Promise<void> {
    const { error } = await supabase
      .from('flags')
      .update({ is_revealed: true })
      .eq('id', flagId);

    if (error) {
      console.error('Error revealing flag:', error);
      throw new Error('Failed to reveal flag');
    }
  },

  async updateRevealTurn(roomId: string, turn: 'host' | 'guest'): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .update({ current_reveal_turn: turn })
      .eq('id', roomId);

    if (error) {
      console.error('Error updating reveal turn:', error);
      throw new Error('Failed to update turn');
    }
  },

  async leaveRoom(roomId: string, isHost: boolean): Promise<void> {
    if (isHost) {
      // If host leaves, delete the room
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Error deleting room:', error);
      }
    } else {
      // If guest leaves, just remove them
      const { error } = await supabase
        .from('rooms')
        .update({ guest_id: null, guest_ready: false, phase: 'waiting' })
        .eq('id', roomId);

      if (error) {
        console.error('Error leaving room:', error);
      }
    }
  },

  subscribeToRoom(roomId: string, callback: (room: GameRoom) => void) {
    return supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as GameRoom);
          }
        }
      )
      .subscribe();
  },

  subscribeToFlags(roomId: string, callback: (flags: Flag[]) => void) {
    return supabase
      .channel(`flags:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flags',
          filter: `room_id=eq.${roomId}`,
        },
        async () => {
          // Fetch all flags when any change occurs
          const flags = await roomService.getFlags(roomId);
          callback(flags);
        }
      )
      .subscribe();
  },
};
