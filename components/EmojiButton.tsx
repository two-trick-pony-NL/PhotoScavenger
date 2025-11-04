import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useGameStore } from '@/stores/GameStore';

type Props = { emoji: string; onPress: () => void };

export function EmojiButton({ emoji, onPress }: Props) {
  const state = useGameStore((s) => s.emojiStates[emoji] || 'idle');

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={state !== 'idle'}
      style={[styles.button, state === 'locked' && styles.locked]}
    >
      <Text style={styles.text}>{emoji}</Text>
      {state === 'uploading' && <Text style={styles.uploading}>⏳</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, marginHorizontal: 8 },
  text: { fontSize: 24 },
  uploading: { position: 'absolute', top: 0, right: 0, fontSize: 16 },
  locked: { opacity: 0.5 },
});
