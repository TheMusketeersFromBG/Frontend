import { View, Text } from 'react-native';
import { styles } from '../styles/components/SummaryBarStyles';
import type { Theme } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  theme: Theme;
  dark: boolean;
  consumed: number;
  burned: number;
  steps: number;
  pages: number;
}

export default function SummaryBar({ dark, consumed, burned, steps, pages }: Props) {
  const { t } = useLanguage();
  const items = [
    { icon: '🥗', label: `${consumed} ${t.consumed}`,                        color: '#4caf50' },
    { icon: '🔥', label: burned > 0 ? `${burned} ${t.burned}` : '—',        color: '#ff9800' },
    { icon: '🚶', label: steps > 0 ? `${steps.toLocaleString()} ${t.steps}` : '—', color: '#2196f3' },
    { icon: '📖', label: pages > 0 ? `${pages} ${t.pages}` : '—',           color: '#9c27b0' },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <View
          key={item.icon}
          style={[styles.chip, { backgroundColor: dark ? '#1c1c1e' : `${item.color}18` }]}
        >
          <Text>{item.icon}</Text>
          <Text style={[styles.text, { color: item.color }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
