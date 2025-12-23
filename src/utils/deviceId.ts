import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = 'hearmeoutcake_device_id';

let cachedDeviceId: string | null = null;

// Generate a UUID using expo-crypto
function generateUUID(): string {
  const randomBytes = Crypto.getRandomBytes(16);
  const hex = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  // Format as UUID v4
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${(parseInt(hex.slice(16, 17), 16) & 0x3 | 0x8).toString(16)}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    const storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (storedId) {
      cachedDeviceId = storedId;
      return storedId;
    }
  } catch (error) {
    console.warn('Failed to read device ID from storage:', error);
  }

  // Generate new ID
  const newId = generateUUID();
  cachedDeviceId = newId;

  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
  } catch (error) {
    console.warn('Failed to save device ID to storage:', error);
  }

  return newId;
}
