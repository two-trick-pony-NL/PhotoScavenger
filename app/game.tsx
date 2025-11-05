import { useLocalSearchParams } from 'expo-router';
import GameScreen from '../components/GameScreen';

export default function GamePage() {
  const params = useLocalSearchParams<{ username: string }>();
  const username = params.username ?? 'Player1';

  return <GameScreen username={username} />;
}
