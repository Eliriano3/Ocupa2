/*
* -----ACERCA DE:-----
* Esta pantalla presenta las tarjetas de los integrantes del grupo, 
* incluye los nombres, matricula, fotografía e informacion de contacto.
*/
 
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
 
import { Card, Screen } from '@/components';
import { colors, fontSize, radius, spacing } from '@/theme';
 
// Define las propiedades que debe tener cada integrante del equipo.
interface TeamMember {
  name: string;
  matricula: string;
//Los campos opcionales aceptan null para evitar errores
//  si algún recurso o dato no está disponible.
  photo: ImageSourcePropType | null;

  phone: string | null;
  
  telegram: string | null;
}
//Las tarjetas de datos del equipo
const TEAM: TeamMember[] = [
  {
    name: 'Eduardo Rafael Liriano Báez',
    matricula: '2023-1017',
    photo: require('../assets/team/eduardo.jpeg'),
    phone: '+18498065752',
    telegram: 'eduardoliri',
  },
  {
    name: 'Josué Fondeur Román',
    matricula: '2024-0193',
    photo: require('../assets/team/josue.jpeg'),
    phone: '+18299066991',
    telegram: 'RomanQwert30',
  },
  {
    name: 'Hanier Peguero',
    matricula: '2024-0012',
    photo: require('../assets/team/hanier.jpeg'),
    phone: '+18296457322',
    telegram: '+18296457322',
  },
  {
    name: 'Rosmeris Jiménez De La Cruz',
    matricula: '2024-1779',
    photo: require('../assets/team/rosmeris.jpeg'),
    phone: '+18097503599',
    telegram: 'rosmejc',
  },
  {
    name: 'Katerin Cordero Cubilete',
    matricula: '2024-1575',
    photo: require('../assets/team/katerin.jpg'),
    phone: '+18098753996',
    telegram: 'k35006',
  },
];
 
export default function AboutScreen() {
  return (
    <Screen scroll>
      <Text style={styles.heading}>Acerca de Ocupa2</Text>
      <Text style={styles.subheading}>
        Equipo de desarrollo · Proyecto Final · ITLA - Periodo C2-2026
      </Text>
 
      {TEAM.map((member) => (
        <Card key={member.matricula} style={styles.card}>
          <View style={styles.row}>
            {member.photo ? (
              <Image source={member.photo} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={28} color={colors.disabled} />
              </View>
            )}
 
            <View style={styles.info}>
              <Text style={styles.name}>{member.name}</Text>
              <Text style={styles.matricula}>{member.matricula}</Text>
 
              <View style={styles.actions}>
                {member.phone ? (
                  <ContactAction
                    icon="call-outline"
                    label="Llamar"
                    onPress={() => Linking.openURL(`tel:${member.phone}`)}
                  />
                ) : null}
                {member.telegram ? (
                  <ContactAction
                    icon="paper-plane-outline"
                    label="Telegram"
                    onPress={() => Linking.openURL(`https://t.me/${member.telegram}`)}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}
 
function ContactAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}
 
const styles = StyleSheet.create({
  heading: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  subheading: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  card: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  matricula: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
});
 