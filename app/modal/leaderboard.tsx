import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { PlayerScore, useGameStore } from '@/stores/GameStore';

const START_URL = 'https://photoscavenger-backend-service.2ps1g1wgs1ndj.eu-central-1.cs.amazonlightsail.com/start_round/';


type Props = {
  leaderboard: PlayerScore[];
  onClose: () => void;
  currentUser: string;
};

export default function LeaderboardModal({ leaderboard, onClose, currentUser }: Props) {
  const status = useGameStore((s) => s.status);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const roundStats = useGameStore((s) => s.roundStats);
  const [countdown, setCountdown] = useState<number | null>(null);

  const sorted = [...leaderboard].sort((a, b) => b.points - a.points);
  const userIndex = sorted.findIndex((p) => p.name === currentUser);

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
    try {
      await fetch(START_URL, { method: 'POST' });
    } catch (err) {
      console.error('Failed to start next round:', err);
    } finally {
      onClose(); // always close, success or fail
    }
  };

  return (
    <View style={styles.container}>

      <View style={{ alignItems: 'center' }}>
        <Image source={require('@/assets/icon.png')} style={{ width: 50, height: 50, marginBottom: 40, borderRadius: 10 }} />
      </View>
            {/* User rank banner */}


      {/* Round stats banner */}
      <View style={styles.statsBanner}>
        <Text style={styles.statsTitle}>Round Stats</Text>
              {userIndex !== -1 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>You rank #{userIndex + 1} on the leaderboard</Text>
        </View>
      )}
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Score:</Text>
          <Text style={styles.statsValue}>{roundStats.correctPhotos * 10} Points</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Captured Objects:</Text>
          <Text style={styles.statsValue}>{roundStats.correctPhotos}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Accuracy:</Text>
          <Text style={styles.statsValue}>
            {roundStats.photosTaken > 0 ? `${Math.round((roundStats.correctPhotos / roundStats.photosTaken) * 100)}%` : '0%'}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsLabel}>Rounds Played:</Text>
          <Text style={styles.statsValue}>{roundStats.roundsPlayed}</Text>
        </View>
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
        <TouchableOpacity style={styles.button} onPress={handleStartNextRound}>
          <Text style={styles.buttonText}>
            {countdown !== null && countdown > 0 ? 'Start next round' : 'Join Next Round'}
          </Text>
        </TouchableOpacity>
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
  banner: { backgroundColor: '#d90827', padding: 10, borderRadius: 8, marginBottom: 10 },
  bannerText: { fontWeight: 'bold', textAlign: 'center', fontSize: 16, color:'#ffffff' },
  statsBanner: { backgroundColor: '#f0f0f0', padding: 10, borderRadius: 8, marginBottom: 15 },
  statsText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  statsBanner: {
  backgroundColor: '#000', // black background
  padding: 16,
  borderRadius: 12,
  marginBottom: 15,
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  elevation: 4,
},
statsTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#fff', // white text
  textAlign: 'center',
  marginBottom: 12,
},
statsRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginVertical: 4,
},
statsLabel: { color: '#fff', fontSize: 16, fontWeight: '600' },
statsValue: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' }, // red for emphasis

});
