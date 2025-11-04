import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { 
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Modal, Animated, Alert
} from 'react-native';
import { useGameStore, EmojiState } from '@/stores/GameStore';
import { useGameWS } from '@/hooks/useGameWS';
import LeaderboardModal from '@/app/modal/leaderboard';
import EventFeed from '@/components/EventFeed';
import { CountdownTimer } from './CountdownTimer';
import ConfettiCannon from 'react-native-confetti-cannon';
import EmojiButton from './EmojiButton';

const API_URL = 'http://192.168.1.213:8000';
const UPLOAD_URL = `${API_URL}/upload/`;
const START_URL = `${API_URL}/start_round/`;
const WEBSOCKET_URL = 'ws://192.168.1.213:8000/ws';

type Props = { username: string };

export default function GameScreen({ username }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [loading, setLoading] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Zustand state
  const roundEmojis = useGameStore((s) => s.roundEmojis);
  const emojiStates = useGameStore((s) => s.emojiStates);
  const events = useGameStore((s) => s.events);
  const status = useGameStore((s) => s.status);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const addEvent = useGameStore((s) => s.addEvent);

  // WebSocket connection
  useGameWS(WEBSOCKET_URL);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === 'ended') setShowLeaderboard(true);
  }, [status]);

  const startGame = async () => {
    try {
      const res = await fetch(START_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: username }),
      });
      if (!res.ok) throw new Error('Failed to start game');
      addEvent({ type: 'system', msg: 'Countdown started!' });
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to start the game. Please try again.');
    }
  };

  const showAnimatedMessage = (text: string, color = 'white', type: 'success' | 'warning' | 'error' | 'default' = 'default') => {
    setFeedback({ text, color });
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      }, 1500);
    });

    // Haptic feedback
    switch(type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const takeAndSendPhoto = async (emoji: string) => {
    if (!cameraRef.current) return;
    try {
      showAnimatedMessage('Uploading...', 'white');

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

      const res = await fetch(`${UPLOAD_URL}?player_id=${username}&emoji=${encodeURIComponent(emoji)}`, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const json = await res.json();

      switch (json.status) {
        case 'success':
          showAnimatedMessage('Correct! First capture!', 'white', 'success');
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          break;
        case 'too_late':
          showAnimatedMessage('Too late!', 'white', 'warning');
          break;
        case 'wrong':
          showAnimatedMessage('Incorrect! Try again!', 'red', 'error');
          break;
        default:
          showAnimatedMessage('Upload failed', 'red', 'error');
      }
    } catch (err) {
      console.error('Upload failed', err);
      showAnimatedMessage('Upload failed', 'red');
    }
  };

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

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      )}

      {/* Animated feedback message */}
      {feedback && (
        <Animated.View style={[styles.feedbackContainer, { opacity: fadeAnim }]}>
          <Text style={[styles.feedbackText, { color: feedback.color }]}>{feedback.text}</Text>
        </Animated.View>
      )}

      {/* Confetti */}
      {showConfetti && <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut />}

      {/* Status / start / late join messages */}
      <View style={styles.statusContainer}>
        {!loading && status === 'idle' && (
          <>
            <Text style={styles.statusText}>Wait for next round to start...</Text>
            <TouchableOpacity style={styles.startButton} onPress={startGame}>
              <Text style={styles.startText}>Start Game</Text>
            </TouchableOpacity>
          </>
        )}
        {!loading && status === 'running' && roundEmojis.length === 0 && (
          <Text style={styles.statusText}>
                            Take a photo matching the target emojis as quickly as possible!

          </Text>
        )}
      </View>

      {/* Countdown timer */}
      <View style={styles.timer}>
        <CountdownTimer />
      </View>

      {/* Event feed */}
      <EventFeed events={events} />

      {/* Emoji buttons */}

      
      <View style={styles.bottom}>
        {roundEmojis.length > 0
          ? roundEmojis
              .filter((e) => emojiStates[e] !== 'locked') // only show unlocked emojis
              .map((e) => (
                <EmojiButton
                  key={e}
                  emoji={e}
                  state={emojiStates[e] || 'idle'}
                  onPress={() => takeAndSendPhoto(e)}
                />
              ))
          : status === 'running' && (
              <Text style={[styles.statusText, { marginBottom: 0 }]}>
                Game in progress. You will automatically join the next round
              </Text>
            )}
      </View>

      {/* Leaderboard modal */}
      <Modal visible={showLeaderboard} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <LeaderboardModal 
            leaderboard={leaderboard.map(([name, points]) => ({ name, points }))} 
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
  timer: { position: 'absolute', top: 40, alignSelf: 'flex-end', padding: 8 },
  statusContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottom: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  startButton: {
    backgroundColor: '#d90827',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  startText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  message: { textAlign: 'center', fontSize: 18, marginBottom: 20 },
  grantButton: { alignSelf: 'center', padding: 12, backgroundColor: '#fff', borderRadius: 12 },
  grantText: { fontWeight: 'bold' },
  feedbackContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
  },
  feedbackText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
