import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = '@nucleus/access-token';
const REFRESH_TOKEN_KEY = '@nucleus/refresh-token';

export const clearAuthTokens = async () => {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};
