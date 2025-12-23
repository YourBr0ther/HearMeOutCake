import { GAME_CONFIG } from './constants';

const CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars (0, O, 1, I)

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < GAME_CONFIG.ROOM_CODE_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
    code += CHARACTERS[randomIndex];
  }
  return code;
}

export function validateRoomCode(code: string): boolean {
  if (!code || code.length !== GAME_CONFIG.ROOM_CODE_LENGTH) {
    return false;
  }
  const upperCode = code.toUpperCase();
  return [...upperCode].every((char) => CHARACTERS.includes(char));
}

export function formatRoomCode(code: string): string {
  return code.toUpperCase().slice(0, GAME_CONFIG.ROOM_CODE_LENGTH);
}
