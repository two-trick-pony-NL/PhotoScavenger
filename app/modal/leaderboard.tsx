import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { PlayerScore, useGameStore } from '@/stores/GameStore';

type Props = {
  leaderboard: PlayerScore[];
  onClose: () => void; // callback to close modal
};

export default function LeaderboardModal({ leaderboard, onClose }: Props) {
  const status = useGameStore((s) => s.status);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Keep countdown synced with store
  useEffect(() => {
    if (status === 'pre_round' || status === 'running') {
      setCountdown(timeRemaining);
      const interval = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
    setCountdown(null);
  }, [status, timeRemaining]);

  const handleStartNextRound = async () => {
    onClose();
    try {
      await fetch('http://192.168.1.213:8000/start_round', { method: 'POST' });
    } catch (err) {
      console.error('Failed to start next round', err);
    }
  };

  const sorted = [...leaderboard].sort((a, b) => b.points - a.points);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center' }}>
        <Image source={require('@/assets/icon.png')} style={{ width: 50, height: 50, marginBottom: 40, borderRadius: 10 }} />
      </View>
      <Text style={styles.title}>Leaderboard</Text>

      {sorted.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#555' }}>No scores yet. Be the first to play!</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.name}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <Text style={styles.rank}>{index + 1}.</Text>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.points}>{item.points}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.bottom}>
        {countdown !== null && countdown > 0 ? (
          <TouchableOpacity style={styles.button} onPress={handleStartNextRound}>
            <Text style={styles.buttonText}>Join Next Round in {countdown}s</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleStartNextRound}>
            <Text style={styles.buttonText}>Join Next Round</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  rank: { fontSize: 18, fontWeight: 'bold', width: 30 },
  name: { fontSize: 18, flex: 1 },
  points: { fontSize: 18, fontWeight: 'bold' },
  bottom: { marginTop: 20, alignItems: 'center' },
  button: { backgroundColor: '#d90827', alignItems: 'center', padding: 24, borderRadius: 12, width: '100%', marginBottom: 75 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  countdown: { fontSize: 18, fontWeight: 'bold' },
});
