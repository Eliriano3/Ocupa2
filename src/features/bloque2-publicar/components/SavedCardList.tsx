/**
 * Lista de tarjetas recordadas, arriba del formulario de pago.
 *
 * Muestra solo la marca y los cuatro últimos dígitos: el número completo nunca
 * se pinta en pantalla. Al elegir una se rellenan número y vencimiento, pero el
 * CVV siempre se pide a mano.
 *
 *   <SavedCardList
 *     cards={cards}
 *     selectedId={selected}
 *     onSelect={usarTarjeta}
 *     onRemove={olvidarTarjeta}
 *     onUseAnother={() => setSelected(null)}
 *   />
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '@/theme';
import { TOUCH_TARGET } from '../constants';
import { isExpired, type SavedCard } from '../services/savedCards';

export interface SavedCardListProps {
  cards: SavedCard[];
  /** Id de la tarjeta en uso, o `null` si se está escribiendo una nueva. */
  selectedId: string | null;
  onSelect: (card: SavedCard) => void;
  onRemove: (card: SavedCard) => void;
  /** Vuelve al formulario en blanco. */
  onUseAnother: () => void;
  disabled?: boolean;
}

export function SavedCardList({
  cards,
  selectedId,
  onSelect,
  onRemove,
  onUseAnother,
  disabled = false,
}: SavedCardListProps) {
  if (cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tus tarjetas</Text>

      {cards.map((card) => {
        const selected = card.id === selectedId;
        const expired = isExpired(card);

        return (
          <Pressable
            key={card.id}
            disabled={disabled || expired}
            onPress={() => onSelect(card)}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled: disabled || expired }}
            accessibilityLabel={`${card.brand} terminada en ${card.last4}${
              expired ? ', vencida' : ''
            }`}
            style={[styles.card, selected && styles.cardSelected, expired && styles.faded]}
          >
            <Ionicons
              name={selected ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={selected ? colors.primary : colors.disabled}
            />

            <View style={styles.text}>
              <Text style={styles.number}>
                {card.brand} ···· {card.last4}
              </Text>
              <Text style={[styles.meta, expired && styles.metaExpired]}>
                {expired ? 'Vencida' : `Vence ${pad(card.expMonth)}/${`${card.expYear}`.slice(-2)}`}
                {card.cardholder ? ` · ${card.cardholder}` : ''}
              </Text>
            </View>

            <Pressable
              onPress={() => onRemove(card)}
              disabled={disabled}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Olvidar la tarjeta terminada en ${card.last4}`}
              style={styles.remove}
            >
              <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </Pressable>
          </Pressable>
        );
      })}

      <Pressable
        disabled={disabled}
        onPress={onUseAnother}
        accessibilityRole="radio"
        accessibilityState={{ selected: selectedId === null, disabled }}
        style={[styles.card, selectedId === null && styles.cardSelected]}
      >
        <Ionicons
          name={selectedId === null ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={selectedId === null ? colors.primary : colors.disabled}
        />
        <Text style={styles.another}>Usar otra tarjeta</Text>
      </Pressable>
    </View>
  );
}

function pad(value: number): string {
  return `${value}`.padStart(2, '0');
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  card: {
    minHeight: TOUCH_TARGET + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  faded: {
    opacity: 0.6,
  },
  text: {
    flex: 1,
  },
  number: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  meta: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  metaExpired: {
    color: colors.danger,
  },
  remove: {
    width: TOUCH_TARGET - 12,
    height: TOUCH_TARGET - 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  another: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
});
