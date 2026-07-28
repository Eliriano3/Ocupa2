/**
 * Punto de entrada de Ocupa2.
 *
 * Orden de los proveedores:
 *   SafeAreaProvider → AuthProvider (restaura la sesión) → RootNavigator
 *     (elige el menú público o el privado).
 */

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from '@/navigation';
import { AuthProvider } from '@/store';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
