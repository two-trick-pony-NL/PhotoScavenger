// components/EmojiButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { EmojiState } from '@/stores/GameStore';

type Props = {
  emoji: string;
  state: EmojiState;
  onPress: () => void;
};

export default function EmojiButton({ emoji, state, onPress }: Props) {
  const isLocked = state === 'locked';
  const isUploading = state === 'uploading';

  return (
    <TouchableOpacity
      style={[styles.emojiButton, isLocked && styles.lockedButton]}
      disabled={isLocked} // only disable if locked
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.emojiButtonText}>{emoji}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  emojiButton: { padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  lockedButton: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center' },
  emojiButtonText: { fontSize: 56 },
  uploading: { marginLeft: 8 },
});
