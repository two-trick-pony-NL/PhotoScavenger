import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { GameEvent } from '@/stores/GameStore';

type Props = {
  events: GameEvent[];
};

export default function EventFeed({ events }: Props) {
  const animations = useRef<Animated.Value[]>([]).current;

  // Ensure we have an Animated.Value for each event
  while (animations.length < events.length) {
    animations.push(new Animated.Value(0));
  }

  useEffect(() => {
    const latestIndex = events.length - 1;
    if (latestIndex >= 0) {
      Animated.sequence([
        Animated.timing(animations[latestIndex], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animations[latestIndex], {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

    }
  }, [events]);

  return (
    <View style={styles.container}>
      {[...events].reverse().map((item, idx) => {
        const index = events.length - 1 - idx; // match animation index
        const animStyle = {
          opacity: animations[index] || 1,
          transform: [
            {
              translateY: animations[index]?.interpolate({
                inputRange: [0, 1],
                outputRange: [5, 0],
              }) || 0,
            },
          ],
        };

        let color = 'white';
        if (item.type === 'uploading') color = '#ffd700';
        if (item.type === 'locked') color = '#00ff00';
        if (item.type === 'round_ended') color = '#ff4500';

        return (
          <Animated.View key={index} style={[styles.eventContainer, animStyle]}>
            <View style={styles.messageBox}>
              <Text style={[styles.eventText, { color }]}>{item.msg}</Text>
            </View>
          </Animated.View>
        );
      })}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 25,
    left: 20,
    width: '80%',
  },
  eventContainer: {
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  messageBox: {
    maxWidth: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  eventText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
