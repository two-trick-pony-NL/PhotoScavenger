// components/GameScreen.tsx
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useEffect, useRef, useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Alert, ActivityIndicator, Modal 
} from 'react-native';

import { useGameStore, EmojiState, GameEvent } from '@/stores/GameStore';
import { useGameWS } from '@/hooks/useGameWS';
import LeaderboardModal from '@/app/modal/leaderboard';

const UPLOAD_URL = 'http://192.168.1.213:8000/upload/';
const WEBSOCKET_URL = 'ws://192.168.1.213:8000/ws';

type Props = { username: string };

export default function GameScreen({ username }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Zustand state
  const roundEmojis = useGameStore((s) => s.roundEmojis);
  const emojiStates = useGameStore((s) => s.emojiStates);
  const events = useGameStore((s) => s.events);
  const timeRemaining = useGameStore((s) => s.timeRemaining);
  const status = useGameStore((s) => s.status);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const addEvent = useGameStore((s) => s.addEvent);

  // WebSocket connection
  useGameWS(WEBSOCKET_URL);

  // Initial loading spinner
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Open leaderboard modal automatically on round end
  useEffect(() => {
    if (status === 'ended') setShowLeaderboard(true);
  }, [status]);

  if (!permission) return <View />;
  if (!permission.granted)
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Camera access required</Text>
        <TouchableOpacity style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );


  const takeAndSendPhoto = async (emoji: string) => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 1, base64: false, skipProcessing: true });
      const resized = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 640, height: 640 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const formData = new FormData();
      formData.append('player_id', username);
      formData.append('emoji', emoji);
      formData.append('file', { uri: resized.uri, name: 'photo.jpg', type: 'image/jpeg' } as any);

      await fetch(`${UPLOAD_URL}?player_id=${username}&emoji=${encodeURIComponent(emoji)}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addEvent({ type: 'upload', msg: `${username} sent a photo for ${emoji}` });
    } catch (err) {
      console.error('Upload failed', err);
      Alert.alert('Upload failed', 'Could not send photo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      )}

      {/* Countdown timer */}
      <View style={styles.timer}>
        <Text style={styles.timerText}>
          {status === 'pre_round' ? 'Get ready!' : 'Time left:'} {timeRemaining}s
        </Text>
      </View>

      {/* Event feed */}
      <View style={styles.eventFeed}>
        <FlatList
          data={events}
          renderItem={({ item }: { item: GameEvent }) => (
            <Text style={styles.eventText}>{item.msg}</Text>
          )}
          keyExtractor={(_, idx) => idx.toString()}
        />
      </View>

      {/* Emoji buttons */}
      <View style={styles.bottom}>
        {roundEmojis.map((e) => {
          const state: EmojiState = emojiStates[e] || 'idle';
          return (
            <TouchableOpacity
              key={e}
              style={[styles.emojiButton, state === 'locked' && styles.lockedButton]}
              disabled={state !== 'idle'}
              onPress={() => takeAndSendPhoto(e)}
            >
              <Text style={styles.emojiButtonText}>{e}</Text>
              {state === 'uploading' && <Text style={styles.uploading}>⏳</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Leaderboard modal */}
      <Modal visible={showLeaderboard} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <LeaderboardModal 
            leaderboard={useGameStore.getState().leaderboard.map(([name, points]) => ({ name, points }))} 
            onClose={() => setShowLeaderboard(false)} 

          />
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { color: 'white', marginTop: 10, fontSize: 18 },
  timer: { position: 'absolute', top: 40, alignSelf: 'center', padding: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  timerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  eventFeed: { position: 'absolute', top: 100, left: 20, right: 20, maxHeight: 150 },
  eventText: { color: 'white', fontSize: 14, marginBottom: 2 },
  bottom: { position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'center', gap: 16 },
  emojiButton: { padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  lockedButton: { opacity: 0.5 },
  emojiButtonText: { fontSize: 24 },
  uploading: { position: 'absolute', top: -8, right: -8, fontSize: 16 },
  flipContainer: { position: 'absolute', bottom: 120, alignSelf: 'center' },
  flipButton: { padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  flipText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  message: { textAlign: 'center', fontSize: 18, marginBottom: 20 },
  grantButton: { alignSelf: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12 },
  grantText: { fontWeight: 'bold' },
  leaderboardButton: { position: 'absolute', top: 40, right: 20, padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
  closeModal: { position: 'absolute', top: 60, right: 20, padding: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },
});
