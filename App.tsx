import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts as useOutfit,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  useFonts as useLora,
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme';

const FontLoader = () => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface.base,
    }}
  >
    <ActivityIndicator size="large" color={theme.colors.brand.primary} />
  </View>
);

export default function App() {
  const [outfitLoaded] = useOutfit({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const [loraLoaded] = useLora({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
  });

  const fontsReady = outfitLoaded && loraLoaded;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {fontsReady ? (
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      ) : (
        <FontLoader />
      )}
    </SafeAreaProvider>
  );
}
