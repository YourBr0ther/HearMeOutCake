import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'hearmeoutcake_device_id';

let cachedDeviceId: string | null = null;

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
  const newId = uuidv4();
  cachedDeviceId = newId;

  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
  } catch (error) {
    console.warn('Failed to save device ID to storage:', error);
  }

  return newId;
}
