import { Text, View, StyleSheet } from 'react-native';
import { useGameStore } from '@/stores/GameStore';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { useEffect, useState } from 'react';

export function CountdownTimer() {
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const status = useGameStore((state) => state.status);
  const [fill, setFill] = useState(100);
  const [blink, setBlink] = useState(false);

  // Determine total time based on status
  const getTotalTime = () => {
    if (status === 'pre_round') return 10;
    if (status === 'running') return 60;
    return 0;
  };

  // Update fill based on time remaining
  useEffect(() => {
    const totalTime = getTotalTime();
    setFill(totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0);
  }, [timeRemaining, status]);

  // Handle blinking when time <= 10 in running state
  useEffect(() => {
    let interval: NodeJS.Timer;
    if (status === 'running' && timeRemaining <= 10) {
      interval = setInterval(() => setBlink((prev) => !prev), 300);
    } else {
      setBlink(false);
    }
    return () => interval && clearInterval(interval);
  }, [status, timeRemaining]);

  if (status === 'idle') return null;

  return (
    <View style={styles.container}>
      
      <Text style={styles.label}>
        {status === 'pre_round' ? 'New Round In' : status === 'running' ? 'Time left' : ''}
      </Text>
      <AnimatedCircularProgress
        size={75}
        width={10}
        fill={fill}
        rotation={0}
        tintColor={status === 'running' && timeRemaining <= 10 ? '#d90827' : '#d90827'}
        backgroundColor="#3d5875"
        lineCap="round"
        duration={500}
      >
        {() => (
          <View style={styles.inner}>
            <Text style={[styles.time, { color: blink ? 'transparent' : 'white' }]}>
              {timeRemaining}
            </Text>
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
