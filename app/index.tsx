import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function NameEntryPage() {
  const router = useRouter();
  const [name, setName] = useState('');

  const startGame = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('You can not play, without a username', 'How else are we going to list you on the leaderboard?');
      return;
    }
    // Navigate to the game screen using a query param
    router.replace(`/game?username=${encodeURIComponent(trimmed)}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Image source={require('../assets/icon.png')} style={{ width: 100, height: 100, marginBottom: 40, borderRadius: 20 }} />
      <Text style={styles.title}>Tell us your name</Text>
      <TextInput
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
      />
      <TouchableOpacity style={styles.button} onPress={startGame}>
        <Text style={styles.buttonText}>Play PhotoScavenger</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#d90827',
    paddingVertical: 15,
    width: '100%',
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
});
