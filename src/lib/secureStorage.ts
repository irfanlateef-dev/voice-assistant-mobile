import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'homechef_auth_token';

export async function getItem(key: string = TOKEN_KEY): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

export async function setItem(
  key: string = TOKEN_KEY,
  value: string,
): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore write failed silently
  }
}

export async function removeItem(key: string = TOKEN_KEY): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // SecureStore delete failed silently
  }
}

export { TOKEN_KEY };
