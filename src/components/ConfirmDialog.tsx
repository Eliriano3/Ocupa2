/**
 * Diálogo de confirmación y de aviso, con la misma apariencia en Android, iOS
 * y web.
 *
 * No uses `Alert.alert` con botones: no está implementado en react-native-web,
 * así que en el navegador la acción parece muerta. Los diálogos del navegador
 * (`window.confirm`) tampoco sirven, porque algunos entornos los bloquean.
 *
 * Confirmación (dos botones):
 *
 *   const [visible, setVisible] = useState(false);
 *   …
 *   <AppButton title="Cerrar sesión" onPress={() => setVisible(true)} />
 *   <ConfirmDialog
 *     visible={visible}
 *     title="Cerrar sesión"
 *     message="¿Seguro que quieres salir de tu cuenta?"
 *     confirmLabel="Cerrar sesión"
 *     destructive
 *     onConfirm={() => { setVisible(false); void logout(); }}
 *     onCancel={() => setVisible(false)}
 *   />
 *
 * Aviso (un solo botón): omite `onCancel`.
 */

import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '@/theme';
import { AppButton } from './AppButton';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Texto del botón principal. Por defecto "Aceptar". */
  confirmLabel?: string;
  /** Texto del botón de cancelar. Por defecto "Cancelar". */
  cancelLabel?: string;
  /** Pinta el botón principal en rojo, para acciones que no se deshacen. */
  destructive?: boolean;
  onConfirm: () => void;
  /** Si no lo pasas, el diálogo es un aviso con un solo botón. */
  onCancel?: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dismiss = onCancel ?? onConfirm;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // Botón atrás de Android.
      onRequestClose={dismiss}
    >
      {/* Tocar fuera del cuadro cierra el diálogo. */}
      <Pressable style={styles.backdrop} onPress={dismiss}>
        {/* Frena el toque para que tocar el cuadro no lo cierre. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            {onCancel ? (
              <AppButton
                title={cancelLabel}
                variant="secondary"
                onPress={onCancel}
                fullWidth={false}
                style={styles.action}
              />
            ) : null}
            <AppButton
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              fullWidth={false}
              style={styles.action}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 33, 47, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  action: {
    minWidth: 120,
  },
});
