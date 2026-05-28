import { View, Text } from 'react-native';
import { styles } from './styles/SummaryBarStyles';
import type { Theme } from './theme';

interface Props {
  theme: Theme;
  dark: boolean;
}

const items = [
  { icon: '🔥', label: '0 кал', color: '#ff9800' },
  { icon: '💪', label: '0 тренировки', color: '#f44336' },
  { icon: '📚', label: '0 книги', color: '#2196f3' },
];

export default function SummaryBar({ theme, dark }: Props) {
  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[
            styles.chip,
            { backgroundColor: dark ? '#1c1c1e' : `${item.color}18` },
          ]}
        >
          <Text>{item.icon}</Text>
          <Text style={[styles.text, { color: dark ? item.color : item.color }]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
