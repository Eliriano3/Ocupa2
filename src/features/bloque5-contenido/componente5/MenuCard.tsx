/*
 * ----- TARJETA DE MENÚ -----
 * Componente plantilla reutilizable para mostrar accesos a las diferentes secciones de la aplicación.
 * Incluye un icono, título y acción al presionar.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '@/theme';

interface MenuCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
}

export default function MenuCard({
  icon,
  title,
  onPress,
}: MenuCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={40}
          color={colors.primary}
        />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    height: 150,

    backgroundColor: colors.surface,

    borderRadius: radius.lg,

    justifyContent: 'center',
    alignItems: 'center',

    padding: spacing.md,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,

    elevation: 4,
  },

  pressed: {
    opacity: 0.75,
    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  iconContainer: {
    marginBottom: spacing.sm,
  },

  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,

    textAlign: 'center',
  },
});