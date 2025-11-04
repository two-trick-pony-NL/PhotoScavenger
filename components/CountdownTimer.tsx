import { Text, View, StyleSheet } from 'react-native';
import { useGameStore } from '@/stores/GameStore';

export function CountdownTimer() {
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const status = useGameStore((state) => state.status);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {status === 'pre_round' ? 'Get ready:' : 'Time left:'} {timeRemaining}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  text: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
