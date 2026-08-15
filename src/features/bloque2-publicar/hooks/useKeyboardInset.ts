/**
 * Alto que ocupa el teclado sobre el contenido, en Android.
 *
 * Por qué existe: `<Screen />` envuelve todo en un `KeyboardAvoidingView` con
 * `behavior` solo en iOS (ver `src/components/Screen.tsx`), porque en Android
 * la ventana se encogía sola con `adjustResize`. Desde que React Native fuerza
 * el modo *edge-to-edge*, esa reducción ya no pasa y el teclado termina encima
 * del campo que se está escribiendo.
 *
 * Este hook mide el teclado a mano para que la pantalla se pueda encoger igual.
 * En iOS devuelve 0: ahí `<Screen />` ya hace su trabajo y sumar otro
 * desplazamiento movería el contenido el doble.
 *
 *   const inset = useKeyboardInset();
 *   <View style={{ flex: 1, marginBottom: inset }}>…</View>
 */

import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useKeyboardInset(): number {
  const [height, setHeight] = useState(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // En Android `keyboardDidShow` es el único que reporta el alto real.
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      setHeight(event.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (height === 0) return 0;

  // El alto del teclado incluye la barra de navegación del sistema, que
  // `<Screen />` ya está respetando con su safe area: descontarla evita dejar
  // una franja vacía debajo del pie.
  return Math.max(0, height - insets.bottom);
}
